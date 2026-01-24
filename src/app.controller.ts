import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators';
import { StorageService } from './common/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { memoryStorage } from 'multer';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health-check')
  healthCheck() {
    return { status: 'OK' };
  }

  // @Get('test-time-out')
  // test() {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       resolve('test');
  //     }, 40000);
  //   });
  // }

  //test upload via azure blob storage
  @Public()
  @Post('test-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 512 * 1024 * 1024 }, //512 mb
    }),
  )
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: {
      folder: string;
    },
  ) {
    const fileUrl = await this.storageService.uploadFilePath(
      data.folder,
      file.buffer,
      file.fieldname + '-' + Date.now(),
      file.mimetype.split('/')[1],
    );
    return {
      fileUrl,
    };
  }

  //test download folder from azure blob storage
  @Public()
  @Get('test-download')
  async testDownload(@Query('folder') folder: string, @Res() res: Response) {
    const zipBuffer = await this.storageService.downloadBlobFolder(folder);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${folder}.zip"`,
    });
    res.send(zipBuffer);
  }
}
