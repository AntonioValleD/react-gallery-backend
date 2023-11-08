const crypto = require('../tools/crypto')
const { DateTime } = require("luxon")


// Models
const UserModel = require("../database/models").UserModel


// User controls
const cleanUpUsers = () => {
    return new Promise(async (resolve, reject) => {
        await UserModel.deleteMany({}).exec()
        resolve();
    })
}

const getUserFromEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let registeredUser = await UserModel.findOne({email: email}).exec()
            return resolve(registeredUser)
        } catch (error) {
            return reject()
        }
    })
}

const addNewUser = (reqBody) => {
    return new Promise(async (resolve, reject) => {
        console.log("Searching user...")
        try {
            let user = await getUserFromEmail(reqBody.email)
            if (user){
                console.log("User already exists")
                reject("User already exists")
            } else {
                console.log("User not found, creating new user...")
                let newUser = new UserModel({
                    email: reqBody.email,
                    name: reqBody.name,
                    lastName: reqBody.lastName,
                    age: reqBody.age,
                    gender: reqBody.gender,
                    password: crypto.hashPasswordSync(reqBody.password),
                    registerDate: DateTime.local(),
                    tagList: [],
                    profilePicUrl: ""
                })
                await newUser.save().then(() => {
                    console.log('User registered successfully!')
                    resolve()
                }).catch(() => {
                    console.log("User could not be created!")
                    reject("User could not be created!")
                })
            }
        } catch (error) {
            console.log("Missing data")
            reject("Missing data!")
        }
    })
}

const getUserList = () => {
    return new Promise( async (resolve, reject) => {
        console.log("Searching users...")
        let userList = await UserModel.find().exec()

        if (userList.length > 0){
            console.log(`Users found: ${userList.length}`)
            return resolve(userList)
        } else {
            console.log("No users found!")
            return reject("No users found!")
        }
    })
}

const updateUserInfo = (updateObject) => {
    return new Promise( async (resolve, reject) => {
        let filter = {email: updateObject.email}
        let update = {...updateObject}
        console.log("Searching user...")
        let userInfo = await UserModel.findOneAndUpdate(filter, update).exec()

        if (userInfo){
            console.log("User info updated successfully!")
            return resolve(userInfo)
        } else {
            console.log("Sign up request not found!")
            return reject("Sign up request not found!")
        }
    })
}

const deleteUser = (email) => {
    return new Promise((resolve, reject) => {
        console.log("Searching user...")
        let user = UserModel.findOneAndDelete({email: email}).exec()

        if (user){
            console.log("User deleted successfully!")
            return resolve(user)
        } else {
            console.log("User not found!")
            return reject("User not found!")
        }
    })
}


// Credentials control
const checkUserCredentials = (reqBody) => {
    return new Promise(async (resolve, reject) => {
        console.log("Searching user...")
        let user = await getUserFromEmail(reqBody.email)
        if (user){
            console.log("User found!\nChecking user credentials...")
            let res = crypto.comparePassword(reqBody.password, user.password)

            if (!res){
                console.log("Invalid credentials!")
                reject("Invalid credentials!")
            } else {
                console.log("Sing up successfully!")
                resolve(user);
            }
        } else {
            console.log("User not found!")
            reject("User not found!")
        }
    });
};

const checkUserToken = (userToken) => {
    return new Promise(async (resolve, reject) => {
        let user = await getUserFromEmail(userToken.email)
        if (!user){
            return reject()
        } else if (user.password != userToken.password){
            return reject()
        } else {
            return resolve()
        }
    })
}


exports.addNewUser = addNewUser
exports.getUserFromEmail = getUserFromEmail
exports.checkUserCredentials = checkUserCredentials
exports.checkUserToken = checkUserToken
exports.cleanUpUsers = cleanUpUsers

exports.getUserList = getUserList
exports.updateUserInfo = updateUserInfo
exports.deleteUser = deleteUser