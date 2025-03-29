import User from '../models/userModels.js';
import asyncHandler from '../middlewares/asynchandler.js';
import bcrypt from 'bcryptjs';
import createToken from '../utils/createToken.js';



//creating the user
const createUser = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body); // Log the entire request body
    const { username, email, password } = req.body;

//checking for duplicate user

    if (!username || !email || !password){
        throw new Error("Please fill the");
    }
    const userExists = await User.findOne({email});

    if (userExists) res.status(400).json({message: "User already exists"});

//adding salt for security

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

//adding salf with the password
    const newUser = new User({username, email, password: hashedPassword});
    try{
        await newUser.save();
        createToken(res, newUser._id);

        res.status(201).json({_id: newUser._id, username: newUser.username, email: newUser.email, isAdmin: newUser.isAdmin});
    }   catch(error){
    res.status(400);
    throw new Error("Invalid user data");
    }

});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser){
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (isPasswordValid){
            createToken(res, existingUser._id);
            res.status(200).json({
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                isAdmin: existingUser.isAdmin,
            });
        return; //exit the func after sending the res
    }
}
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({message: "User logged out successfully!"});
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user =await User.findById(req.user._id);
    if(user){
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email
        });}
    else{
        res.status(404);
        throw new Error("User not found");
    }

});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword;
        }

        const updateUser = await user.save();
        res.json({
            _id: updateUser._id,
            username: updateUser.username,
            email: updateUser.email,
            isAdmin: updateUser.isAdmin,
        });
    }
        else {
            res.status(404);
            throw new Error("User not found");
        }
    });


    const deleteUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);


if(user){
    if(user.isAdmin){
        res.status(400);
        throw new Error("Cannot delete admin user");

    }
    await User.deleteOne({_id: req.params.id});
    res.json({ message: "User removed"});
} else {
    res.status(404)
    throw new Error("User not found.");
}
});


    const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select( "-password");

    if(user){
        res.json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }

});

const updateUserById = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);

        const updatedUser = await user.save();
        res.json({_id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, isAdmin: updatedUser.isAdmin});
    } else {
        res.status(404);
        throw new Error("User not found");
    }

});




export { createUser, loginUser, logoutCurrentUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById };
