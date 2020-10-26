import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  Inject,
  UseGuards,
  Request,
  OnModuleDestroy, OnModuleInit
} from '@nestjs/common';
import {AppService, BotParams} from './app.service';
import {ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiParam, ApiQuery} from '@nestjs/swagger';
import {notImplementedRestError, RestRetMsgClass} from "./services/errorHandler";

import {Logger as NestLogger} from "@nestjs/common";
import {AppConfig} from "./app.config";
const Logger = new NestLogger('AppController', false);

@Controller('bots')
export class AppController implements OnModuleDestroy, OnModuleInit {
  constructor(private readonly appService: AppService) {}

  async onModuleDestroy() {
    Logger.log(`Destroying AppController`)
    return true;
  }

  async onModuleInit() {
    Logger.log(`Init AppController`)
    return true;
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({summary: 'Create Rainbow bot', description: 'Create Rainbow bot under the Bot manager'})
  @ApiResponse({
    status: 201,
    description: 'The bot has been successfully created.',
    type: BotParams,
  })
  @ApiTags('Bots')
  @HttpCode(201)
  async createBot(@Body() params: BotParams, @Request() req) {
    return notImplementedRestError('0','createBot: Not yet implemented')
  }

  @Put('/:botConfigId/control')
  @ApiBearerAuth()
  @ApiOperation({summary: 'Control Rainbow bot process', description: 'Control the Rainbow bot pm2 process (stop, (re)start) under the Bot manager'})
  @ApiResponse({
    status: 201,
    description: 'The control action on the bot was succesfull',
    type: RestRetMsgClass,
  })
  @ApiTags('Bots')
  @ApiParam({ name: 'botConfigId', type: String, required:true, description:'Id of the bot config entry' })
  @ApiQuery({ name: 'controlAction', type: String, enum: ['pm-start', 'pm-restart', 'pm-stop', 'rb-start', 'rb-restart', 'rb-stop'], required:true, description:'Action to be performed on Bot' })
  @HttpCode(201)
  async controlBot(@Param('botConfigId') id: string, @Query('controlAction') action: string, @Request() req ) {

    /*let [e,r] = await to(this.botService.controlBot(id, req[AUTH_OBJECT].payload.login, action));
    if (r) {return r}
    else {return e}
    */
    return notImplementedRestError('0','controlBot: Not yet implemented')
  }

  /*
  @Get()
  getAppName(): string {
    return this.appService.getAppName();
  }
  */

  @Get()
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get list of Rainbow bots', description: 'Provide Rainbow and process details of the bot'})
  @ApiResponse({
    status: 201,
    description: 'List of pm2 processes with Rainbow status',
    type: RestRetMsgClass,
  })
  @ApiTags('Bots')
  @HttpCode(201)
  async listAllBots(@Request() req) {
    /*let [e,r] = await to(this.botService.getList(req[AUTH_OBJECT].payload.login));
    if (r) {return r}
    else {return e}*/
    return notImplementedRestError('0','listAllBots: Not yet implemented')

  }

  @Post('/guestaccount/:expiration')
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get Rainbow guest account', description: 'Provide a Rainbow guest account with expiration time'})
  @ApiParam({ name: 'expiration', type: String, required:true, description:'Number of seconds before the guest account expires.' })
  @ApiResponse({
    status: 201,
    description: 'Rainbow guest credentials',
    type: RestRetMsgClass,
  })
  @ApiTags('Bots')
  @HttpCode(201)
  async createGuestAccount(@Param('expiration') expiration, @Request() req) {
    /*let [e,r] = await to(this.botService.getGuestAccount(req[AUTH_OBJECT].payload.login, expiration));
    if (r) {return r}
    else {return e}*/
    return notImplementedRestError('0','createGuestAccount: Not yet implemented')
  }

  @Get('/guestaccount')
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get all Rainbow guest account', description: 'Get all active Rainbow guest account'})
  @ApiResponse({
    status: 201,
    description: 'Rainbow guest accounts',
    type: RestRetMsgClass,
  })
  @ApiTags('Bots')
  @HttpCode(201)
  async getAllGuestAccount( @Request() req) {
    return notImplementedRestError('0','getAllGuestAccount: Not yet implemented')
  }
}
