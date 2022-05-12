import { FileSchema } from '@shared/file-schema';

const fakedDbData: Array<FileSchema> = [
  {
    id: '1',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/bla-nome.png',
    name: 'bla-nome.png',
    mimeType: 'image/png',
  },
  {
    id: '2',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/foo-nome.png',
    name: 'foo-nome.png',
    mimeType: 'image/png',
  },
  {
    id: '3',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/large-file-four.pdf',
    name: 'large-file-four.pdf',
    mimeType: 'application/pdf',
  },
  {
    id: '4',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/large-file-three.pdf',
    name: 'large-file-three.pdf',
    mimeType: 'application/pdf',
  },
  {
    id: '5',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/large-file-two.pdf',
    name: 'large-file-two.pdf',
    mimeType: 'application/pdf',
  },
  {
    id: '6',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/large-file.pdf',
    name: 'large-file.pdf',
    mimeType: 'application/pdf',
  },
  {
    id: '7',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/nome-bar.jpg',
    name: 'nome-bar.jpg',
    mimeType: 'image/jpeg',
  },
  {
    id: '8',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/nome-bla.png',
    name: 'nome-bla.png',
    mimeType: 'image/png',
  },
  {
    id: '9',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/nome-foo.png',
    name: 'nome-foo.png',
    mimeType: 'image/png',
  },
  {
    id: '10',
    url: 'https://my-temp-s3.s3.sa-east-1.amazonaws.com/tmj.mp4',
    name: 'tmj.mp4',
    mimeType: 'video/mp4',
  },
];

const fakedDb = {
  findMany: async (fileIds?: string[]) => {
    return new Promise<FileSchema | FileSchema[]>(resolve => {
      if (!fileIds) {
        resolve(fakedDbData);
        return;
      }

      const finded = fakedDbData.filter(({ id }) => fileIds.includes(id));
      resolve(finded as FileSchema[]);
    });
  },
};

export const FileStore = {
  async findByIds(ids: string[]): Promise<FileSchema[]> {
    const data = (await fakedDb.findMany(ids)) as FileSchema[];
    return data;
  },
};
