const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {type: String, required: [true, "Please enter a name"]},
    avatar: {
        public_id: {type:String},
        url: {type:String}
    },
    email: {
        type:String,
        required: [true, "Please enter an email"],
        unique: [true, "Email ready exist"],
    },
    password:{
        type:String,
        required:[true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
        }
    ],
    follower: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    resetPasswordToken:{type: String},
    resetPasswordExpire:{type: Date},
})

const UserModel = mongoose.model('user',userSchema)


module.exports = {
    UserModel
}