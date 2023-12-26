const { google } = require('googleapis')
const dotenv = require('dotenv')


dotenv.config()


const oauth2Client = new google.auth.OAuth2(
    process.env.DRIVE_CLIENT_ID,
    process.env.DRIVE_CLIENT_SECRET,
    process.env.DRIVE_REDIRECT_URL
)

oauth2Client.setCredentials({
    refresh_token: process.env.DRIVE_REFRESH_TOKEN
})

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})


exports.drive = drive