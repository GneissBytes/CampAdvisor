const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    if (!campgrounds) throw new ExpressError('No camps found', 503)
    res.render('campgrounds/index', { campgrounds, title: "All campgrounds" })
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new', { title: "New Campground" })
}

module.exports.submitCampground = async (req, res, next) => {
    const { campground } = req.body;
    const newCampground = new Campground({ ...campground });
    newCampground.author = req.user._id
    await newCampground.save()
    req.flash('success', 'Successfully added a new campground!')
    res.redirect('/campgrounds')
}

module.exports.showCampground = async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
        .populate({
            path: 'reviews', populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/show', { campground, title: campground.title })
}

module.exports.editCampground = async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/edit', { campground, title: `Editing ${campground.title}` })
}

module.exports.submitCampgroundChanges = async (req, res) => {
    const { _id } = req.params;
    const { campground } = req.body;
    const editedCampground = await Campground.findOneAndUpdate({ _id },
        { $set: { ...campground } },
        { new: true, runValidators: true, useFindAndModify: true })
    req.flash('success', 'Successfully updated the campground.')
    if (editedCampground == undefined) throw new ExpressError("No campground to edit with this id found.", 404)
    return res.redirect(`/campgrounds/${_id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id }, {useFindAndModify:false})
    req.flash('success', 'Successfully deleted the campground.')
    if (removedCampground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.redirect('/campgrounds')
}