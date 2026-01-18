import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'atlas-africa'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed'));
          }
        }
      ).end(file.buffer);
    });
  }
}

export default new UploadService();
