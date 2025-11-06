import * as React from 'react';
import { RefreshIcon, PabloAvatarIcon } from './Icons';
import { ProficiencyLevel } from '../types';

interface HeaderProps {
  onNewConversation: () => void;
  currentMode: 'chat' | 'practice';
  onModeChange: (mode: 'chat' | 'practice') => void;
  currentLevel: ProficiencyLevel;
  onLevelChange: (level: ProficiencyLevel) => void;
}

const Header: React.FC<HeaderProps> = ({ onNewConversation, currentMode, onModeChange, currentLevel, onLevelChange }) => {
  const getButtonClasses = (mode: 'chat' | 'practice') => {
    const baseClasses = "px-3 py-1.5 text-sm font-semibold rounded-md transition-colors";
    const activeClasses = "bg-amber-500 text-white shadow-sm";
    const inactiveClasses = "text-teal-900 hover:bg-teal-200";
    return `${baseClasses} ${currentMode === mode ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-teal-500/90 backdrop-blur-md shadow-lg border-b border-teal-600">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <PabloAvatarIcon className="h-9 w-9" />
          <h1 className="text-xl font-bold text-white md:text-2xl">
            Pablo
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-teal-200/50 p-1 border border-teal-400">
                <button onClick={() => onModeChange('chat')} className={getButtonClasses('chat')}>
                    Chat
                </button>
                <button onClick={() => onModeChange('practice')} className={getButtonClasses('practice')}>
                    Practice
                </button>
            </div>
             <div>
                <label htmlFor="level-select" className="sr-only">Proficiency Level</label>
                <select 
                    id="level-select"
                    value={currentLevel}
                    onChange={(e) => onLevelChange(e.target.value as ProficiencyLevel)}
                    className="rounded-md border-teal-300 bg-white py-1.5 pl-2 pr-8 text-sm font-semibold text-teal-800 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                    <option value="B1">Level B1</option>
                    <option value="B2">Level B2</option>
                    <option value="C1">Level C1</option>
                    <option value="C2">Level C2</option>
                </select>
            </div>
            <button
              onClick={onNewConversation}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              aria-label="New Conversation or Exercise"
            >
              <RefreshIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{currentMode === 'chat' ? 'New Chat' : 'New Exercise'}</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;