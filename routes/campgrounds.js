const express = require('express');
const wrapAsync = require('../utils/wrapAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {validateCampground} = require('../utils/validation')
const router = express.Router({mergeParams: true});

router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    if (!campgrounds) throw new ExpressError('No camps found', 503)
    res.render('campgrounds/index', { campgrounds, title: "All campgrounds" })
}));

router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    const { campground } = req.body;
    const newCampground = new Campground({ ...campground });
    await newCampground.save()
    res.redirect('/campgrounds')
}));

router.get('/new', wrapAsync(async (req, res) => {
    res.render('campgrounds/new', { title: "New Campground" })
}));


router.get('/:_id', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id).populate('reviews');
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/show', { campground, title: campground.title })
}));

router.get('/:_id/edit', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/edit', { campground, title: `Editing ${campground.title}` })
}));

router.put('/:_id/', validateCampground, wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const { campground } = req.body;
    const editedCampground = await Campground.findOneAndUpdate({ _id },
        { $set: { ...campground } },
        { new: true, runValidators: true, useFindAndModify: true })
    if (editedCampground == undefined) throw new ExpressError("No campground to edit with this id found.", 404)
    res.redirect(`/campgrounds/${_id}`)
}));

router.delete('/:_id/', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id })
    if (removedCampground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.redirect('/campgrounds')
}));

module.exports = router;