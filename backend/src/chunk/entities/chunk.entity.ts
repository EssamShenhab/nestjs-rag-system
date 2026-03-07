import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';

import { Project } from '../../project/entities/project.entity';
import { Asset } from '../../asset/entities/asset.entity';

@Entity('chunks')
@Index('ix_chunk_project_id', ['chunk_project_id'])
@Index('ix_chunk_asset_id', ['chunk_asset_id'])
export class Chunk {
  @PrimaryGeneratedColumn()
  chunk_id: number;

  @Column({
    type: 'char',
    length: 36,
    unique: true,
  })
  @Generated('uuid')
  chunk_uuid: string;

  @Column('text')
  chunk_text: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  chunkMetadata: Record<string, any>;

  @Column('int')
  chunk_order: number;

  @Column()
  chunk_project_id: number;

  @Column()
  chunk_asset_id: number;

  @ManyToOne(() => Project, (project) => project.chunks)
  @JoinColumn({ name: 'chunk_project_id' })
  project: Project;

  @ManyToOne(() => Asset, (asset) => asset.chunks)
  @JoinColumn({ name: 'chunk_asset_id' })
  asset: Asset;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
