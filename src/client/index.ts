import express from 'express';
import { FileStore } from './fabeDb';

// Setup Server
const app = express();
app.use(express.json());

// Simple Routes
app.post('/download-zip', async (request, response) => {
  const { files } = request.body;

  const result = await FileStore.findByIds(files);

  response.send(result);
});

// Start Server
app.listen(3000, () => console.log('Client -> Server started on port 3000'));
