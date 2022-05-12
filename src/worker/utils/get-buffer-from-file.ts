import axios from 'axios';

export async function getBufferFromFile(url: string): Promise<Buffer> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  return Buffer.from(new Uint8Array(response.data));
}
