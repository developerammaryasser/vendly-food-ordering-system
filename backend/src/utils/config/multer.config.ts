import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

interface CustomMulterOptions {
  destination: string;
  allowedMimeTypes?: string[]; 
  maxFileSize?: number;
}

export const getMulterOptions = ({
  destination,
  allowedMimeTypes = ['image/'],
  maxFileSize = 5 * 1024 * 1024,
}: CustomMulterOptions): MulterOptions => {
  return {
    storage: diskStorage({
      destination: `./uploads/${destination}`,
      filename: (req, file, cb) => {
        const prefix = `${Math.round(Math.random() * 1000000)}`;
        const newFilename = `${prefix}-${file.originalname}`;
        cb(null, newFilename);
      },
    }),

    fileFilter: (req, file, cb) => {
      const isAllowed = allowedMimeTypes.some(
        (type) => file.mimetype.startsWith(type) || file.mimetype === type,
      );

      if (!isAllowed) {
        return cb(
          new BadRequestException(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },

    limits: {
      fileSize: maxFileSize,
    },
  };
};
