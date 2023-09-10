const { catSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Cat = require('./models/cat');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    console.log('REQ.USER...', req.user); //req.user is filled in by passport with the serialized user info
    if (!req.isAuthenticated()) {
        //store the url they are requesting
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCat = (req, res, next) => {
    console.log("Value of cat[fluffy]:", req.body.cat.fluffy); // Add this line for debugging
    const { error } = catSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params; //this is the id of the cat
    const cat = await Cat.findById(id);
    if (!cat.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/cats/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; //this is the id of the cat
    const review = await Review.findById(reviewId);
    if (!review.reviewAuthor.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/cats/${id}`);
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}




