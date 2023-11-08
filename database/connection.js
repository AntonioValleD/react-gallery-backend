const mongoose = require('mongoose')
const dotenv = require("dotenv")


dotenv.config()

// Database credentials
const mongoUrl = process.env.MONGODB_URL;

// Database connection
mongoose.connect(mongoUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    console.log('Database connected successfully');
})
.catch((error) => {
    console.log("***Mongo DB error***\n", error);
});