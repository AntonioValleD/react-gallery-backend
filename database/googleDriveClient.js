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

if (oauth2Client.isTokenExpiring()) {
    oauth2Client.refreshAccessToken()
      .then((newToken) => {
        // Actualiza el token almacenado con el nuevo token
        // Luego, utiliza el cliente OAuth2 actualizado para hacer llamadas a la API
        oauth2Client.setCredentials(newToken);
      })
      .catch((error) => {
        console.error('Error al actualizar el token de acceso:', error)
      })
}

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})


exports.drive = drive  