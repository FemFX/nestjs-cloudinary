import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid, v4 } from 'uuid';
import toStream = require('buffer-to-stream');
import { Readable } from 'stream';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: configService.get('cloud_name'),
      api_key: configService.get('api_key'),
      api_secret: configService.get('api_secret'),
    });
  }

  getImageUrl(publicId: string, options?: any): string {
    return cloudinary.url(publicId, options);
  }

  async upload(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async delete(public_id: string): Promise<any> {
    return await cloudinary.uploader.destroy(public_id);
  }

  async multipleUpload(files: any[]): Promise<any[]> {
    const uploads = [];
    for (const file of files) {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      const upload = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          },
        );

        stream.pipe(uploadStream);
      });

      uploads.push(upload);
    }

    return Promise.all(uploads);
  }
}
// return new Promise((resolve, reject) => {
//   cloudinary.uploader.upload(file.path, (error, result) => {
//     if (error) reject(error);
//     resolve(result);
//   });
// });
