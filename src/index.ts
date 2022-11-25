import { Core } from './struct/Core';
import express from 'express';

const client = new Core();

(async () => {
  expressServer();
  await client.main();
})();


async function expressServer() {
  const app = express();
  const port = 8080;
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}