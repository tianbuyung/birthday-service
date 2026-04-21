import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

import { ConfigModule } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';

import { AppConfig, appConfig } from '@/config/app.config';

type PinoRequest = IncomingMessage & {
  id?: string;
  user?: { id?: string };
};

export const buildTransport = ({
  isProduction,
  logFile,
  errorLogFile,
}: {
  isProduction: boolean;
  logFile: string;
  errorLogFile: string;
}) =>
  isProduction
    ? {
        targets: [
          {
            target: 'pino-roll',
            options: {
              file: logFile,
              mkdir: true,
              size: '10m',
              frequency: 'daily',
              dateFormat: 'yyyy-MM-dd',
            },
            level: 'info',
          },
          {
            target: 'pino-roll',
            options: {
              file: errorLogFile,
              mkdir: true,
              size: '10m',
              frequency: 'daily',
              dateFormat: 'yyyy-MM-dd',
            },
            level: 'error',
          },
          {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:mm/dd/yyyy, h:MM:ss TT',
            },
            level: 'info',
          },
        ],
      }
    : {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          translateTime: 'SYS:mm/dd/yyyy, h:MM:ss TT',
        },
        level: 'debug',
      };

export const LoggerConfig: LoggerModuleAsyncParams = {
  imports: [ConfigModule.forFeature(appConfig)],
  useFactory: (appConf: AppConfig) => {
    const { environment, serviceName } = appConf;
    const isProduction = environment === 'production';
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'app.log');
    const errorLogFile = path.join(logDir, 'error.log');

    const baseLog = (
      req: IncomingMessage,
      res: ServerResponse,
      val: { responseTime: number },
    ) => {
      const pinoReq = req as PinoRequest;
      return {
        req: {
          id: pinoReq.id,
          method: req.method,
          url: req.url,
        },
        userId: pinoReq.user?.id,
        response: {
          statusCode: res.statusCode,
        },
        timing: {
          responseTimeMs: val.responseTime,
        },
      };
    };

    return {
      pinoHttp: {
        base: {
          service: serviceName,
          env: environment,
        },

        genReqId: (req: IncomingMessage) =>
          (req.headers['x-request-id'] as string) || crypto.randomUUID(),

        customSuccessMessage() {
          return 'request completed';
        },

        customErrorMessage() {
          return 'request failed';
        },

        customProps(req: IncomingMessage) {
          return {
            request: {
              ip: req.socket?.remoteAddress,
              userAgent: req.headers['user-agent'],
            },
          };
        },

        customSuccessObject(
          req: IncomingMessage,
          res: ServerResponse,
          val: { responseTime: number },
        ) {
          return baseLog(req, res, val);
        },

        customErrorObject(
          req: IncomingMessage,
          res: ServerResponse,
          err: Error,
          val: { responseTime: number },
        ) {
          return {
            ...baseLog(req, res, val),
            err: {
              type: err.name,
              message: err.message,
            },
          };
        },

        transport: buildTransport({ isProduction, logFile, errorLogFile }),

        level: isProduction ? 'info' : 'debug',
      },
    };
  },
  inject: [appConfig.KEY],
};
