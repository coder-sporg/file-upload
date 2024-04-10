import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  // Response,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

import * as fs from 'fs';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    console.log('files', files);
    console.log('body', body);

    // 处理文件上传逻辑
    const fileName = body.name.match(/(.+)\-\d+$/)[1]; // 获取文件名，以 - 数字结尾，如：a.png-1 => a.png

    const chunkDir = `uploads/chunks_${fileName}`;

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }

    // 在 uploads 下创建 chunks_文件名 的目录，把文件复制过去，然后删掉原始文件
    fs.cpSync(files[0].path, `${chunkDir}/${body.name}`); // 同步复制(复制文件源路径, 要复制文件的目标路径)
    fs.rmSync(files[0].path); // 删除文件

    return {
      code: 0,
      message: '文件上传成功！',
    };
  }

  @Get('merge')
  merge(@Query('name') name: string) {
    const chunkDir = `uploads/chunks_${name}`;
    const files = fs.readdirSync(chunkDir);

    files.sort((a, b) => {
      return parseInt(a.match(/\d+$/)[0]) - parseInt(b.match(/\d+$/)[0]); // 文件按照数字排序，注意：顺序一定按照末尾数字进行排序
    });

    let count = 0;
    let startPos = 0;
    files.map((file) => {
      const filePath = `${chunkDir}/${file}`;

      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream(`uploads/${name}`, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          // 在合并完成之后把 chunks 目录删掉
          count++;

          if (count === files.length) {
            fs.rm(
              chunkDir,
              {
                recursive: true, // 递归删除目录
              },
              () => {},
            );
          }
        });

      startPos += fs.statSync(filePath).size; // 获取文件或目录的状态，返回文件大小、文件名、文件类型
    });

    return {
      code: 0,
      message: '文件合并成功！',
      data: `http://localhost:3000/photo/${name}`,
    };
  }

  @Get('photo/:name')
  getPhoto(
    @Param('name') name: string,
    @Res() res: Response, // 这里的 Response 是 express 包下的 Response 类型
  ) {
    const file = fs.createReadStream(`uploads/${name}`);
    return file.pipe(res); // 流处理文件
  }

  @Get('file/:name')
  @Header('Content-Type', 'image/png') // 通过 @Header 设置响应头
  // @Header('Content-Disposition', 'attachment; filename=a.png') // 设置响应头，告诉浏览器下载文件 名称为 a.png
  getFile(
    @Param('name') name: string,
    // @Response({ passthrough: true }) res, // 注意这里的 Response 是 @nestjs/common 包下的 Response 类型
  ): StreamableFile {
    const file = fs.createReadStream(`uploads/${name}`);
    // res.set({  // 默认类型是 application/octet-stream，可以自定义响应类型
    //   'Content-Type': 'image/png',
    // });
    return new StreamableFile(file); // 流处理文件
  }
}
