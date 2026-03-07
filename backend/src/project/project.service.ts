import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ProjectService {
  protected baseDir: string;
  protected filesDir: string;
  protected databaseDir: string;

  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {
    this.baseDir = process.cwd();

    this.filesDir = path.join(this.baseDir, 'src', 'assets', 'files');

    this.databaseDir = path.join(this.baseDir, 'src', 'assets', 'database');
  }

  async getProjectPath(project_id: string): Promise<string> {
    const projectDir = path.join(this.filesDir, project_id);

    try {
      await fs.mkdir(projectDir, { recursive: true });
    } catch (error: any) {
      throw new Error(`Failed to create project directory: ${error.message}`);
    }

    return projectDir;
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const entity = this.projectRepo.create(project);
    return this.projectRepo.save(entity);
  }

  async getProjectOrCreateOne(project_id: number): Promise<Project> {
    let project = await this.projectRepo.findOne({
      where: { project_id },
    });

    if (!project) {
      project = this.projectRepo.create({ project_id });
      project = await this.projectRepo.save(project);
    }

    return project;
  }

  async getAllProjects(page = 1, pageSize = 10) {
    const [projects, total] = await this.projectRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { project_id: 'ASC' },
    });

    return {
      projects,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
