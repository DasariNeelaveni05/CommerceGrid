const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload a buffer or file stream to Cloudinary.
 * @param {Buffer|Stream} file - file buffer
 * @param {string} folder - Cloudinary folder path
 * @returns {{ url, publicId }}
 */
exports.uploadImage = (fileBuffer, folder = 'commercegrid/products', mimeType = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    // Fallback if Cloudinary is not configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_CLOUD_NAME.includes('your_') ||
      process.env.CLOUDINARY_API_KEY.includes('your_')
    ) {
      const base64 = fileBuffer.toString('base64');
      const url = `data:${mimeType};base64,${base64}`;
      return resolve({
        url,
        publicId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by publicId.
 */
exports.deleteImage = async (publicId) => {
  if (!publicId || publicId.startsWith('local_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};
