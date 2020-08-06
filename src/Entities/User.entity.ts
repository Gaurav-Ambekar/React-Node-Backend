import { Column, Entity, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  PURCHASE = 'purchase',
  SALES = 'sales',
  DATA_ENTRY = 'data entry',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  user_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  user_email: string;

  @Column('varchar', { select: false })
  user_password: string;

  @Column({ type: 'varchar', length: 50 })
  user_fullname: string;

  @Column({ type: 'varchar', length: 50 })
  user_mobile: string;

  @Column({ type: 'enum', enum: UserRole })
  user_role: UserRole;

  @Column()
  user_status: boolean;

  @Column({ type: 'int', default: 0 })
  user_token_version: number;

  @Column('text', { default: '' })
  user_avatar: string;

  @Column('varchar', { length: 36, select: false })
  user_created_by: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    select: false,
  })
  user_created_at: Date;

  @Column('varchar', { length: 36, select: false })
  user_updated_by: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    select: false,
  })
  user_updated_at: Date;
}
