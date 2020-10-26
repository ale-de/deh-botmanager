import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {Injectable, Logger as NestLogger} from "@nestjs/common";
import {AppConfig} from "./app.config";
const Logger = new NestLogger('MAIN', false);
let swStats = require('swagger-stats');
const version = process.env.APP_VERSION;
const name = process.env.APP_NAME;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = app.get(AppConfig);
  const allDocOptions = new DocumentBuilder()
      .setTitle('Alcatel-Lucent Enterprise EUNO - Demo EdgeHub')
      .setDescription(`<h2>Bot Manager</h2>
                        <link rel="icon" type="image/png" href="favicon-32x32.png" />
`)
      .setVersion(`${env.version} - ${env.NODE_ENV}`)
      .addServer(`/${(env.NODE_ENV=='production')?env.SWAGGER_BASEPATH:''}`)
      .setContact("Dirk Evrard","",'dirk.evrard@al-enterprise.com')
      .addBearerAuth()
      .build();
  const allDocument = SwaggerModule.createDocument(app, allDocOptions, {
    include:[AppModule]});
  SwaggerModule.setup('api', app, allDocument,{
    customSiteTitle:'ALE-EUNO Demo EdgeHub',
    customfavIcon:__dirname+'/favicon-32x32.png',
    customCss:`
    .swagger-ui .topbar { display: none }
    .models {display: none !important}
    `
  });
  app.use(swStats.getMiddleware({}));
  app.enableShutdownHooks();
  await app.listen(env.PORT);
  Logger.log(`Bootstrapped on port ${env.PORT} ${name} version ${version}`, 'MAIN')
}
bootstrap();
