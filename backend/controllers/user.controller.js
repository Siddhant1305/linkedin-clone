import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import crypto from 'crypto';

import bcrypt from "bcrypt";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import ConnectionRequest from "../models/connections.model.js";
import { connections } from "mongoose";
import Post from "../models/post.model.js";

const convertUserDataTOPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 100 })
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);
    
    doc.fontSize(14).text("Past Work: ")
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`"Company Name: ${work.company}`);
        doc.fontSize(14).text(`"Position: ${work.Position}`);
        doc.fontSize(14).text(`"Years: ${work.Position}`);
    })

    doc.end();

    return outputPath;

}

export const register = async (req, res) => {

    try {
        const {name, email, password, username} = req.body;

        if(!name || !email || !password || !username) return res.status(400).json({ message: "All fields are required" })

            const user = await User.findOne({
                email
            });

            if (user) return res.status(400).json({ message: "User already exists" })

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                username
            });

            await newUser.save();

            const profile = new Profile({ userId: newUser_id });

            await profile.save()

            return res.json({ message: "User Created" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "All fields are required" })

        const user = await User.findOne({
            email
        });

        if (!user) return res.status(404).json({ message: "User does not exist" })

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" })

        const token = crypto.randomBytes(32).toString("hex");

        await User.updateOne({ _id: user._id }, { token });

        return re.json({ token });

    } catch (error) {

    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {

        const user = await User.findOne({ token: token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        user.profilePicture = req.file.filename;

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateUserProfile = async (req, res) => {

    try {

        const {token, ...newUserData} = req.body;

        const user = await User.findOne({ token: token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const {username, email} = newUserData;

        const exsistingUser = await User.findOne({ $or: [{ username }, { email }] });

        if(exsistingUser) {
            if(exsistingUser || String(exsistingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "User Already Exists"})
            }
        }

        Object.assign(user, newUserData);

        await user.save();

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getUserAndProfile = async (req, res) => {

    try {
        const { token } = req.body;

        const user = await User.findOne({ token: token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', "name email username profilePicture");
        return res.json(userProfile);

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateProfileData = async (req, res) => {

    try {

        const { token, ...newProfileData } = req.body;

        const userProfile = await User.findOne({ token: token });

        if(!userProfile) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const profile_to_update = await Profile.findOne({ userId: userProfile._id })

        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getAllUserProfile = async (req, res) => {

    try {

        const profiles = await Profile.find()
            .populate('userId', 'name username email profilePicture');

        return res.json({ profiles })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const downloadProfile = async (req, res) => {

    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
        .populate('userId', 'name username email profilePicture');

    let outputPath = await convertUserDataTOPDF(userProfile);

    return res.json({ "message": outputPath })
}

export const sendConnectionRequest = async (req, res) => {

    const { token, connectionId } = req.body;

    try {
        const user = await User.findOne({ token });

        if(!userProfile) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const connectionUser = await User.findOne({ _id: connectionId });

        if(!connectionUser) {
            return res.status(404).json({ message: "Connection User not found" })
        }

        const exsistingUser = await ConnectionRequest.findOne(
            {
                userId: user._id,
                connectionId: connectionUser._id
            }
        )

        if(exsistingRequest) {
            return res.status(404).json({ message: "Request already sent" })
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser_.id
        });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getMyConnectionRequests = async (req, res) => {

    const { token } = req.body;

    try {

        const user = await User.findOne({ token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const connections = await ConnectionRequest.find({ userId: user._id })
        .populate('connectionId', 'name username email profilePicture');
        
        return res.json({ connection })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const whatAreMyConnection = async (req, res) => {

    const { token } = req.body;

    try {

        const user = await User.findOne({ token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const connections = await ConnectionRequest.find({ connectionId: user._id })
        .populate('userId', 'name username email profilePicture');

        return res.json(connections);

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const acceptConnectionRequest = async (req, res) => {

    const { token, requestId, action_type } = req.body;

    try {

        const user = await User.findOne({ token });

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const connection = await ConnectionRequest.findOne({ _id: requestId });

        if(!connection) {
            return res.status(404).json({ message: "Connection Not Found" })
        }

        if(action_type === "accept") {
            connection.status_accepted = true;
        } else {
            onnection.status_accepted = false;
        }

        await connection.save();
        return res.json({ message: "Request Updated" });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
