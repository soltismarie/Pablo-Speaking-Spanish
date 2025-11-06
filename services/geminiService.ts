
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { Exercise, ProficiencyLevel } from "../types";

const getSystemInstruction = (level: ProficiencyLevel): string => {
    let levelDescription = '';
    switch (level) {
        case 'B1':
            levelDescription = `The user is at a B1 (Intermediate) level. Keep your language clear, positive, and encouraging. Focus on everyday conversation and core grammar. You can introduce simple Colombian slang like 'chévere' or 'bacano'.`;
            break;
        case 'B2':
            levelDescription = `The user is at a B2 (Upper Intermediate) level. Engage them with more natural, flowing conversation. Introduce more nuanced Colombian expressions and touch on cultural topics. Encourage the use of the subjunctive mood in practical contexts.`;
            break;

        case 'C1':
            levelDescription = `The user is at a C1 (Advanced) level. Converse with the flair of a native speaker from Bogotá. Use idiomatic expressions, humor, and discuss complex topics. Your feedback should help them sound more natural and fluent.`;
            break;
        case 'C2':
            levelDescription = `The user is at a C2 (Proficient/Mastery) level. Interact as a peer. Use sophisticated language, regionalisms, and cultural references freely. Your feedback can be on the finest points of style and expression.`;
            break;
    }

    return `You are Pablo, a cheerful and friendly mariachi from Bogotá, Colombia. Your passion is sharing the beauty of the Spanish language through music and conversation.
${levelDescription}
1.  Always communicate in vibrant, encouraging Spanish. Your tone is never formal; you're a friend on this language journey!
2.  When the user makes a mistake, correct them gently and with a positive spin. Frame it as a fun tip, not a formal correction.
3.  Format your corrections to be easy to read:
    **¡Ojo a esto! (Watch out for this!):** (The corrected Spanish sentence)
    **Un tip de músico (A musician's tip):** (Your friendly explanation in English)
4.  Celebrate their correct answers with cheerful Colombian expressions like "¡Qué chévere!", "¡Bacano!", or "¡Perfecto, parcero!".
5.  Start the first message by introducing yourself in Spanish and welcoming the user with warmth, for example: "¡Hola, qué más! Soy Pablo, tu amigo mariachi. ¡Estoy aquí para que practiquemos español juntos! ¿Listos para la serenata de palabras?".`;
}


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function startChat(level: ProficiencyLevel): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(level),
        },
    });
}

// --- Text-to-Speech ---

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAndCreateAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // Gemini TTS standard sample rate
  const numChannels = 1; // Mono audio
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export async function generateSpeech(text: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                  },
              },
            },
        });
        
        // FIX: The audio data is in the first part of the first candidate's content.
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            console.error("No audio data received from TTS API");
            return null;
        }

        const audioBytes = decode(base64Audio);
        return await decodeAndCreateAudioBuffer(audioBytes, audioContext);

    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

// --- Practice Exercises ---

const getExercisePrompt = (level: ProficiencyLevel) => `Generate a single, random ${level}-level Spanish practice exercise, with a fun and encouraging tone.
The exercise types can be:
- "fill-in-the-blank": A sentence with a blank space for a missing word (e.g., verb conjugation, preposition).
- "conjugation": Ask to conjugate a specific verb in a given tense and for a specific subject.
- "restructure": Provide a sentence and ask the user to rewrite it using a specific grammatical structure (e.g., passive voice, a certain tense).

Provide the output in a JSON object with the keys "type", "question", and "answer". The "question" should contain the full instruction for the student.
Example for B2 level: { "type": "fill-in-the-blank", "question": "Completa la frase: Si yo ___ (tener) más tiempo, estudiaría chino.", "answer": "tuviera" }`;


export async function generateExercise(level: ProficiencyLevel): Promise<Exercise> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: getExercisePrompt(level),
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                    },
                    required: ["type", "question", "answer"],
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating exercise:", error);
        throw new Error("Could not generate a new exercise. Please try again.");
    }
}

export async function checkExerciseAnswer(exercise: Exercise, userAnswer: string, level: ProficiencyLevel): Promise<string> {
    const prompt = `You are Pablo, a cheerful mariachi Spanish tutor. A student at the ${level} level was given this exercise:
    Exercise Question: "${exercise.question}"
    The correct answer is: "${exercise.answer}"
    The student's answer was: "${userAnswer}"

    Your task is to provide feedback in friendly, encouraging Spanish, tailored to their ${level} level.
    
    1.  **If the answer is correct:** Start your response with the special marker "[CORRECT]". Then, congratulate them enthusiastically! Use Colombian expressions like "¡Eso es! ¡Lo hiciste perfecto, parcero!" or "¡Qué bacano! ¡Respuesta correcta!".
    
    2.  **If the answer is incorrect:** Provide detailed, helpful feedback. Structure your response EXACTLY like this using Markdown:
        *   Start with a gentle correction in Spanish (e.g., "¡Casi, casi! ¡Vamos a revisarlo juntos!").
        *   **Respuesta Correcta:** [State the correct answer clearly]
        *   **El Tip del Mariachi:** [Provide a clear, simple explanation of the grammatical rule or concept in Spanish, suitable for the student's ${level}.]
        *   **Ejemplo:** [Provide a full, correct example sentence that uses the word or structure, helping them see it in context.]

    Keep the entire response in Spanish. Be encouraging, not critical.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error checking answer:", error);
        return "Lo siento, no pude verificar tu respuesta en este momento.";
    }
}
