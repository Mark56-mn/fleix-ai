import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processQuery } from './index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

app.post('/chat', async (req, res) => {
  const query = String(req.body?.query ?? '');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  await processQuery(query, {
    write: (chunk) => res.write(chunk),
    end: () => res.end()
  });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`fleix server running on http://localhost:${port}`);
});
