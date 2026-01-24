import { registerAs } from '@nestjs/config';
import { StorageConfig } from 'src/interfaces/configs/storage.interface';

export const storageConfig = registerAs(
  'storage',
  (): StorageConfig => ({
    blobSasToken: process.env.BLOB_SAS_TOKEN || '',
    blobSasUrl: process.env.BLOB_SAS_URL || '',
    blobContainerName: process.env.BLOB_CONTAINER_NAME || 'data',
  }),
);
