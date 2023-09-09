const express = require('express');
const router = express.Router();
const cats = require('../controllers/cats');
const catchAsync = require('../utilities/catchAsync');
const { catSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCat } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ExpressError = require('../utilities/ExpressError');
const Cat = require('../models/cat');

router.get('/', catchAsync(cats.index));

router.get('/new', isLoggedIn, cats.renderNewForm);

router.post('/', isLoggedIn, upload.array('image'), validateCat, catchAsync(cats.createCat));

router.get('/:id', catchAsync(cats.showCat));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(cats.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCat, catchAsync(cats.updateCat));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(cats.deleteCat));


module.exports = router;