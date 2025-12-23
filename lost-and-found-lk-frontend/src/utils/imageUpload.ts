/**
 * Cloudinary Image Upload Utility
 * 
 * Uploads images to Cloudinary (free tier: 25 GB storage, 25 GB bandwidth/month)
 * 
 * Setup Required:
 * 1. Sign up at https://cloudinary.com/users/register/free
 * 2. Get your Cloud Name from Dashboard
 * 3. Create an unsigned upload preset:
 *    - Go to Settings → Upload → Upload presets
 *    - Create new unsigned preset
 *    - Set folder to "lost-found-lk" (optional)
 * 4. Add to .env file:
 *    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads an image file to Cloudinary and returns the public URL
 * @param file - The image file to upload
 * @param folder - Optional folder path in Cloudinary (default: 'lost-found-lk')
 * @returns Promise<string> - The public HTTPS URL
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = 'lost-found-lk'
): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary credentials not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment variables.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder); // Organize images in folder
  formData.append('tags', 'lost-found-lk'); // Optional: tag images for easier management

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to upload image: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.secure_url; // HTTPS URL
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Uploads multiple images to Cloudinary in parallel
 * @param files - Array of image files to upload
 * @param folder - Optional folder path in Cloudinary (default: 'lost-found-lk')
 * @returns Promise<string[]> - Array of public HTTPS URLs
 */
export const uploadMultipleImagesToFirebase = async (
  files: File[],
  folder: string = 'lost-found-lk'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Failed to upload images. Please try again.');
  }
};

// Keep the old function name for backward compatibility, but it uses Cloudinary now
export const uploadImageToFirebase = uploadImageToCloudinary;
