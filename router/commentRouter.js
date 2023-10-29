const {Router} = require('express');
const { PostModel } = require('../model/postModel');
const { UserModel } = require('../model/userModel');
const { authentication } = require('../Middlewares/authentication');
const commentRouter = Router();



commentRouter.get("/:postId", authentication, async(req,res) => {
    try {
        const post = await PostModel.findById(req.params.postId).populate("comments.user");

        if(!post){
            return res.status(404).json({
                success:false,
                message:"post not found"
            })
        }
        else{
            comments = post.comments;
            return res.status(200).json({
                success:true,
                comments
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    } 
})

commentRouter.put("/add/:id", authentication, async(req,res) => {
    try {
        const post = await PostModel.findById(req.params.id)

        if(!post){
            return res.status(404).json({
                success:false,
                message:"post not found"
            })
        }
        else{
            post.comments.push({
                user: req.userID,
                comment: req.body.comment
            })
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Comment added",
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    } 
})


commentRouter.delete("/delete/:id", authentication, async(req,res) => {
    try {
        const post = await PostModel.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                message:"post not found"
            })
        }

        // checking if owner wants to delete the comments
        if(post.owner.toString()===req.userID.toString()){

            if(req.body.commentId===undefined){
                return res.send("comment id is required")
            }
            post.comments.forEach((item, index) => {
                if(item._id.toString()===req.body.commentId.toString()){
                    return post.comments.splice(index,1);
                }
            })
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Comment deleted successfully"
            })
        }
        //checking if follwers want to delete the message
        else{
            post.comments.forEach((item, index) => {
                if(item.user.toString()===req.userID.toString()){
                    return post.comments.splice(index,1);
                }
            })
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Comment deleted successfully"
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    } 
})




module.exports = {
    commentRouter
}