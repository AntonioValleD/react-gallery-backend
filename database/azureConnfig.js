const dotenv = require('dotenv')
dotenv.config()

const { BlobServiceClient } = require("@azure/storage-blob")

// Configura las credenciales de tu cuenta de almacenamiento de Azure
const blobServiceClient = BlobServiceClient
  .fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)


module.exports = {
  blobServiceClient
} 