const mongoose = require("mongoose")


const UserModel = mongoose.model("users", {
    email: String,
    name: String,
    lastName: String,
    age: Number,
    gender: String,
    password: String,
    registerDate: String,
    tags: Array,
    profileImageUrl: String
})

const ImageModel = mongoose.model("images", {
    userId: String,
    imageId: String,
    title: String,
    key: String,
    fileName: String,
    url: String,
    tags: Object,
    uploadDate: String,
})


exports.UserModel = UserModel
exports.ImageModel = ImageModel