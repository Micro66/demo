import React from 'react';
import { motion } from 'framer-motion';

const filters = [
  { name: 'Normal', class: '', icon: '○' },
  { name: 'Grayscale', class: 'grayscale', icon: '◐' },
  { name: 'Sepia', class: 'sepia', icon: '☀' },
  { name: 'Vintage', class: 'sepia contrast-125 brightness-90', icon: '✦' },
  { name: 'High Contrast', class: 'contrast-150', icon: '◈' },
  { name: 'Warm', class: 'sepia-50 saturate-150 brightness-105', icon: '♨' },
  { name: 'Cool', class: 'hue-rotate-180 saturate-75 brightness-105', icon: '❄' },
  { name: 'Dramatic', class: 'contrast-125 saturate-150', icon: '★' },
];

export function PhotoFilters({ currentFilter, onFilterChange, disabled = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-3 max-w-[90vw]"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => onFilterChange(filter.class)}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]
              ${currentFilter === filter.class
                ? 'bg-amber-500 text-white shadow-lg scale-105'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-lg">{filter.icon}</span>
            <span className="text-xs font-medium whitespace-nowrap">{filter.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function applyFilterToImage(imageDataUrl, filterClass) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply filter
      if (filterClass) {
        const filterString = filterClass
          .split(' ')
          .map((cls) => {
            switch (cls) {
              case 'grayscale':
                return 'grayscale(100%)';
              case 'sepia':
                return 'sepia(100%)';
              case 'sepia-50':
                return 'sepia(50%)';
              case 'contrast-125':
                return 'contrast(125%)';
              case 'contrast-150':
                return 'contrast(150%)';
              case 'brightness-90':
                return 'brightness(90%)';
              case 'brightness-105':
                return 'brightness(105%)';
              case 'saturate-150':
                return 'saturate(150%)';
              case 'saturate-75':
                return 'saturate(75%)';
              case 'hue-rotate-180':
                return 'hue-rotate(180deg)';
              default:
                return '';
            }
          })
          .filter(Boolean)
          .join(' ');
        ctx.filter = filterString || 'none';
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

export default PhotoFilters;
