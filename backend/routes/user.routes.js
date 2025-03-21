import { Router } from "express";
import { login, register, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUserProfile, downloadProfile, sendConnectionRequest, getMyConnectionRequests, acceptConnectionRequest, whatAreMyConnection } from "../controllers/user.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})


const upload = multer({storage: storage})

router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture)

router.route('/register').get(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);
router.route('/update_profile_data').get(updateProfileData);
router.route('/user/get_all_users').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadProfile);
router.route('/user/send_connection_request').post(sendConnectionRequest);
router.route('/user/getConnectionRequests').get(getMyConnectionRequests);
router.route('/user/user_connection_request').get(whatAreMyConnection);
router.route('/user/accept_connection_request').get(acceptConnectionRequest);

export default router;