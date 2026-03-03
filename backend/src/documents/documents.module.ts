import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const rawProjectId = req.params?.project_id;

          const projectId = Array.isArray(rawProjectId)
            ? rawProjectId[0]
            : rawProjectId;

          if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
            return cb(new Error('Invalid project_id'), '');
          }

          const uploadPath = join(
            process.cwd(),
            'src',
            'assets',
            'files',
            projectId,
          );

          fs.mkdirSync(uploadPath, { recursive: true });

          cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
          const randomName = Array(16)
            .fill(null)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');

          cb(null, `${randomName}_${file.originalname}`);
        },
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
