const imagesController = require("./images.controller")


const getImages = async (req, res) => {
    console.log("Get images request incoming...")
    try {
        let imageList = await imagesController.getImages(req.user)
        return res.status(200).json(imageList)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const addNewImage = async (req, res) => {
    console.log("Add new image request incoming...")
    try {
        const { file } = req.files
        console.log(file)
        let uplodadedImage = await imagesController.addImage(req.body, file, req.user)
        return res.status(200).json({
            message: "Image added successfully!",
            file: uplodadedImage
        })
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const addProfileImage = async (req, res) => {
    console.log("Add profile image request incoming...")
    try {
        const { file } = req.files
        console.log(file)
        let uplodadedImage = await imagesController.addProfileImage(file, req.user)
        return res.status(200).json({
            message: "Profile image added successfully!",
            file: uplodadedImage
        })
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const updateImageInfo = async (req, res) => {
    console.log("Update image info request incoming...")
    try {
        let oldImage = await imagesController.updateImageInfo(req.body)
        return res.status(200).json(oldImage)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const deleteImage = async (req, res) => {
    console.log("Delete image request incoming...")
    try {
        let deletedImage = await imagesController.deleteImage(req.body.id, req.body.imgKey, req.user)
        return res.status(200).json(deletedImage)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}


exports.getImages = getImages
exports.addNewImage = addNewImage
exports.addProfileImage = addProfileImage
exports.updateImageInfo = updateImageInfo
exports.deleteImage = deleteImage