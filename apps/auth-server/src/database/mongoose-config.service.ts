import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  private readonly logger = new Logger('Mongoose');

  constructor(private configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('DATABASE_URL'),
      dbName: this.configService.get<string>('DATABASE_NAME'),
      user: this.configService.get<string>('DATABASE_USERNAME'),
      pass: this.configService.get<string>('DATABASE_PASSWORD'),

      connectionFactory: (connection: Connection) => {
        connection.once('open', () => {
          this.logger.log(
            '✅ MongoDB connection established from MongooseConfigService',
          );
        });
        connection.on('error', (error) => {
          this.logger.error(
            '❌ MongoDB connection error from MongooseConfigService',
            error,
          );
        });
        return connection;
      },
    };
  }
}
