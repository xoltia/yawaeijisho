const asyncHandler = require('express-async-handler');
const List = require('../models/List');
const User = require('../models/User');
const { isAuthorized } = require('../middleware/authorization');

module.exports.getMyLists = asyncHandler(async (req, res) => {
    const creator = req.userId;
    const lists = await List.find({ creator });
    res.json(lists);
});

module.exports.getList = asyncHandler(async (req, res) => {
    const { username, title, id } = req.query;
    let list;

    if (id) {
        list = await List.findById(id);
    } else {
        const creator = await User.findOne({ username }).select('_id');
        if (!creator)
            return res.sendStatus(404);
        list = await List.findOne({ title, creator: creator.id });
    }

    if (!list)
        return res.sendStatus(404);
    else if (list.public)
        return res.json(list);

    isAuthorized(req, res, () => {
        if (req.userId === list.creator.toString()) {
            res.json(list);
        } else {
            res.sendStatus(404);
        }
    }, 404);
});

module.exports.addWordsToList = asyncHandler(async (req, res) => {
    const list = await List.findById(req.params.id).select('words creator');

    // No list found
    if (!list)
        return res.sendStatus(404);
    // If list is found make sure this user is the creator
    // Pretend list doesn't exist if list isn't public and not authorized to change list
    else if (list.creator.toString() !== req.userId)
        return res.sendStatus(list.public ? 401 : 404);

    await List.updateOne({ _id: list._id }, {
        $addToSet: {
            words: {
                $each: req.body
            }
        }
    });

    res.sendStatus(200);
});

module.exports.getListWords = asyncHandler(async (req, res) => {
    const list = await List.findById(req.params.id).select('words public creator');
    
    if (!list)
        return res.sendStatus(404);
    else if (list.public)
        return res.json(list.words);

    isAuthorized(req, res, () => {
        // Send list only if request made by creator
        if (req.userId === list.creator.toString()) {
            res.json(list.words);
        } else {
            res.sendStatus(404);
        }
    }, 404);
});

module.exports.postList = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        slug,
        public
    } = req.body;

    const list = new List({
        creator: req.userId,
        title,
        description,
        slug,
        public
    });

    await list.save();
    res.json(list);
});
