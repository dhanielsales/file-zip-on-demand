import { nanoid } from 'nanoid';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

import { parseSpaceToUnderscore } from '@worker/utils/parse-space-to-underscore';
import { getBufferFromFile } from '@worker/utils/get-buffer-from-file';

import { FileSchema } from '@shared/file-schema';

interface ProcessedFile {
  data: Buffer;
  file: FileSchema;
}

export class CreateZipFile {
  private readonly outputFile: fs.WriteStream;
  private readonly filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, 'temp', `${nanoid(12)}.zip`);
    this.outputFile = fs.createWriteStream(this.filePath);

    this.outputFile.on('end', () => {
      console.log('Data has been drained');
    });
  }

  public async process(files: FileSchema[]): Promise<string> {
    const archive = this.createArchive();
    archive.pipe(this.outputFile);

    for await (const file of this.processFileToBuffer(files)) {
      archive.append(file.data, { name: this.getFormatedFilename(file.file.name) });
    }

    await archive.finalize();

    return this.filePath;
  }

  public async destroy() {
    this.outputFile.close();
    await fs.promises.unlink(this.filePath);
  }

  private createArchive() {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.log(`Warning: ENOENT - ${err}`);
      } else {
        throw err;
      }
    });

    archive.on('error', err => {
      throw err;
    });

    return archive;
  }

  private getFormatedFilename(fileName: string): string {
    const filenameArr: Array<string> = fileName.split('.');
    const fileExtension = filenameArr.pop();
    const fileNameWithoutExtension = filenameArr.join('.');

    return `${parseSpaceToUnderscore(fileNameWithoutExtension)}.${fileExtension}`;
  }

  private async *processFileToBuffer(files: FileSchema[]): AsyncGenerator<ProcessedFile> {
    for (const file of files) {
      const buffer = await getBufferFromFile(file.url);

      yield {
        data: buffer,
        file,
      };
    }
  }
}
