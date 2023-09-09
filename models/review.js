const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cloudinary = require('cloudinary');


const reviewSchema = new Schema({
    body: String,
    rating: Number,
    image: {
        url: String,
        filename: String
    },
    reviewAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//post middleware to delete the image from cloudinary when a review is deleted
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await cloudinary.uploader.destroy(doc.image.filename);
    }
})



module.exports = mongoose.model('Review', reviewSchema);