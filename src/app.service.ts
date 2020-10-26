import {Injectable, OnModuleDestroy, OnModuleInit, Logger as NestLogger} from '@nestjs/common';
import {ApiModelProperty} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";
import {KafkaService} from "@ale-nestlib/kafka";
import {AppConfig} from "./app.config";
import {inspect} from "util";
const Logger = new NestLogger('AppService', false);

@Injectable()
export class AppService implements OnModuleDestroy, OnModuleInit{
  constructor(private config:AppConfig, private kafka: KafkaService) {
  }
  onModuleInit(): any {
    Logger.log(`ModuleInit`);
    this.kafka.addChannel(this.config.APP_NAME).listenToTopic({topic:this.config.APP_NAME});
    this.kafka.addChannel('ANNOUNCE').listenToTopic({topic:'ANNOUNCE'}).then(res=>{
      this.kafka.getChannel('ANNOUNCE').send(
          {appName:this.config.APP_NAME, appVersion: this.config.APP_VERSION, topic:this.config.APP_NAME, partition:0},
          'ANNOUNCE'
      ).catch(err=>{Logger.error(`App ${this.config.APP_NAME} not announced`, inspect(err))})
    });
  }
  onModuleDestroy(): any {
    Logger.log(`ModuleDestroy`);
  }

  getAppName(): string {
    return `Demo-Edgehub Application ${this.config.APP_NAME} version ${this.config.APP_VERSION}`;
  }
}

export class BotParams {
  @ApiModelProperty({description: 'Name of the bot and the pm2 process'})  name: string = '';
  @ApiModelProperty({description: 'Owner of bot'})  contact: string= '';
  @ApiModelProperty({description: 'Login of bot'})  loginEmail: string= '';
  @ApiModelProperty({description: 'Password of bot'})  password: string= '';
  @ApiModelProperty({description: 'Process id of bot'})  pm_id: number = 0;
  @ApiModelProperty({description: 'Autostart the bot process'})  autoStartProcess: boolean = false;
  @ApiModelProperty({description: 'Process status of bot(ON/OFF)'})  status: boolean = false;
  @ApiModelProperty({description: 'Name of the js script file to launch the bot'})  scriptName: string = 'main.js';
  @ApiModelProperty({description: 'Force the MISEP server to be Rainbow company master'})  isMaster: boolean = false;
  @ApiModelProperty({required: false, description: 'Enable Dialogflow Natural Language Processing'})  enableNLP: boolean = false;
  @ApiModelProperty({required: false, description: 'Rainbow status of bot'})  rainbowStatus: string = 'UNKNOWN';
}


export class BotControlParams {
  @ApiModelProperty({description: 'botconfig ID'})  id: string;
  @ApiModelProperty({description: 'Control action', enum: ['start', 'stop', 'restart']})  action: string;
}
