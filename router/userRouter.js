const { Router } = require('express');
const { UserModel } = require('../model/userModel');
const userRouter = Router();
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const { authentication } = require('../Middlewares/authentication');
const { PostModel } = require('../model/postModel');
const crypto = require("crypto");
const cloudinary = require('cloudinary');
let nodemailer = require('nodemailer');

require('dotenv').config();

//--------------backend code for signing up-----------------

userRouter.post('/signup', async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;
        let user = await UserModel.findOne({ 'email': email });
        if (user) {
            return res.status(409).json({
                error: "Conflict",
                message: "User already exist"
            })
        }
        bcrypt.hash(password, 4, async function (err, hash) {
            if (err) {
                return res.status(400).json({
                    error: err,
                    message: "something went wrong"
                })
            }
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatar"
            })
            let new_user = new UserModel({
                name,
                email,
                password: hash,
                avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
            })
            await new_user.save()
        });
        res.status(200).json({
            success: true,
            message: "Signup Successfull"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})




//--------------backend code for login--------------- 
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const isUser = await UserModel.findOne({ email }).populate("follower following posts");
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "User does not exist!"
            })
        }
        const hashed_password = isUser.password;

        bcrypt.compare(password, hashed_password, function (err, result) {
            if (err) {
                return res.status(400).json({
                    error: err,
                    message: "something went wrong"
                })
            }
            if (!result) {
                return res.status(401).json({
                    message: "Wrong Credentials",
                    error: "Unauthorized",
                    success: "false"
                })
            }
            else {
                let token = jwt.sign({ userID: isUser._id }, process.env.SECRET_KEY);
                return res.status(200).json({
                    success: true,
                    message: "Login Successfull",
                    token,
                    isUser,
                })
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})


// -------------------backend code for finding the logged in user---------------
userRouter.get('/me', authentication, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID).populate("posts follower following");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "login again"
            })
        }
        res.status(200).json({
            success: true,
            message: "successfull",
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})


//-------------------backend code for logout-----------------------------
userRouter.get('/logout', authentication, async (req, res) => {
    try {

        res.status(200).json({
            success: true,
            message: "Logout Successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})



//------------------backend code for updating the password------------------------
userRouter.post('/updatePassword', authentication, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID);
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.send("either password or newPassword is empty")
        }
        const hashed_password = user.password;
        bcrypt.compare(oldPassword, hashed_password, function (err, result) {
            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: "Wrong Credentials",
                })
            }
            else {
                bcrypt.hash(newPassword, 4, async function (err, hash) {
                    user.password = hash;
                    await user.save()
                });
                res.status(200).json({
                    success: true,
                    message: "Password updated successfully",
                })
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})



//---------------backend code for updating the profile---------------------
userRouter.post('/updateProfile', authentication, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID);
        const { name, email, avatar } = req.body;
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        if (avatar) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatar",
            })
            user.avatar.public_id = myCloud.public_id;
            user.avatar.url = myCloud.secure_url;

        }

        await user.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})



userRouter.delete("/deleteAccount", authentication, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID)
        const posts = user.posts;
        const follower = user.follower
        const following = user.following;
        const userID = user._id;

        //deleting user account
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
        await UserModel.findOneAndDelete({ "_id": userID });



        //removing posts from follwers list
        for (let i = 0; i < posts.length; i++) {
            const post = await PostModel.findById(posts[i]);
            await cloudinary.v2.uploader.destroy(post.image.public_id)
            await PostModel.findOneAndDelete({ "_id": post._id })
        }


        //removing user from follower's following list.
        for (let i = 0; i < follower.length; i++) {
            const followers = await UserModel.findById(follower[i]);
            const index = followers.following.indexOf(userID);
            followers.following.splice(index, 1);
            await followers.save();
        }

        // removing user from following's followers

        for (let i = 0; i < following.length; i++) {
            const followings = await UserModel.findById(following[i]);
            const index = followings.follower.indexOf(userID);
            followings.follower.splice(index, 1);
            await followings.save();
        }

        //removing all comments of the user from all posts
        const allPosts = await PostModel.find();

        for (let i = 0; i < allPosts.length; i++) {
            const post = await PostModel.findById(allPosts[i]._id);

            for (let j = 0; j < post.comments.length; j++) {
                if (String(post.comments[j].user) === String(userID)) {
                    post.comments.splice(j, 1);
                }
            }
            await post.save();
        }

        // removing all likes of the user from all posts

        for (let i = 0; i < allPosts.length; i++) {
            const post = await PostModel.findById(allPosts[i]._id);

            for (let j = 0; j < post.likes.length; j++) {
                if (String(post.likes[j]) === String(userID)) {
                    post.likes.splice(j, 1);
                }
            }
            await post.save();
        }

        res.status(200).json({
            success: true,
            message: "Account Deleted Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})



//--------------backend code for finding the user----------------
userRouter.get("/findUser/:id", authentication, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).populate("follower following posts")
        console.log(user)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '404 not found'
            })
        }
        else {
            return res.status(200).json({
                success: true,
                user
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})




//-----------------backend code for finding all the user----------------------
userRouter.get("/allUser", authentication, async (req, res) => {
    try {
        const users = await UserModel.find({ _id: { $ne: req.userID } });
        console.log(users)
        if (!users) {
            return res.send("400 error not found");
        }
        else {
            res.send(users);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})





//-------------backend code for resetting the password when forgot-------------------
userRouter.post("/forgotPassword", async (req, res) => {
    try {
        const { email } = req.body;
        let user = await UserModel.findOne({ email })
        if (!user) {
            return res.send("user not found")
        }

        let resetPasswordToken = jwt.sign({ userID: user._id }, process.env.SECRET_KEY, { expiresIn: 600 });
        user.resetToken = resetPasswordToken
        await user.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'danavrj1998@gmail.com',
                pass: process.env.GMAIL_PASSWORD
            }
        });

        let resetPasswordLink = `https://tasty-fez-goat.cyclic.app/resetPassword/${resetPasswordToken}`

        let mailOptions = {
            from: 'danavrj1998@gmail.com',
            to: email,
            subject: 'Forgot password Link',
            text: `Use the given link to reset your password ${resetPasswordLink}  \n valid for 10 minute only`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                return res.status(200).json({
                    success: true,
                    message: "sent successfully"
                })
            }
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})



userRouter.post("/resetPassword/:token", async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.params.token;
        jwt.verify(token, process.env.SECRET_KEY, async function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "token expired"
                })
            }
            else {
                const { userID } = decoded;
                req.userID = userID
                const user = await UserModel.findById(req.userID);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "token expired"
                    })
                }
                bcrypt.hash(password, 4, async function (err, hash) {
                    user.password = hash;
                    await user.save()

                    res.status(200).json({
                        success: true,
                        message: "Password Reset successfully",
                    });
                })
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
})



module.exports = {
    userRouter
}


