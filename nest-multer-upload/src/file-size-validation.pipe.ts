import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  // 限制单文件大小为 10k
  transform(value: Express.Multer.File) {
    if (value.size > 10 * 1024) {
      throw new HttpException('文件大于 10kb', HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
