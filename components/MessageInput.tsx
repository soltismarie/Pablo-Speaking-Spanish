import * as React from 'react';
import { SendIcon, MicrophoneIcon, StopCircleIcon } from './Icons';

// Fix for TypeScript error: Add type definitions for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      // Fix: Ensure recording state is reset on error.
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  // Fix: Removed `isRecording` from dependencies to prevent re-creating the recognition object on every state change.
  // The object should be created only once.
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-transparent pt-2 pb-4">
      <div className="container mx-auto max-w-3xl px-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-xl border border-teal-300 bg-white/80 backdrop-blur-sm p-2 shadow-lg focus-within:ring-2 focus-within:ring-amber-500"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Escribe en español..."}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent p-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || !recognitionRef.current}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <StopCircleIcon className="h-6 w-6 text-red-500" /> : <MicrophoneIcon className="h-6 w-6" />}
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white transition-colors enabled:hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;