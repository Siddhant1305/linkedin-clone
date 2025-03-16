import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(postRoutes);
app.use(userRoutes);

const start = async () => {

    const connectDB = await mongoose.connect("mongodb+srv://siddhantpandey1305:linkedinclone@linkedin-clone-cluster.5d8uz.mongodb.net/?retryWrites=true&w=majority&appName=linkedin-clone-cluster")

    app.listen(9090, () => {
        console.log("Server is running on Port:9090")
    })
};

start();