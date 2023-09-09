const mongoose = require('mongoose');

const Review = require('./review');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const cloudinary = require('cloudinary');

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const CatSchema = new Schema({
    images: [
        ImageSchema
    ],
    title: {
        type: String,
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description:
    {
        type: String,
        required: true
    },
    color: {
        type: String,
        enum: ['Orange', 'Black', 'White', 'Calico', 'Grey Striped', 'Grey Uniform', 'Tuxedo', 'Siamese', 'Black & White', 'Orange & White', 'Grey & White', 'Brown'],
    },
    fluffy: {
        type: Boolean,
        default: false
    },
    friendliness: {
        type: Number,
    },
    location: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// CatSchema.post('findOneAndDelete', async function (doc) { //this is a query middleware, it will run after a cat is deleted to delete all the reviews associated with it
//     if (doc) {
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         })
//     }
// })


CatSchema.post('findOneAndDelete', async function (
    cat
) {
    if (cat.reviews) {
        await Review.deleteMany({
            _id: { $in: cat.reviews }
        });
    }
    if (cat.images) {
        for (const img of cat.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

CatSchema.methods.calculateAvgRating = function () {
    let ratingsTotal = 0;
    if (this.reviews.length) {
        this.reviews.forEach(review => {
            ratingsTotal += review.rating;
        });
        this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
    } else {
        this.avgRating = ratingsTotal;
    }
    // const floorRating = Math.floor(this.avgRating);
    this.save();
    return this.avgRating;
}

const Cat = mongoose.model('Cat', CatSchema);

module.exports = Cat;