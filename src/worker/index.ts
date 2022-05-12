import { format } from 'date-fns';
import express from 'express';
import fs from 'fs';

import { CreateZipFile } from './create-zip-file.ts';
import { small, medium, large, extraLarge } from './file-lists';

// Setup Server
const app = express();
app.use(express.json());

// Simple Routes
app.get('/create-zip', async (request, response, next) => {
  const files = small;
  // const files = medium;
  // const files = large;
  // const files = extraLarge;

  const zipFile = new CreateZipFile();
  const filePath = await zipFile.process(files);
  const fileName = `${format(new Date(), 'dd-MM-yyyy-HHmm')}-something.zip`;
  const status = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  response.status(200);
  response.setHeader('Content-Type', 'application/octet-stream');
  response.setHeader('Content-Length', status.size);
  response.setHeader('Transfer-Encoding', 'chunked');

  fileStream.on('open', () => {
    response.attachment(fileName);
    fileStream.pipe(response);
  });

  fileStream.on('end', () => {
    zipFile.destroy();
  });

  fileStream.on('error', err => {
    next(err);
  });
});

// Start Server
app.listen(4000, () => console.log('Worker -> Server started on port 4000'));
