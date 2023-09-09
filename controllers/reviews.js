const Cat = require('../models/cat');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const cat = await Cat.findById(req.params.id);
    const review = new Review(req.body.review);
    if (req.file) {
        review.image = { url: req.file.path, filename: req.file.filename };
    }
    review.reviewAuthor = req.user._id;
    cat.reviews.push(review);
    await review.save();
    await cat.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/cats/${cat._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Cat.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/cats/${id}`)
}