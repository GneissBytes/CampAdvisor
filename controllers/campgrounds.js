const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const User = require('../models/user')
const { cloudinary } = require('../cloudinary/index')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const accessToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken })
const countSufix = require('../utils/countSufixer')



module.exports.index = async(req, res) => {
    const { viewcount = 10, pagenumber = 1 } = req.query
    const allCampgroundsFound = await Campground.find()
    const allCampgrounds = [];
    allCampgroundsFound.forEach((campground)=> allCampgrounds.push(campground.toMapBox))
    const campgroundCount = await Campground.find().countDocuments()
    if (campgroundCount == 0) {
        return res.render('campgrounds/no_campgrounds', {title:'Campground list'})
    }
    const campgrounds = await Campground.find().skip(viewcount * (pagenumber - 1)).limit(Number(viewcount)).populate('reviews','rating')
    const title = `List of campgrounds`
    const header = `Showing ${countSufix(pagenumber)} page.`
    const maxPages = Math.ceil(campgroundCount / Number(viewcount))
    if (pagenumber < maxPages + 1) {
        res.render('campgrounds/index-paged', { campgrounds, allCampgrounds, title, viewcount, pagenumber, header, maxPages })
    } else {
        res.redirect(`/campgrounds?pagenumber=${maxPages}&viewcount=${viewcount}`)
    }
}

module.exports.renderNewForm = async(req, res) => {
    res.render('campgrounds/new', { title: "New Campground" })
};

module.exports.submitCampground = async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    const geodata = await geocoder.forwardGeocode({
        query: campground.location,
        limit: 1
    }).send()
    campground.geometry = geodata.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    const user =await User.findById(req.user._id)
    user.campgrounds.push(campground)
    await campground.save()
    req.flash('success', 'Successfully added a new campground!')
    res.redirect('/campgrounds')
};

module.exports.showCampground = async(req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/show', { campground, title: campground.title })
};

module.exports.editCampground = async(req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/edit', { campground, title: `Editing ${campground.title}` })
};

module.exports.submitCampgroundChanges = async(req, res) => {
    const { _id } = req.params;
    let { campground } = req.body;
    const editedCampground = await Campground.findOneAndUpdate({ _id }, { $set: {...campground } }, { new: true, runValidators: true, useFindAndModify: false })
    editedCampground.images.push(...req.files.map(f => ({ url: f.path, filename: f.filename })))
    await editedCampground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await editedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the campground.')
    if (editedCampground == undefined) throw new ExpressError("No campground to edit with this id found.", 404)
    return res.redirect(`/campgrounds/${_id}`)
};

module.exports.deleteCampground = async(req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id }, { useFindAndModify: false })
    req.flash('success', 'Successfully deleted the campground.')
    if (removedCampground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.redirect('/campgrounds')
};

module.exports.deleteCampgroundUser = async(req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id }, { useFindAndModify: false })
    req.flash('success', 'Successfully deleted the campground.')
    if (removedCampground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.redirect(`/users/${removedCampground.author}`)
};

module.exports.deleteCampgroundAdmin = async(req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id }, { useFindAndModify: false })
    req.flash('success', 'Successfully deleted the campground.')
    if (removedCampground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.redirect(`/admin`)
};