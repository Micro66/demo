import React from 'react';

/**
 * Instructions component - How to use guide
 */
const Instructions = () => {
  return (
    <div className="hidden md:block fixed bottom-8 right-8 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs z-10">
      <h3 className="text-2xl font-bold text-amber-900 mb-2">How to Use</h3>
      <ul className="text-lg text-amber-800 space-y-1">
        <li>• Click the button to take a photo</li>
        <li>• Drag photos to the wall</li>
        <li>• Double-click text to edit</li>
        <li>• Hover for more options</li>
      </ul>
    </div>
  );
};

export default Instructions;
