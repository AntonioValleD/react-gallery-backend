const express = require("express")
const middlewares = require("./middlewares")
const dotenv = require("dotenv")
const database = require("./database/connection")



dotenv.config()
const app = express()
const port = process.env.PORT || 3000

middlewares.setUpMiddlewares(app)

app.get("/", (req, res) => {
    res.status(200).json({message: `Server at port ${port}`})
})

app.listen(port, () => {
    console.log(`Server at port ${port}`)
})

