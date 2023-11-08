const router = require('express').Router()
const imagesHttp = require("./images.http")


router.route("/")
    .get(imagesHttp.getImages)
    .post(imagesHttp.addNewImage)
    .patch(imagesHttp.updateImageInfo)

router.route("/delete")
    .post(imagesHttp.deleteImage)

router.route("/profilePic")
    .post(imagesHttp.addProfileImage)

exports.router = router