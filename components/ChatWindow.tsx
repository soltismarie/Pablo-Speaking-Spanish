import * as React from 'react';
import { Message, Role } from '../types';
import ChatMessage from './ChatMessage';
import { PabloAvatarIcon } from './Icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="my-2 flex w-full items-end gap-2">
         <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
            <PabloAvatarIcon className="h-8 w-8" />
        </div>
        <div className="max-w-xs rounded-2xl bg-white px-4 py-3 text-gray-800 shadow-sm sm:max-w-md md:max-w-lg border border-teal-200">
            <div className="flex items-center justify-center space-x-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-teal-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-teal-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-teal-400"></div>
            </div>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const showTypingIndicator = isLoading && messages[messages.length - 1]?.role === Role.USER;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4"
    >
      <div className="container mx-auto max-w-3xl">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>
    </div>
  );
};

export default ChatWindow;