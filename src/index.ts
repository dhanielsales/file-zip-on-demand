import fs from 'fs';

import express, { Router, Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';

import { CreateZipFile } from './create-zip-file.ts';
import { small, medium, large, extraLarge, oneLargeFile, FileSchema } from './file-lists';

// Setup Server
const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.sendFile('views/index.html', { root: __dirname });
});

async function handleRequest(
  type: string,
  files: FileSchema[],
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const zipFileName = nanoid(12);
  console.time(zipFileName);

  console.log('Generated zip file with key:', zipFileName);

  request.on('close', async () => {
    console.timeEnd(zipFileName);
    await zipFile.destroy();
    console.log('Request closed with key:', zipFileName);
  });

  const zipFile = new CreateZipFile(zipFileName, 3);
  const filePath = await zipFile.process(files);
  const fileName = `${type}-${format(new Date(), 'dd-MM-yyyy-HHmm')}.zip`;
  const stats = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  response.status(200);
  response.setHeader('Content-Type', 'application/octet-stream');
  response.setHeader('Content-Length', stats.size);
  response.setHeader('Transfer-Encoding', 'chunked');

  fileStream.on('open', () => {
    response.attachment(fileName);
    fileStream.pipe(response);
  });

  fileStream.on('end', async () => {
    await zipFile.destroy();
    console.log('Ended process with key:', zipFileName);
    console.timeEnd(zipFileName);
  });

  fileStream.on('error', err => {
    next(err);
  });
}

const router = Router();

// Simple Routes
router.get('/small', async (request, response, next) => {
  await handleRequest('small', small, request, response, next);
});

router.get('/medium', async (request, response, next) => {
  await handleRequest('medium', medium, request, response, next);
});

router.get('/large', async (request, response, next) => {
  await handleRequest('large', large, request, response, next);
});

router.get('/extraLarge', async (request, response, next) => {
  await handleRequest('extraLarge', extraLarge, request, response, next);
});

router.get('/oneLargeFile', async (request, response, next) => {
  await handleRequest('oneLargeFile', oneLargeFile, request, response, next);
});

app.use('/create-zip', router);

// Start Server
app.listen(4000, () => console.log('Server started on port 4000'));
