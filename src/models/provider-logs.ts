import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProviderLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  providerName: string;

  @Column()
  vrm: string;

  @Column()
  requestUrl: string;

  @Column()
  requestDuration: number;

  @Column()
  responseCode: number;

  @Column()
  requestDate: Date;

  @Column()
  errorCode?: string;

  @Column()
  errorMessage?: string;
}
