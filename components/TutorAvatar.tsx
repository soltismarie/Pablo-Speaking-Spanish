import * as React from 'react';
import { TutorExpression } from '../types';

interface TutorAvatarProps {
  expression: TutorExpression;
}

// Fix: Define the custom element's type, including the `play` method, to resolve JSX error.
interface GoogleCodelab3dAvatarElement extends HTMLElement {
    play: (animation: string, options?: { loop: boolean }) => void;
}

// Extend the JSX.IntrinsicElements interface to include the custom element
declare global {
    namespace JSX {
      interface IntrinsicElements {
        // Fix: Correctly define the custom element properties to be recognized by TypeScript's JSX parser.
        // The 'model-url' property is defined as part of the element's attributes.
        'google-codelab-3d-avatar': React.DetailedHTMLProps<
          React.HTMLAttributes<GoogleCodelab3dAvatarElement> & {
            'model-url': string;
          },
          GoogleCodelab3dAvatarElement
        >;
      }
    }
}

const expressionToAnimationMap: Record<TutorExpression, string> = {
    idle: 'Idle',
    talking: 'Talking_1',
    happy: 'Happy',
    thinking: 'Thinking',
};

const TutorAvatar: React.FC<TutorAvatarProps> = ({ expression }) => {
    // Fix: Correctly type the ref to match the custom element for type safety.
    const avatarRef = React.useRef<GoogleCodelab3dAvatarElement | null>(null);
    const currentAnimationRef = React.useRef<string>(expressionToAnimationMap.idle);

    React.useEffect(() => {
        const avatar = avatarRef.current;
        if (!avatar) return;

        const handleAnimationEnd = () => {
             // If the animation that just ended was NOT idle or talking, go back to idle.
            if (currentAnimationRef.current !== expressionToAnimationMap.idle && currentAnimationRef.current !== expressionToAnimationMap.talking) {
                 const idleAnimation = expressionToAnimationMap.idle;
                 avatar.play(idleAnimation, { loop: true });
                 currentAnimationRef.current = idleAnimation;
            }
        };
        
        // This event listener is crucial for transitioning back to idle.
        avatar.addEventListener('ended', handleAnimationEnd);

        return () => {
            avatar.removeEventListener('ended', handleAnimationEnd);
        };
    }, []);

    React.useEffect(() => {
        const avatar = avatarRef.current;
        if (!avatar || !avatar.play) return;

        const newAnimation = expressionToAnimationMap[expression];
        
        // Only switch if the animation is different
        if (newAnimation !== currentAnimationRef.current) {
            currentAnimationRef.current = newAnimation;
            const loop = (expression === 'idle' || expression === 'talking');
            avatar.play(newAnimation, { loop });
        }

    }, [expression]);

  return (
    <aside className="hidden h-full w-1/3 flex-col items-center justify-center bg-teal-800 p-6 text-white md:flex lg:w-1/4">
      <h2 className="mb-4 text-3xl font-bold">Pablo</h2>
      <div className="relative h-80 w-80">
        {/* Fix: Resolved TS error by correctly defining the custom element type and added the required model-url property. */}
        <google-codelab-3d-avatar 
          ref={avatarRef}
          model-url="https://storage.googleapis.com/codelab-3d-avatar/models/pablo.glb"
        ></google-codelab-3d-avatar>
      </div>
      <p className="mt-4 text-center text-teal-200">
        ¡Hola! ¡Soy Pablo!
      </p>
    </aside>
  );
};

export default TutorAvatar;
