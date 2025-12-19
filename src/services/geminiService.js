import { GEMINI_API_KEY, GEMINI_API_URL } from '../constants';
import { blobToBase64 } from '../utils';

/**
 * Generate AI caption for an image using Gemini API
 * @param {Blob} imageBlob - The image blob
 * @param {string} language - Target language for the caption
 * @returns {Promise<string>} Generated caption
 */
export const generateImageCaption = async (imageBlob, language) => {
  try {
    const base64Image = await blobToBase64(imageBlob);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Generate a warm, short blessing or nice comment about this photo in ${language} language. Keep it under 20 words and make it heartfelt.`
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
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Beautiful moment captured!';
  } catch (error) {
    console.error('Error generating caption:', error);
    return 'A wonderful memory!';
  }
};
