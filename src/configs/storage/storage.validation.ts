import * as Joi from 'joi';

export const storageValidation = {
  BLOB_SAS_TOKEN: Joi.string()
    .required()
    .description('Blob SAS Token for storage access')
    .error(new Error('BLOB_SAS_TOKEN is required')),

  BLOB_SAS_URL: Joi.string()
    .uri()
    .required()
    .description('Blob SAS URL for storage access')
    .error(new Error('BLOB_SAS_URL is required')),

  BLOB_CONTAINER_NAME: Joi.string()
    .required()
    .description('Blob Container Name')
    .default('data')
    .error(new Error('BLOB_CONTAINER_NAME is required')),
};
