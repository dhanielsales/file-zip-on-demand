import archiver, { Archiver } from 'archiver';
import path from 'path';
import fs from 'fs';
import https from 'https';

import { FileSchema } from 'file-lists';

export class CreateZipFile {
  private readonly outputFile: fs.WriteStream;
  private readonly filePath: string;
  private readonly fileDir: string;
  private readonly concurrency: number;

  constructor(identifier: string, concurrency = 2) {
    this.concurrency = concurrency;
    this.fileDir = path.join(__dirname, 'temp', identifier);
    fs.mkdirSync(this.fileDir, { recursive: true });

    this.filePath = path.join(this.fileDir, `${identifier}.zip`);
    this.outputFile = fs.createWriteStream(this.filePath);

    this.outputFile.on('end', () => {
      console.log('Data has been drained');
    });
  }

  public async process(files: FileSchema[]): Promise<string> {
    const archive = this.createArchive();
    archive.pipe(this.outputFile);

    for await (const chunk of this.sliceInChunks(files, this.concurrency)) {
      await this.processFileToBuffer(chunk, archive);
    }

    await archive.finalize();

    return this.filePath;
  }

  public async destroy() {
    this.outputFile.close();

    await fs.promises.rm(this.fileDir, { recursive: true, force: true });
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

    archive.on('entry', entry => {
      fs.unlink(path.join(this.fileDir, entry.name), err => {
        if (err) console.log(err);
      });
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

    return `${fileNameWithoutExtension.replace(/\s+/, '_')}.${fileExtension}`;
  }

  private *sliceInChunks(files: FileSchema[], chunkSize: number): Generator<FileSchema[]> {
    for (let i = 0; i < files.length; i += chunkSize) {
      yield files.slice(i, i + chunkSize);
    }
  }

  private async processFileToBuffer(files: FileSchema[], archive: Archiver): Promise<void> {
    await Promise.all(
      files.map(async file => {
        return await new Promise<void>((resolve, reject) => {
          const fileName = this.getFormatedFilename(file.name);
          const currentFilePath = path.join(this.fileDir, fileName);
          const writableFile = fs.createWriteStream(currentFilePath);

          const request = https.get(file.url, res => {
            res.on('data', chunk => writableFile.write(chunk));
            res.on('error', console.error);
          });

          request.on('close', () => {
            writableFile.close(err => {
              if (err) reject(err);
              archive.append(fs.createReadStream(currentFilePath), { name: fileName });
              resolve();
            });
          });
          request.on('error', reject);
        });
      }),
    );
  }
}
