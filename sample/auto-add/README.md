## Description

This example app demonstrates the simplest way to integrate bull-board to nestjs app.

### Setup and running

> **Prequirements:** This example requires redis to be running on default port

1. Install dependencies:

```shell
$ npm i
```

2. Run app

```shell
$ npm start
```

3. Open http://localhost:3000/api. It will create new job:

```json
{
  "id": "1",
  "name": "audio.mp3",
  "data": {},
  "opts": {
    "attempts": 1,
    "delay": 0,
    "timestamp": 1667935908780
  },
  "progress": 0,
  "delay": 0,
  "timestamp": 1667935908780,
  "attemptsMade": 0,
  "stacktrace": [],
  "returnvalue": null,
  "finishedOn": null,
  "processedOn": null
}
```

4. Open http://localhost:3000/api/bull-board