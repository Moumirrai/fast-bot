import { Core } from './struct/Core';
import express from 'express';

const client = new Core();

(async () => {
  await client.main();
})();