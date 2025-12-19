/**
 * Convert a Blob to Base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} Base64 encoded string (without data URI prefix)
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get user's browser language
 * @returns {string} Browser language code
 */
export const getUserLanguage = () => {
  return navigator.language || navigator.userLanguage || 'en';
};

/**
 * Format date according to user's locale
 * @param {Date} date - Date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale) => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Convert image data URL to Blob
 * @param {string} dataUrl - Data URL string
 * @returns {Promise<Blob>} Image blob
 */
export const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};
