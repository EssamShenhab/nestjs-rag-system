import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { ProjectModule } from 'src/project/project.module';
import { AssetModule } from 'src/asset/asset.module';

@Module({
  imports: [
    ProjectModule,
    AssetModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const rawproject_id = req.params?.project_id;

          const project_id = Array.isArray(rawproject_id)
            ? rawproject_id[0]
            : rawproject_id;

          if (!project_id || !/^[a-zA-Z0-9_-]+$/.test(project_id)) {
            return cb(new Error('Invalid project_id'), '');
          }

          const uploadPath = join(
            process.cwd(),
            'src',
            'assets',
            'files',
            project_id,
          );

          fs.mkdirSync(uploadPath, { recursive: true });

          cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
          const id = randomUUID();

          const cleanedFileName = file.originalname
            .trim()
            .replace(/[^\w.]/g, '')
            .replace(/ /g, '_');

          cb(null, `${id}_${cleanedFileName}`);
        },
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
