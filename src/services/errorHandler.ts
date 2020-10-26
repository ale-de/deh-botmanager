import  {ApiModelProperty, ApiModelPropertyOptional} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";
import {BadRequestException, ConflictException, NotFoundException, NotImplementedException, UnauthorizedException} from '@nestjs/common';
import {inspect} from 'util';
import {Logger as NestLogger} from "@nestjs/common";
import {AppConfig} from "../app.config";
const Logger = new NestLogger('AppController', false);

export interface RetMsg {
    status: 'ERROR' | 'OK',
    error?: string,
    msg?: string,
    data?: any
}

export interface RestRetMsgInterface {
    status: string | 'OK' | 'ERROR',
    data?:any,
    error?: string,
    msg?: string,
    code?: number,
    errCode?: string
}

export class RestRetMsgClass implements RestRetMsgInterface{
    @ApiModelProperty({description:'Response status, OK | ERROR'})  status = 'OK';
    @ApiModelPropertyOptional({description:'optional data field'})  data?= {};
    @ApiModelPropertyOptional({description:'Optional error field'})  error?='';
    @ApiModelPropertyOptional({description:'Optional Message field'})  msg?='';
    @ApiModelPropertyOptional({description:'Optional return code'})  code?=0;
    @ApiModelPropertyOptional({description:'Optional Error Code'})  errCode?=ERROR.NOERROR;
}

export enum ERROR { NOERROR='ERROR.NOERROR', ERROR='ERROR.ERROR'}

export function notFoundRestError(code,message) {
    let err = new RestRetMsgClass();
    err.status = 'ERROR';
    err.code = code;
    err.errCode = ERROR.ERROR;
    err.msg = message;
    return new NotFoundException(err, message);
}

export function badRequestRestError(code,message) {
    let err = new RestRetMsgClass();
    err.status = 'ERROR';
    err.code = code;
    err.errCode = ERROR.ERROR;
    err.msg = message;
    return new BadRequestException(err);
}

export function unauthorizedRestError(code,message) {
    let err = new RestRetMsgClass();
    err.status = 'ERROR';
    err.code = code;
    err.errCode = ERROR.ERROR;
    err.msg = message;
    return new UnauthorizedException(err);
}

export function conflictRestError(code,message) {
    let err = new RestRetMsgClass();
    err.status = 'ERROR';
    err.code = code;
    err.errCode = ERROR.ERROR;
    err.msg = message;
    //Logger.error("conflictRestError",JSON.stringify(err),inspect(this.constructor.name));
    return new ConflictException(err);
}

export function notImplementedRestError(code,message?) {
    let err = new RestRetMsgClass();
    err.status = 'ERROR';
    err.code = code;
    err.errCode = ERROR.ERROR;
    err.msg = message?message:"This API call is not yet implemented";
    return new NotImplementedException(err);
}

export function returnRestMsg(code,message, data?) {
    let msg = new RestRetMsgClass();
    msg.code = code;
    msg.msg = message;
    msg.data = data?data:{};
    return msg;
}
