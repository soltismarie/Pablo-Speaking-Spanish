import * as React from 'react';
import { Message, Role } from '../types';
import { PabloAvatarIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-amber-500 text-white'
    : 'bg-white text-gray-800 shadow-sm border border-teal-200';
  
  const contentWithLineBreaks = message.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className={`my-2 flex w-full items-end gap-2 ${wrapperClasses}`}>
        {!isUser && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                <PabloAvatarIcon className="h-8 w-8" />
            </div>
        )}
      <div
        className={`max-w-xs rounded-2xl px-4 py-3 sm:max-w-md md:max-w-lg ${bubbleClasses}`}
      >
        <p className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: contentWithLineBreaks }} />
      </div>
    </div>
  );
};

export default ChatMessage;