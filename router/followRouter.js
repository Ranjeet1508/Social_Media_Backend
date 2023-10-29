const {Router} = require('express');
const followRouter = Router();
const {UserModel} = require('../model/userModel');
const {authentication} = require('../Middlewares/authentication');


// backend code for follwers and following 

followRouter.get('/:id',authentication, async(req, res) => {

    try {
        const userToFollow = await UserModel.findById(req.params.id);
        const loggedInUser = await UserModel.findById(req.userID);

        if(!userToFollow){
            res.status(404).json({
                success:false,
                message: "user not found"
            })
        }
        if(loggedInUser.following.includes(userToFollow._id)){

            const followingIndex = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(followingIndex,1);

            const followIndex = userToFollow.follower.indexOf(loggedInUser._id);
            userToFollow.follower.splice(followIndex,1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(201).json({
                success:true,
                message: `you unfollowed ${userToFollow.name}`
            })
        }
        else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.follower.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(201).json({
                success:true,
                message: `you started following ${userToFollow.name}`
            })
        }

    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
})





module.exports = {
    followRouter
}