import {
  All,
  Controller,
  DynamicModule,
  Inject,
  Logger,
  Module,
  Next,
  OnApplicationBootstrap,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  defaultBullBoardConfig,
  MODULE_CONFIG_TOKEN,
} from './bull-board.constants';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullModule } from '@nestjs/bull';
import { BullBoardService } from './bull-board.service';
import {
  ApplicationConfig,
  DiscoveryModule,
  HttpAdapterHost,
} from '@nestjs/core';
import { BullMetadataAccessor } from '@nestjs/bull/dist/bull-metadata.accessor';
import {
  BullBoard,
  BullBoardConfig,
  BullBoardModuleConfig,
} from './interfaces';
import { ExpressAdapter as NestExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

@Module({})
export class BullBoardModule implements OnApplicationBootstrap {
  constructor(
    @Inject(MODULE_CONFIG_TOKEN)
    private readonly moduleConfig: BullBoardModuleConfig,
    private readonly app: ApplicationConfig,
    private readonly httpAdapterHost: HttpAdapterHost<NestExpressAdapter>,
  ) {}

  static register(config?: Partial<BullBoardConfig>): DynamicModule {
    const bullBoardConfig: BullBoardConfig = {
      ...defaultBullBoardConfig,
      ...config,
    };

    @Controller(bullBoardConfig.path)
    class BullBoardController {
      constructor(
        @Inject(MODULE_CONFIG_TOKEN)
        private readonly moduleConfig: BullBoardModuleConfig,
        private readonly app: ApplicationConfig,
      ) {}

      @All(['', '*'])
      admin(
        @Request() req: express.Request,
        @Response() res: express.Response,
        @Next() next: express.NextFunction,
      ) {
        const mountPath = `/${this.app.getGlobalPrefix()}/${
          this.moduleConfig.config.path
        }`;
        const router = this.moduleConfig.adapter
          .setBasePath(mountPath)
          .getRouter();
        req.url = req.url.replace(mountPath, '') || '/';
        return router(req, res, next);
      }
    }

    if (bullBoardConfig.guard) {
      UseGuards(bullBoardConfig.guard)(BullBoardController);
    }

    return {
      global: true,
      module: BullBoardModule,
      controllers: [BullBoardController],
      providers: [
        {
          provide: MODULE_CONFIG_TOKEN,
          useFactory: (app: ApplicationConfig) => {
            const serverAdapter = new ExpressAdapter();
            serverAdapter.setBasePath(
              `/${app.getGlobalPrefix()}/${bullBoardConfig.path}`,
            );

            const bullBoard: BullBoard = createBullBoard({
              queues: [],
              serverAdapter,
            });

            return {
              config: bullBoardConfig,
              adapter: serverAdapter,
              board: bullBoard,
            };
          },
          inject: [ApplicationConfig],
        },
        BullBoardService,
        BullMetadataAccessor,
      ],
      imports: [BullModule, DiscoveryModule],
    };
  }

  onApplicationBootstrap() {
    this.httpAdapterHost.httpAdapter.getHttpServer().on('listening', () => {
      const { port, address } = this.httpAdapterHost.httpAdapter
        .getHttpServer()
        .address();
      const hostName = address === '::' ? 'localhost' : address;
      let host = '';
      if (port && address) {
        host = `http://${hostName}:${port}`;
      }
      Logger.log(
        `🦬 Explore bull on the board: ${host}/${this.app.getGlobalPrefix()}/${
          this.moduleConfig.config.path
        }`,
      );
    });
  }
}
