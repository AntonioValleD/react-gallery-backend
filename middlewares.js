const express = require("express")
const authMiddleware = require("./tools/auth.middleware")
const fileUpload = require("express-fileupload")
const cors = require("cors")


// Routes
const authRoutes = require("./auth/auth.routes").router
const imagessRoutes = require("./images/images.routes").router


const setUpMiddlewares = (app) => {
    // Setting cors
    app.use(cors())

    // Authentication middlewares
    app.use(express.json())
    authMiddleware.init();
    app.use(authMiddleware.protectWithJwt)

    // File upload middleware
    app.use(fileUpload({
        tempFileDir: "/temp"
    }))

    // Routes middlewares
    app.use("/auth", authRoutes)
    app.use("/images", imagessRoutes)
}


exports.setUpMiddlewares = setUpMiddlewares