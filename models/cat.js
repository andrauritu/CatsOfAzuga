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

const opts = { toJSON: { virtuals: true } };

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
}, opts);

// reviewSchema.post('findOneAndDelete', async function (doc) {
//     if (doc && doc.image && doc.image.filename) {
//         await cloudinary.uploader.destroy(doc.image.filename);
//     }
// })

CatSchema.post('findOneAndDelete', async function (cat) {
    if (cat.reviews) {
        // Delete reviews
        await Review.deleteMany({
            _id: { $in: cat.reviews }
        });

        // Delete review images
        const reviewIds = cat.reviews.map(reviewId => reviewId.toString());
        await Review.deleteMany({
            _id: { $in: reviewIds },
            'image.filename': { $exists: true }
        });

        // Delete review images from Cloudinary (if needed)
        const reviewsWithImages = await Review.find({
            _id: { $in: reviewIds },
            'image.filename': { $exists: true }
        });

        for (const review of reviewsWithImages) {
            await cloudinary.uploader.destroy(review.image.filename);
        }
    }

    if (cat.images) {
        // Delete cat images
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

CatSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong> <a href="/cats/${this._id}">  ${this.title} </a> </strong>
    <p> ${this.description.substring(0, 30)}... </p>`;
}, opts);


const Cat = mongoose.model('Cat', CatSchema);

module.exports = Cat;