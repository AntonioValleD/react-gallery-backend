const jwt = require('jsonwebtoken')
const authController = require("./auth.controller")
const dotenv = require("dotenv")


dotenv.config()

const userLogin = async (req, res) => {
    try {
        let user = await authController.checkUserCredentials(req.body)

        let tokenInfo = {
            id: user._id,
            email: user.email,    
            name: user.name,
            lastName: user.lastName,
            birthdate: user.age,
            gender: user.gender,   
            registerDate: user.registerDate,
            profileImageUrl: user.profileImageUrl,
            tags: user.tags
        }

        const token = jwt.sign(tokenInfo, process.env.JWT_SECRET)

        return res.status(200).json({
            token: token,
            userInfo: tokenInfo,
        })
    } catch (error) {
        return res.status(400).json({message: error})
    }
};

const addNewUser = async (req, res) => {
    try {
        await authController.addNewUser(req.body)
        res.status(200).json({message: 'Sing up successfully'});
    } catch (error) {
        return res.status(400).json({error: error})
    }
};

const getUserList = async (req, res) => {
    try {
        let userList = await authController.getUserList()
        return res.status(200).json(userList)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const updateUserInfo = async (req, res) => {
    try {
        let oldUser = await authController.updateUserInfo(req.body)
        return res.status(200).json(oldUser)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}

const deleteUser = async (req, res) => {
    try {
        let deletedUser = await authController.deleteUser(req.body.email)
        return res.status(200).json(deletedUser)
    } catch (error) {
        return res.status(400).json({message: error})
    }
}


// Change password
const changePassword = async (req, res) => {
    try {
        let newPassword = await authController.updatePassword(req.body, req.user.email)
        return res.status(200).json({message: "La contraseña ha sido actualizada correctamente!"})
    } catch (error) {
        return res.status(400).json({message: error})
    }
}


exports.userLogin = userLogin;
exports.addNewUser = addNewUser;
exports.getUserList = getUserList
exports.updateUserInfo = updateUserInfo
exports.deleteUser = deleteUser
exports.changePassword = changePassword