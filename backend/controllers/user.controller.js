import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import crypto from 'crypto';

import bcrypt from "bcrypt";


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