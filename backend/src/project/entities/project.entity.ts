import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Chunk } from '../../chunk/entities/chunk.entity';
import { Asset } from '../../asset/entities/asset.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  project_id: number;

  @Column({
    type: 'uuid',
    unique: true,
    generated: 'uuid',
  })
  project_uuid: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Chunk, (chunk) => chunk.project, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  chunks: Chunk[];

  @OneToMany(() => Asset, (asset) => asset.project, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  assets: Asset[];
}
