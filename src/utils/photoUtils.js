import html2canvas from 'html2canvas';

/**
 * Get user's browser language
 */
export const getUserLanguage = () => {
  return navigator.language || navigator.userLanguage || 'en';
};

/**
 * Format date according to user's locale
 */
export const formatDate = (date, lang) => {
  return date.toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Create a new photo object
 */
export const createPhotoObject = (imageData, lang) => {
  return {
    id: Date.now(),
    image: imageData,
    date: formatDate(new Date(), lang),
    caption: '',
    isGenerating: true,
    isDeveloping: true,
    position: { x: 0, y: 0 },
    onWall: false
  };
};

/**
 * Convert data URL to Blob
 */
export const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Download photo element as PNG
 */
export const downloadPhotoElement = async (elementId, photoId) => {
  const photoElement = document.getElementById(elementId);
  if (!photoElement) return;

  try {
    const canvas = await html2canvas(photoElement, {
      backgroundColor: '#ffffff',
      scale: 2
    });

    const link = document.createElement('a');
    link.download = `retro-photo-${photoId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Error downloading photo:', error);
  }
};
