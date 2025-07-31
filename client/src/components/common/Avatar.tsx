import React from 'react';

// A simple hash function to get a number from a string for color selection.
const stringToHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A curated list of Tailwind CSS background colors for avatars.
const avatarColors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
  'bg-rose-500'
];

interface AvatarProps {
  name: string;
  className?: string;
}

/**
 * Renders a circular avatar with the first initial of a name.
 * The background color is consistently chosen based on the name.
 * Falls back to a generic user icon if the name is not provided.
 */
export const Avatar: React.FC<AvatarProps> = ({ name, className = 'w-10 h-10' }) => {
  if (!name) {
    // Fallback to a generic user icon if name is missing
    return (
      <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gray-600 text-white`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
      </div>
    );
  }
  
  const initial = name.charAt(0).toUpperCase();
  const colorIndex = stringToHash(name) % avatarColors.length;
  const bgColor = avatarColors[colorIndex];

  return (
    <div
      className={`${className} ${bgColor} flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold`}
      aria-hidden="true" // Decorative, as the name is typically displayed nearby
    >
      <span className="text-lg">{initial}</span>
    </div>
  );
};
