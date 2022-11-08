import { QueueAdapterOptions } from '@bull-board/api/dist/typings/app';
import { Queue } from 'bull';
import { Type } from '@nestjs/passport/dist/interfaces';
import { IAuthGuard } from '@nestjs/passport/dist/auth.guard';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoard } from './bull-board.interfaces';

export type QueueIdentity = Queue | string;

export interface BullAdapterOptions {
  queue: QueueIdentity;
  options?: Partial<QueueAdapterOptions>;
}

export type QueueConfig = BullAdapterOptions | QueueIdentity;

export interface BullBoardConfig {
  /* Path where to mount board */
  path: string;
  /*
   * Scan bull module and add all queues to the board. Exclude selected queues by using `queues.remove`
   * @example
   * ```
   * // add all queues to board
   * BullBoardModule.register({ queues: { autoAdd: true }})
   *
   * // add all except specified queues to board
   * BullBoardModule.register({
   *   queues: { autoAdd: true, remove: [somePrivateQueue, "anotherPrivateQueueName"] },
   * })
   * ```
   * */
  autoAdd: boolean;
  /*
   * Bypass options to `QueueAdapter` when `autoAdd` enabled. Specified option will be applied to each queue like this
   * ```
   * new BullAdapter(someOtherQueue, , { allowRetries: false })
   * ```
   * To specify different options use `queues.replace`
   * */
  queueOptions: Partial<QueueAdapterOptions>;
  queues: {
    /*
     * Manually add queues to the board
     * @example
     * ```
     * BullBoardModule.register({
     *   queues: {
     *     add: [
     *       { queue: someQueue, options: { readOnlyMode: true } },
     *       secondQueue,
     *       'thirdQueueName',
     *     ],
     *   },
     * })
     * ```
     * */
    add: QueueConfig[];
    /*
     * Manually remove queues from the board. Useful with `queues.autoAdd: true`
     * @example
     * ```
     * BullBoardModule.register({
     *   queues: { autoAdd: true, remove: [somePrivateQueue, "anotherPrivateQueueName"] },
     * })
     * ```
     * */
    remove: QueueConfig[];
    /*
     * Manually replace queues on the board. Use with `queues.autoAdd: true` to set `QueueAdapter` options for specified queues
     * @example
     * ```
     * BullBoardModule.register({
     *   queues: {
     *     autoAdd: true,
     *     replace: [{ queue: someQueue, options: { readOnlyMode: true } }],
     *   },
     * })
     * ```
     * */
    replace: QueueConfig[];
  };
  guard?: Type<IAuthGuard>;
}

export interface BullBoardModuleConfig {
  config: BullBoardConfig;
  adapter: ExpressAdapter;
  board: BullBoard;
}
