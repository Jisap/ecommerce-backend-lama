//yarn add express mongoose dotenv nodemon
//yarn add cors

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe")
const cors = require("cors")

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log('DBConnection successfull'))
    .catch((error) => console.log(error))


app.use(cors())
app.use(express.json());

app.use("/api/users", userRoute )       // /api/user/userposttest
app.use("/api/auth", authRoute)         // /api/auth/register 
app.use("/api/products", productRoute)  // /api/product/
app.use("/api/carts", cartRoute)        // /api/carts
app.use("/api/orders", orderRoute)      // /api/order
app.use("/api/checkout", stripeRoute)   // /api/checkout


app.listen( process.env.PORT || 5000, () => {
    console.log("Backend server is running")
})