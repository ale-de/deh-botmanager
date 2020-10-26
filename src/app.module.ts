import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {AppConfig} from "./app.config";
import {Arangodb} from "./services/arangodb";
import {KafkaModule} from "@ale-nestlib/kafka";

export enum COLLECTIONS {BOTS='bots'}

@Module({
  imports: [KafkaModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: AppConfig,
      useValue: new AppConfig(`/app/env_file`), //__dirname+`/.env`
    },
    {provide:Arangodb,
      useValue:new Arangodb('botmanager',
          COLLECTIONS,process.env.DB_LOGIN, process.env.DB_PW, 'arangodb.demo-edgehub.svc.cluster.local')
    },
  ],
})
export class AppModule {}
