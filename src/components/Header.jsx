import React from 'react';

/**
 * Header component - App title
 */
const Header = () => {
  return (
    <div className="fixed top-4 md:top-8 left-0 right-0 text-center z-10 px-4">
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-amber-900">
        Bao Retro Camera
      </h1>
    </div>
  );
};

export default Header;
