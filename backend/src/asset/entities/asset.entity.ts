import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Project } from '../../project/entities/project.entity';
import { Chunk } from '../../chunk/entities/chunk.entity';

@Entity('assets')
@Index('ix_asset_project_id', ['asset_project_id'])
@Index('ix_asset_type', ['asset_type'])
export class Asset {
  @PrimaryGeneratedColumn()
  asset_id: number;

  @Column({
    type: 'uuid',
    generated: 'uuid',
    unique: true,
  })
  asset_uuid: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  asset_type: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  asset_name: string;

  @Column('int')
  asset_size: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  asset_config: Record<string, any>;

  @Column()
  asset_project_id: number;

  @ManyToOne(() => Project, (project) => project.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asset_project_id' })
  project: Project;

  @OneToMany(() => Chunk, (chunk) => chunk.asset)
  chunks: Chunk[];

  @CreateDateColumn()
  asset_created_at: Date;

  @UpdateDateColumn()
  asset_updated_at: Date;
}
