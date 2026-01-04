'use server';

import { UploadImage } from '@/cloudinary/upload-image';

export async function sendImageAction(formData: FormData) {
  const image = formData.get('image') as File;
  if (!image) {
    throw new Error('No image provided');
  }

  try {
    const { secure_url } = await UploadImage(image, 'chat-images');
    return { secure_url };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}
