import fs from 'fs';

import express from 'express';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';

import { CreateZipFile } from './create-zip-file.ts';
import {
  small,
  // medium,
  // large,
  // extraLarge,
  // oneLargeFile,
} from './file-lists';

// Setup Server
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname });
});

// Simple Routes
app.get('/create-zip', async (request, response, next) => {
  const zipFileName = nanoid(12);
  console.time(zipFileName);

  console.log('Generated zip file with key:', zipFileName);

  request.on('close', async () => {
    console.timeEnd(zipFileName);
    await zipFile.destroy();
    console.log('Request closed with key:', zipFileName);
  });

  const files = small;
  // const files = medium;
  // const files = large;
  // const files = extraLarge;
  // const files = oneLargeFile;

  const zipFile = new CreateZipFile(zipFileName, 3);
  const filePath = await zipFile.process(files);
  const fileName = `${format(new Date(), 'dd-MM-yyyy-HHmm')}-something.zip`;
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
});

// Start Server
app.listen(4000, () => console.log('Server started on port 4000'));
