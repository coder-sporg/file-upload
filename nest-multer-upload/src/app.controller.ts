import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { storage } from './my-file-storage';
import { FileSizeValidationPipe } from './file-size-validation.pipe';
import { MyFileValidator } from './my-file-validator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload-single')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads', // 设置上传文件的目录
    }),
  )
  uploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File, // 自定义验证管道
    @Body() body: any,
  ) {
    console.log('body', body);
    console.log('file', file);
    return 'Uploaded file successfully';
  }

  @Post('upload-two')
  @UseInterceptors(
    FilesInterceptor('file', 2, {
      dest: 'uploads', // 设置上传文件的目录
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    console.log('body', body);
    console.log('file', files);
    return 'Uploaded files successfully';
  }

  @Post('upload-multiple')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file1', maxCount: 2 },
        { name: 'file2', maxCount: 2 },
      ],
      {
        dest: 'uploads', // 设置上传文件的目录
      },
    ),
  )
  uploadMultipleFiles(
    @UploadedFiles()
    files: {
      file1?: Express.Multer.File[];
      file2?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    console.log('files', files);
    console.log('body', body);
    return 'Uploaded files successfully';
  }

  @Post('upload-any')
  @UseInterceptors(
    AnyFilesInterceptor({
      // dest: 'uploads', // 设置上传文件的目录
      storage, // 自定义存储方式 修改文件名
    }),
  )
  uploadAnyFiles(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    console.log('files', files);
    console.log('body', body);
    return 'Uploaded files successfully';
  }

  @Post('upload-validate')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  uploadValidate(
    @UploadedFile(
      new ParseFilePipe({
        exceptionFactory: (err) => {
          throw new HttpException('Invalid file ' + err, 400); // 自己修改错误信息
        },
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 }), // 文件大小校验 20KB
          new FileTypeValidator({ fileType: 'image/jpeg' }), // 文件类型校验
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('file', file);
    console.log('body', body);
    return 'Uploaded file successfully';
  }

  @Post('upload-validate1')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  uploadValidate2(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MyFileValidator({})], // 自己实现的 validator，继承 FileValidator
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('file', file);
    console.log('body', body);
    return 'Uploaded file successfully';
  }
}
