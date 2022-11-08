import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';

export interface BullBoard {
  setQueues: (newBullQueues: readonly BaseAdapter[]) => void;
  replaceQueues: (newBullQueues: readonly BaseAdapter[]) => void;
  addQueue: (queue: BaseAdapter) => void;
  removeQueue: (queueOrName: string | BaseAdapter) => void;
}
