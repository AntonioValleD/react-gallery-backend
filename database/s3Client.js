const { S3 } = require("@aws-sdk/client-s3")
const dotenv = require("dotenv")


dotenv.config()

const s3Client = new S3({
    forcePathStyle: true,
    endpoint: process.env.ENDPOINT || "",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.SPACES_KEY || "",
        secretAccessKey: process.env.SPACES_SECRET || ""
    }
})


exports.s3Client = s3Client