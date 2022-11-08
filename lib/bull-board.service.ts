import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MODULE_CONFIG_TOKEN } from './bull-board.constants';
import { BullMetadataAccessor } from '@nestjs/bull/dist/bull-metadata.accessor';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { NO_QUEUE_FOUND } from '@nestjs/bull/dist/bull.messages';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import {
  BullAdapterOptions,
  BullBoardModuleConfig,
  QueueConfig,
} from './interfaces/config.interfaces';

@Injectable()
export class BullBoardService implements OnModuleInit {
  private readonly logger = new Logger('NestQLBullBoardModule');

  constructor(
    @Inject(MODULE_CONFIG_TOKEN)
    private readonly moduleConfig: BullBoardModuleConfig,
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: BullMetadataAccessor,
  ) {}

  onModuleInit() {
    this.registerQueues();
    this.replaceQueues();
    this.removeQueues();
  }

  private registerQueues() {
    const queues: Queue[] = this.getQueues();

    if (this.moduleConfig.config.autoAdd) {
      const queueAdapters = queues.map(
        (queue: Queue) =>
          new BullAdapter(queue, this.moduleConfig.config.queueOptions),
      );
      this.moduleConfig.board.setQueues(queueAdapters);
    }

    if (this.moduleConfig.config.queues?.add?.length) {
      const manualQueues: BullAdapter[] = this._queueConfigsToAdapters(
        this.moduleConfig.config.queues.add,
      );
      this.moduleConfig.board.setQueues(manualQueues);
    }
  }

  private replaceQueues() {
    if (this.moduleConfig.config.queues?.replace?.length) {
      const queuesToReplace: BullAdapter[] = this._queueConfigsToAdapters(
        this.moduleConfig.config.queues.replace,
      );
      this.moduleConfig.board.setQueues(queuesToReplace);
    }
  }

  private removeQueues() {
    if (this.moduleConfig.config.queues?.remove?.length) {
      const queuesToRemove: BullAdapter[] = this._queueConfigsToAdapters(
        this.moduleConfig.config.queues.remove,
      );
      queuesToRemove.forEach(queue =>
        this.moduleConfig.board.removeQueue(queue),
      );
    }
  }

  private getQueues(): Queue[] {
    const providers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isQueueComponent(
          // NOTE: Regarding the ternary statement below,
          // - The condition `!wrapper.metatype` is because when we use `useValue`
          // the value of `wrapper.metatype` will be `null`.
          // - The condition `wrapper.inject` is needed here because when we use
          // `useFactory`, the value of `wrapper.metatype` will be the supplied
          // factory function.
          // For both cases, we should use `wrapper.instance.constructor` instead
          // of `wrapper.metatype` to resolve processor's class properly.
          // But since calling `wrapper.instance` could degrade overall performance
          // we must defer it as much we can. But there's no other way to grab the
          // right class that could be annotated with `@Processor()` decorator
          // without using this property.
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    return providers.map((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const { name: queueName } =
        this.metadataAccessor.getQueueComponentMetadata(
          // NOTE: We are relying on `instance.constructor` to properly support
          // `useValue` and `useFactory` providers besides `useClass`.
          instance.constructor || metatype,
        );

      return this.getQueue(queueName);
    });
  }

  private getQueue(queueName: string): Queue {
    try {
      return this.moduleRef.get<Queue>(getQueueToken(queueName), {
        strict: false,
      });
    } catch (err) {
      this.logger.error(NO_QUEUE_FOUND(queueName));
      throw err;
    }
  }

  private _queueConfigsToAdapters(queueConfigs: QueueConfig[]): BullAdapter[] {
    return queueConfigs.map((queueConfig: QueueConfig) => {
      if ((queueConfig as BullAdapterOptions).queue) {
        const queue = ((queueConfig as BullAdapterOptions).queue as Queue).name
          ? ((queueConfig as BullAdapterOptions).queue as Queue)
          : this.getQueue((queueConfig as BullAdapterOptions).queue as string);
        return new BullAdapter(
          queue,
          (queueConfig as BullAdapterOptions).options,
        );
      } else if ((queueConfig as Queue).name) {
        return new BullAdapter(
          queueConfig as Queue,
          this.moduleConfig.config.queueOptions,
        );
      } else {
        const queue = this.getQueue(queueConfig as string);
        return new BullAdapter(queue, this.moduleConfig.config.queueOptions);
      }
    });
  }
}
