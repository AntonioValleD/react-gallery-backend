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

        const imgKey = uuid()
        const url = await uploadAzureImage(file, imgKey)

        let newImage = new ImageModel({
            userId: userInfo.id,
            title: imageInfo.title,
            fileName: file.name,
            key: imgKey,    
            url: url,
            tags: JSON.parse(imageInfo.tags),
            uploadDate: DateTime.local(),
        })
        await newImage.save().then(() => {
            console.log("Image saved successfully!")
            return resolve(url)
        }).catch((err) => {
            console.log("Image not saved!")
            console.log(err)
            return reject("Image not saved!")
        })
    })
}

const addProfileImage = (file, userInfo) => {
    return new Promise( async (resolve, reject) => {
        console.log("Searching image...")

        let imgKey = uuid()
        let url = await uploadAzureImage(file, imgKey)

        let foundUser = await UserModel.findByIdAndUpdate(userInfo.id, {profileImageUrl: url}).exec()

        if (foundUser){
            console.log("Profile image added successfully!")
            return resolve(url)
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

const deleteImage = (id) => { 
    return new Promise( async (resolve, reject) => {
        try {
            let deletedImage = await ImageModel.findByIdAndDelete(id).exec()
            await deleteAzureImage(deletedImage.key)
            console.log("Image found!\nImage deleted successfully")
            resolve(deletedImage)
        } catch (error) {
            console.log(error)
            reject("Image not found!")
        }
    })
}


// Azure Blob Storage control functions
const blobServiceClient = require("../database/azureConnfig").blobServiceClient

const uploadAzureImage = (file, imgKey) => {
    const bufferStream = new stream.PassThrough()
    bufferStream.end(file.data)
    const blobName = `${imgKey}`

    const containerClient = blobServiceClient.getContainerClient(
        process.env.AZURE_STORAGE_CONTAINER_NAME
    )
    const blobClient = containerClient.getBlobClient(blobName)
    return new Promise( async (resolve, reject) => {
        try {
            const blockBlobClient = blobClient.getBlockBlobClient()
            await blockBlobClient.uploadStream(
                bufferStream, 
                file.size,
                undefined,
                {
                    blobHTTPHeaders: {
                        blobContentType: "image/jpeg"
                    }
                }
            )
            console.log("Uploaded successfuly!")
            resolve(blobClient.url)
        } catch (error) {
            console.log("Failed to upload image!")
            reject(error)
        }
    })
}

const deleteAzureImage = (imgKey) => {
    const blobName = `${imgKey}`

    const containerClient = blobServiceClient.getContainerClient(
        process.env.AZURE_STORAGE_CONTAINER_NAME
    )
    const blobClient = containerClient.getBlobClient(blobName)
    return new Promise( async (resolve, reject) => {
        try {
            await blobClient.delete()
            console.log("Deleted successfuly!")
            resolve()
        } catch (error) {
            console.log("Failed to delete image!")
            reject(error)
        }
    })
}


exports.getImages = getImages
exports.addImage = addImage
exports.addProfileImage = addProfileImage
exports.updateImageInfo = updateImageInfo
exports.deleteImage = deleteImage