const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    caption: { type: String },
    image: {
        public_id: { type: String },
        url: { type: String },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    likes: [
        {       
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"           
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            
            comment: {
                type: String,
                required: true,
            }
        }
    ]
})

const PostModel = mongoose.model('post', postSchema);

module.exports = {
    PostModel
}