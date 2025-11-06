import * as React from 'react';
import { Chat } from '@google/genai';
import { Message, Role, Exercise, ProficiencyLevel, TutorExpression } from './types';
import { startChat, generateSpeech, generateExercise, checkExerciseAnswer } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TutorAvatar from './components/TutorAvatar';
import PracticeView from './components/PracticeView';

const App: React.FC = () => {
  // App mode and level state
  const [mode, setMode] = React.useState<'chat' | 'practice'>('chat');
  const [level, setLevel] = React.useState<ProficiencyLevel>('B2');

  // Chat state
  const [chat, setChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = React.useState<boolean>(true);
  
  // Practice state
  const [currentExercise, setCurrentExercise] = React.useState<Exercise | null>(null);
  const [exerciseFeedback, setExerciseFeedback] = React.useState<string | null>(null);
  const [isPracticeLoading, setIsPracticeLoading] = React.useState<boolean>(false);

  // Shared state
  const [error, setError] = React.useState<string | null>(null);
  const [isTutorSpeaking, setIsTutorSpeaking] = React.useState<boolean>(false);
  const [tutorExpression, setTutorExpression] = React.useState<TutorExpression>('idle');
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const initializeChat = React.useCallback(async () => {
    try {
      setTutorExpression('thinking');
      setIsChatLoading(true);
      setError(null);
      const newChat = startChat(level);
      setChat(newChat);

      const initialResponseStream = await newChat.sendMessageStream({ message: "Hola" });
      let content = "";
      for await (const chunk of initialResponseStream) {
        content += chunk.text;
      }
      setMessages([{ role: Role.MODEL, content }]);
      setTutorExpression('idle');
    } catch (e) {
      console.error(e);
      setError("Failed to initialize chat. Please check your API key and refresh the page.");
      setTutorExpression('idle');
    } finally {
      setIsChatLoading(false);
    }
  }, [level]); // Re-initialize chat when level changes

  React.useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleFetchNewExercise = React.useCallback(async () => {
    setIsPracticeLoading(true);
    setTutorExpression('thinking');
    setError(null);
    setExerciseFeedback(null);
    try {
        const exercise = await generateExercise(level);
        setCurrentExercise(exercise);
    } catch (e) {
        console.error(e);
        setError("Failed to fetch a new exercise. Please try again.");
    } finally {
        setIsPracticeLoading(false);
        setTutorExpression('idle');
    }
  }, [level]); // Re-fetch exercise when level changes

  const handleNewConversation = () => {
    if (mode === 'chat') {
        setMessages([]);
        initializeChat();
    } else {
        handleFetchNewExercise();
    }
  };

  const handleModeChange = (newMode: 'chat' | 'practice') => {
    setMode(newMode);
    if (newMode === 'practice' && !currentExercise) {
        handleFetchNewExercise();
    }
  };
  
  const handleLevelChange = (newLevel: ProficiencyLevel) => {
    setLevel(newLevel);
    // The useEffect listening to `level` will automatically handle re-initialization
  };

  const playAudio = (audioBuffer: AudioBuffer, isHappyResult = false) => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    setIsTutorSpeaking(true);
    setTutorExpression('talking');
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
        setIsTutorSpeaking(false);
        if (isHappyResult) {
            setTutorExpression('happy');
        } else {
            setTutorExpression('idle');
        }
    };
    source.start();
  };

  const initAudioContext = () => {
     if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Could not create AudioContext", e);
            setError("Your browser does not support audio playback.");
        }
    }
  }

  const handleSendMessage = async (userMessage: string) => {
    if (!chat) return;
    initAudioContext();
    const newUserMessage: Message = { role: Role.USER, content: userMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsChatLoading(true);
    setTutorExpression('thinking');
    setError(null);
    
    setMessages((prevMessages) => [...prevMessages, { role: Role.MODEL, content: "" }]);
    let fullResponse = "";
    let audioPlayed = false;

    try {
      const responseStream = await chat.sendMessageStream({ message: userMessage });

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.role === Role.MODEL) {
                const updatedMessages = [...prevMessages];
                updatedMessages[prevMessages.length - 1] = { ...lastMessage, content: lastMessage.content + chunkText };
                return updatedMessages;
            }
            return prevMessages;
        });
      }

      if (fullResponse.trim() && audioContextRef.current) {
        const cleanText = fullResponse.replace(/\*\*(.*?)\*\*/g, '$1').replace(/¡Ojo a esto!:/g, 'Ojo a esto.').replace(/Un tip de músico:/g, 'Un tip de músico.').replace(/\n/g, ' ');
        const audioBuffer = await generateSpeech(cleanText, audioContextRef.current);
        if (audioBuffer) {
            playAudio(audioBuffer);
            audioPlayed = true;
        }
      }

    } catch (e) {
      console.error(e);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage.role === Role.MODEL) {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = { ...lastMessage, content: errorMessage };
            return updatedMessages;
        }
        return [...prevMessages, { role: Role.MODEL, content: errorMessage }];
      });
    } finally {
      setIsChatLoading(false);
      if (!audioPlayed) {
          setTutorExpression('idle');
      }
    }
  };

  const handleCheckAnswer = async (userAnswer: string) => {
    if (!currentExercise) return;
    initAudioContext();
    setIsPracticeLoading(true);
    setTutorExpression('thinking');
    setError(null);
    let audioPlayed = false;
    try {
        let feedback = await checkExerciseAnswer(currentExercise, userAnswer, level);
        const isCorrect = feedback.startsWith('[CORRECT]');
        if (isCorrect) {
            feedback = feedback.replace('[CORRECT]', '').trim();
        }
        setExerciseFeedback(feedback);

        if (feedback.trim() && audioContextRef.current) {
            const cleanTextForSpeech = feedback.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '').replace(/\n/g, ' ');
            const audioBuffer = await generateSpeech(cleanTextForSpeech, audioContextRef.current);
            if (audioBuffer) {
                playAudio(audioBuffer, isCorrect);
                audioPlayed = true;
            }
        }
    } catch (e) {
        console.error(e);
        setError("Failed to check your answer. Please try again.");
    } finally {
        setIsPracticeLoading(false);
         if (!audioPlayed) {
            setTutorExpression('idle');
        }
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
        <TutorAvatar expression={tutorExpression} />
        <div className="flex h-screen flex-1 flex-col">
            <Header 
                onNewConversation={handleNewConversation} 
                currentMode={mode} 
                onModeChange={handleModeChange}
                currentLevel={level}
                onLevelChange={handleLevelChange}
            />
            <div className="flex-1 flex flex-col overflow-y-auto">
                {mode === 'chat' ? (
                    <>
                        <ChatWindow messages={messages} isLoading={isChatLoading} />
                        {error && (
                            <div className="container mx-auto max-w-3xl px-4 py-2">
                                <p className="text-center text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        <MessageInput onSendMessage={handleSendMessage} isLoading={isChatLoading} />
                    </>
                ) : (
                    <PracticeView 
                        exercise={currentExercise}
                        feedback={exerciseFeedback}
                        isLoading={isPracticeLoading}
                        onCheckAnswer={handleCheckAnswer}
                        onNewExercise={handleFetchNewExercise}
                        error={error}
                    />
                )}
            </div>
        </div>
    </div>
  );
};

export default App;