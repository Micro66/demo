import React from 'react';
import { Camera } from 'lucide-react';

/**
 * MobileCaptureButton - Floating capture button for mobile devices
 */
const MobileCaptureButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="md:hidden fixed top-20 right-4 z-30 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-gray-400 text-white p-4 rounded-full shadow-lg transition-colors"
      aria-label="Take Photo"
    >
      <Camera size={24} />
    </button>
  );
};

export default MobileCaptureButton;
