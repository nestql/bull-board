// Injection tokens
export const MODULE_CONFIG_TOKEN = 'BULL_BOARD_MODULE_CONFIG_TOKEN';

export const defaultBullBoardConfig = {
  path: 'bull-board',
  autoAdd: true,
  queueOptions: {},
  queues: {
    add: [],
    remove: [],
    replace: [],
  },
  guard: undefined,
};
