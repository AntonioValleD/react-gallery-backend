const router = require('express').Router()
const authHttp = require("./auth.http")


router.route("/login")
    .post(authHttp.userLogin)

router.route("/signup")
    .post(authHttp.addNewUser)


router.route("/users")
    .get(authHttp.getUserList)
    .patch(authHttp.updateUserInfo)
    .delete(authHttp.deleteUser)


exports.router = router