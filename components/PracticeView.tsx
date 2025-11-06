import * as React from 'react';
import { Exercise } from '../types';
import { SendIcon } from './Icons';

interface PracticeViewProps {
  exercise: Exercise | null;
  feedback: string | null;
  isLoading: boolean;
  onCheckAnswer: (answer: string) => void;
  onNewExercise: () => void;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
    </div>
);

const PracticeView: React.FC<PracticeViewProps> = ({ exercise, feedback, isLoading, onCheckAnswer, onNewExercise, error }) => {
    const [answer, setAnswer] = React.useState('');

    React.useEffect(() => {
        // Clear answer when a new exercise is loaded
        setAnswer('');
    }, [exercise]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim() && !isLoading) {
            onCheckAnswer(answer.trim());
        }
    };

    const feedbackWithBreaks = feedback?.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="container mx-auto max-w-3xl h-full flex flex-col">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-teal-200 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold text-teal-800 mb-1">Practice Exercise</h2>
                    <p className="text-sm text-teal-600 mb-4 capitalize">
                        {exercise ? exercise.type.replace(/-/g, ' ') : 'Loading...'}
                    </p>
                    
                    {isLoading && !exercise ? <LoadingSpinner /> : (
                        exercise && (
                            <div className="bg-teal-50 border border-teal-200 p-4 rounded-md mb-4">
                                <p className="text-teal-900 text-base">{exercise.question}</p>
                            </div>
                        )
                    )}

                    <form onSubmit={handleSubmit} className="mt-auto">
                         <div className="flex items-center gap-2 rounded-xl border border-teal-300 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-amber-500">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                disabled={isLoading || !exercise}
                                className="flex-1 resize-none bg-transparent p-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !answer.trim()}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white transition-colors enabled:hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                                aria-label="Check Answer"
                            >
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
                
                {(isLoading && answer) && (
                    <div className="mt-4 p-4 rounded-lg bg-white/70 text-center">
                        <p className="text-sm text-teal-700">Checking your answer...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-100 text-center border border-red-200">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
                
                {feedback && !isLoading && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-100 border border-amber-200">
                        <h3 className="font-semibold text-amber-800 mb-2">Feedback</h3>
                        <div className="text-sm text-stone-700" dangerouslySetInnerHTML={{ __html: feedbackWithBreaks || '' }} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default PracticeView;