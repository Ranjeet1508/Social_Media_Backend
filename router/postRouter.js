const {Router} = require('express');
const { PostModel } = require('../model/postModel');
const { UserModel } = require('../model/userModel');
const { authentication } = require('../Middlewares/authentication');
const postRouter = Router();
const cloudinary = require('cloudinary');
const multer = require('multer');
const upload = multer();




postRouter.get('/allPost',authentication, async(req,res) => {
    try {
        const user = await UserModel.findById(req.userID);

        const posts = await PostModel.find({
            $or: [
                {owner: user._id},
                {owner: {$in: user.following}}
            ]               
        }).populate("owner likes comments.user")

        posts.reverse();
        res.status(200).json({
            success:true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
})




postRouter.get('/myAllPost',authentication, async(req,res) => {
    try {
        const user = await UserModel.findById(req.userID);
        console.log(user)
        const posts = await PostModel.find({
            owner:{
                $in: user._id,
            },            
        }).populate("owner likes comments.user")

        posts.reverse();

        res.send({msg: "200 success", posts})
    } catch (error) {
        res.send({msg: "500 internal server error", error})
    }
})




postRouter.post('/upload',authentication, upload.single('image'), async(req, res) => {
    try {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
            folder:"Posts"
        })
        
        const user = await UserModel.findById(req.userID );
        const {caption} = req.body;
        const newPostData = new PostModel({
            caption,
            image: {
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            },
            owner:user._id
        })
        user.posts.unshift(newPostData._id);
        await newPostData.save();
        await user.save();

        res.status(200).json({
            success:true,
            message:"post added successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
})



postRouter.delete('/delete/:id', authentication, async(req, res) => {
    try {
        const user = await UserModel.findById(req.userID);
        const post  = await PostModel.findById(req.params.id);
        console.log(post)
        if(!post ){
            res.status(404).json({
                success:false,
                message: "post does not found"
            })
        }
        const index = user.posts.indexOf(req.params.id);
        await cloudinary.v2.uploader.destroy(post.image.public_id);
        user.posts.splice(index,1);
        await PostModel.findOneAndDelete({"_id": post._id, "owner":user._id })
        await user.save();
        res.send("deleted successfully")
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
})


postRouter.get('/like_Unlike/:id',authentication, async (req,res) => {
    try {
        console.log(req.userID)
        const user = await UserModel.findById(req.userID);
        console.log(user)
        const post = await PostModel.findById(req.params.id);
        console.log(post)
        

        if(!post){
            res.status(404).json({
                success:false,
                message: "Post does not found"
            })
        }

        if(post.likes.includes(user._id)){
            const index = post.likes.indexOf(user._id);
            post.likes.splice(index,1);
            await post.save();

            return res.status(200).json({
                success:true,
                message:"unliked"
            })
        }
        else{
            post.likes.push(user._id);
            await post.save();

            return res.status(200).json({
                success:true,
                message:"liked"
            })
        }
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
})






// logged out ka function banana h




module.exports = {
    postRouter
}
