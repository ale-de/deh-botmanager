import * as Joi from 'joi';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as  dotenvParseVariables from 'dotenv-parse-variables';
import {Injectable, Logger as NestLogger} from "@nestjs/common";
import {inspect} from "util";
const Logger = new NestLogger('AppConfig', false);

@Injectable()
export class AppConfig {
    private envConfig: AppConfig.Env;

    constructor(filePath?: string) {
        Logger.log(`Load Config parameters ...`);
        this.loadConfig(filePath);
        Logger.log({message:`Config parameters loaded`, config:this.envConfig});
    }

    loadConfig(filePath) {
        let config = {};
        if (filePath) {
            try {
                config = dotenv.parse(fs.readFileSync(filePath));
            }catch (e) {
                Logger.error(`Failed to load config file ${filePath}`);
                config={};
            }
        }
        if (config!={}){
            //Logger.log({message:`Read env from environment`,env: process.env});
            config = Object.assign(config, process.env);
            for (let el of Object.keys((config))) {if (!Object.keys(AppConfig.ENV_VAR).includes(el)) delete config[el]}
        } else {
            Logger.log(`Did not load config from env`);
        }
        config = dotenvParseVariables(config);
        //Logger.log({message:`parsed config`,config: config});
        this.envConfig = this.validateInput(config);
    }

    private validateInput(envConfig: any): AppConfig.Env {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            NODE_ENV: Joi.string()
                .valid('development', 'production', 'test')
                .default('development'),
            version: Joi.string().default('0.0.0'),
            APP_NAME: Joi.string().default(process.env.APP_NAME?process.env.APP_NAME:'Default AppName'),
            APP_VERSION: Joi.string().default('Unknown'),
            SWAGGER_BASEPATH: Joi.string().default('api'),
            PORT: Joi.number().default(3000),
        });

        const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
        if (error) {
            Logger.error(`Config file validation error: ${error.message}`, this.constructor.name);
        }
        return validatedEnvConfig;
    }

    get NODE_ENV(): string {return this.envConfig.NODE_ENV};
    get APP_VERSION(): string {return this.envConfig.APP_VERSION};
    get APP_NAME(): string {return this.envConfig.APP_NAME};
    get version(): string {return this.envConfig.version};
    get SWAGGER_BASEPATH(): string {return this.envConfig.SWAGGER_BASEPATH};
    get PORT(): number {return this.envConfig.PORT}
}

export namespace AppConfig {
    export interface Env {
        [key: string]: any;
    }
    export enum ENV_VAR {
        NODE_ENV='NODE_ENV', version='version', APP_VERSION = 'APP_VERSION', APP_NAME = 'APP_NAME',
        SWAGGER_BASEPATH='SWAGGER_BASEPATH', PORT='PORT'
    }
}
