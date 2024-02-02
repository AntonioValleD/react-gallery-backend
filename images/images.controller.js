const { DateTime } = require("luxon")
const dotenv = require("dotenv")
const uuid = require("uuid").v4
const stream = require("stream")


// Set environment variables
dotenv.config()


// Database model
const ImageModel = require("../database/models").ImageModel
const UserModel = require("../database/models").UserModel

// Image database control functions
const getImages = (userInfo) => {
    return new Promise( async (resolve, reject) => {
        console.log("Searching images...");
        let imageList = await ImageModel.find({userId: userInfo.id}).exec()

        if (imageList.length > 0){
            console.log(`Images found: ${imageList.length}`)
            return resolve(imageList)
        } else {
            console.log("No images found!")
            return reject("No images found!")
        }
    })
}

const addImage = (imageInfo, file, userInfo) => {
    return new Promise( async (resolve, reject) => {
        console.log("Searching image...")

        let imgKey = uuid()
        let uploadedImage = await uploadDriveImage(file, imgKey, userInfo.id)
        let url = `https://drive.google.com/uc?export=view&id=${uploadedImage.data.id}`

        let newImage = new ImageModel({
            userId: userInfo.id,
            imageId:uploadedImage.data.id,
            title: imageInfo.title,
            fileName: file.name,
            key: imgKey,    
            url: url,
            tags: JSON.parse(imageInfo.tags),
            uploadDate: DateTime.local(),
        })
        await newImage.save().then(() => {
            console.log("Image saved successfully!")
            return resolve(uploadedImage)
        }).catch(() => {
            console.log("Image not saved!")
            return reject("Image not saved!")
        })
    })
}

const addProfileImage = (file, userInfo) => {
    return new Promise( async (resolve, reject) => {
        console.log("Searching image...")

        let imgKey = uuid()
        let uploadedImage = await uploadDriveImage(file, imgKey, userInfo.id)
        let url = `https://drive.google.com/uc?export=view&id=${uploadedImage.data.id}`

        let foundUser = await UserModel.findByIdAndUpdate(userInfo.id, {profileImageUrl: url}).exec()

        if (foundUser){
            console.log("Profile image added successfully!")
            return resolve(foundUser)
        } else {
            console.log("Profile image error")
            return reject("Profile image not added")
        }
    })
}

const updateImageInfo = (updatedInfo) => {
    return new Promise( async (resolve, reject) => {
        let update = {...updatedInfo}
        delete update.id
        console.log("Searching image...")
        
        let foundImage = await ImageModel.findByIdAndUpdate(updatedInfo.id, update).exec()

        if (foundImage){
            console.log("Image found!\nImage info updated successfully")
            return resolve(foundImage)
        } else {
            console.log("Image not found!")
            return reject("Image not found!")
        }
    })
}

const deleteImage = (id, imgKey, userInfo) => {
    return new Promise( async (resolve, reject) => {
        try {
            let deletedImage = await ImageModel.findByIdAndDelete(id).exec()
            console.log(deletedImage);
            await deleteDriveImage(deletedImage.imageId)
            console.log("Image found!\nImage deleted successfully")
            resolve(deletedImage)
        } catch (error) {
            console.log(error)
            reject("Image not found!")
        }
    })
}

// DigitalOcean spaces control functions
// const s3Client = require("../database/s3Client").s3Client

// const uploadImageFile = (file, imgKey, userId) => {
//     return new Promise( async (resolve, reject) => {
//         console.log(`Uploading ${file.name} image file...`)
//         try {
//             const uploadObject = await s3Client.putObject({
//                 ACL: "public-read",
//                 Bucket: userId || "",
//                 Key: imgKey,
//                 Body: file.data, 
//             })
//             console.log("Uploaded successfuly!")
//             resolve(uploadObject)
//         } catch (error) {
//             console.log("Failed to upload image!")
//             console.log(error);
//             reject(error)
//         }
//     })
// }

// const deleteImageFile = (imgKey, userId) => {
//     return new Promise( async (resolve, reject) => {
//         console.log("Deleting image file...")
//         try {
//             await s3Client.deleteObject({
//                 Bucket: userId,
//                 Key: imgKey
//             })
//             console.log("Image file deleted successfully!")
//             resolve()
//         } catch (error) {
//             console.log("Image file could not be deleted!")
//             reject()
//         }
//     })
// }


// Google Drive control functions
const drive = require("../database/googleDriveClient").drive

const uploadDriveImage = (file, imgKey, userId) => {
    return new Promise( async (resolve, reject) => {
        const bufferStream = new stream.PassThrough()
        bufferStream.end(file.data)
        console.log(`Uploading ${file.name} image file...`)
        try {
            let userFolderId = ""
            
            console.log("Searching for react-gallery folder...")
            const folder = await drive.files.list({
                q: `mimeType = 'application/vnd.google-apps.folder' and 
                    name = '${userId}' and
                    '1Gmw6R3peeQpXCtz24HyIPkzcdQ0xet_i' in parents`,
                fields: "files(id)",
            })

            if (folder.data.files.length > 0){
                userFolderId = folder.data.files[0].id
                console.log("Folder found!", userFolderId)
            } else {
                console.log("Folder not found!")
                console.log("Creating react-gallery folder...")
                const newFolder = await drive.files.create({
                    requestBody: {
                        name: userId,
                        mimeType: "application/vnd.google-apps.folder",
                        parents: ["1Gmw6R3peeQpXCtz24HyIPkzcdQ0xet_i"],
                    },
                    fields: "id",
                })

                await drive.permissions.create({
                    fileId: newFolder.data.id,
                    requestBody: {
                        role: "reader",
                        type: "anyone",
                    },
                })
                console.log("Folder created successfully!", folder.data.id)
                userFolderId = newFolder.data.id
            }

            const uploadObject = await drive.files.create({
                requestBody: {
                    name: imgKey,
                    mimeType: file.mimetype,
                    parents: [userFolderId],
                },
                media: {
                    uploadType: "media",
                    mimeType: file.mimetype,
                    body: bufferStream,
                },
            })
            console.log("Uploaded successfuly!")

            console.log("Setting image permissions...")
            await drive.permissions.create({
                fileId: uploadObject.data.id,
                requestBody: {
                    role: "reader",
                    type: "anyone",
                },
            })

            const imgData = await drive.files.get({
                fileId: uploadObject.data.id,
                fields: "webContentLink",
            })

            console.log(imgData);
            console.log("Permissions set successfully!")
            resolve(uploadObject)
        } catch (error) {
            console.log("Failed to upload image!")
            console.log(error)
            reject(error)
        }
    })
}

const deleteDriveImage = (imageId) => {
    return new Promise( async (resolve, reject) => {
        console.log("Deleting image file...")
        try {
            console.log("***", imageId);
            await drive.files.delete({
                fileId: imageId,
            })
            console.log("Image file deleted successfully!")
            resolve()
        } catch (error) {
            console.log("Image file could not be deleted!")
            console.log(error)
            reject()
        }
    })
}


exports.getImages = getImages
exports.addImage = addImage
exports.addProfileImage = addProfileImage
exports.updateImageInfo = updateImageInfo
exports.deleteImage = deleteImage