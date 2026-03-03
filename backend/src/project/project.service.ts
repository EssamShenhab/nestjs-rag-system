import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class ProjectService {
  private readonly filesDir = join(process.cwd(), 'src', 'assets', 'files');

  async getProjectPath(project_id: string): Promise<string> {
    const projectDir = join(this.filesDir, project_id);

    try {
      await fs.mkdir(projectDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create project directory: ${error.message}`);
    }

    return projectDir;
  }
}
