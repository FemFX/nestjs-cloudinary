import {
  Controller,
  Get,
  Param,
  Res,
  UseInterceptors,
  Post,
  UploadedFile,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':publicId')
  getImageUrl(@Param('publicId') publicId: string, @Res() res: Response) {
    const imageUrl = this.imageService.getImageUrl(publicId);
    return res.redirect(imageUrl);
  }
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.upload(file);
  }
  @Delete(':publicId')
  async delete(@Param('publicId') publicId: string) {
    return await this.imageService.delete(publicId);
  }
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files[]'))
  async uploadImages(@UploadedFiles() files: any[]): Promise<any[]> {
    return this.imageService.multipleUpload(files);
  }
}
