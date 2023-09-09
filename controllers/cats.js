const Cat = require('../models/cat');
const colors = ['Orange', 'Black', 'White', 'Calico', 'Grey Striped', 'Grey Uniform', 'Tuxedo', 'Siamese', 'Black & White', 'Orange & White', 'Grey & White', 'Brown'];
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN; //this is the token that we set in the .env file
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const cats = await Cat.find({});
    res.render('cats/index', { cats })
};

module.exports.renderNewForm = async (req, res) => {
    const cats = await Cat.find({});
    res.render('cats/new', { colors, cats })
};

module.exports.createCat = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.cat.location,
        limit: 1
    }).send();
    const cat = new Cat(req.body.cat);
    cat.geometry = geoData.body.features[0].geometry;
    cat.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    cat.author = req.user._id;
    await cat.save();
    console.log(cat);
    req.flash('success', 'Successfully added a new cat!');
    res.redirect(`/cats/${cat._id}`)
}

module.exports.showCat = async (req, res) => {
    const { id } = req.params;
    const cat = await Cat.findById(id).populate({ //populate reviews and author of reviews for each cat
        path: 'reviews',
        populate: {
            path: 'reviewAuthor'
        }
    }).populate('author');
    let avgRating = cat.calculateAvgRating()
    if (!cat) {
        req.flash('error', 'Cannot find that cat!');
        return res.redirect('/cats');
    }
    res.render('cats/show', { cat, avgRating })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const cats = await Cat.find({});
    const cat = await Cat.findById(id);
    if (!cat) {
        req.flash('error', 'Cannot find that cat!');
        return res.redirect('/cats');
    }
    res.render('cats/edit', { cat, colors, cats })
}

module.exports.updateCat = async (req, res) => {
    const { id } = req.params;
    const cat = await Cat.findByIdAndUpdate(id, { ...req.body.cat });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); //this is the array of images that we are adding to the cat
    cat.images.push(...imgs);
    await cat.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await cat.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated cat!');
    res.redirect(`/cats/${cat._id}`)
}

module.exports.deleteCat = async (req, res) => {
    const { id } = req.params;
    await Cat.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted cat :((( ');
    res.redirect('/cats')
}