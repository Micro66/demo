import { DEFAULT_CAPTION, FALLBACK_CAPTION } from '../constants';

/**
 * Get Gemini API key from environment variables
 */
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob) => {
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
 * Generate caption for an image using Gemini AI
 * @param {Blob} imageBlob - The image blob
 * @param {string} lang - The language for the caption
 * @returns {Promise<string>} - The generated caption
 */
export const generateImageCaption = async (imageBlob, lang) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('Gemini API key not configured');
    return DEFAULT_CAPTION;
  }

  try {
    const base64Image = await blobToBase64(imageBlob);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Generate a warm, short blessing or nice comment about this photo in ${lang} language. Keep it under 20 words and make it heartfelt.`
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: base64Image
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || DEFAULT_CAPTION;
  } catch (error) {
    console.error('Error generating caption:', error);
    return FALLBACK_CAPTION;
  }
};
