const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    slug: {
       type: String,
       required: true 
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    words: {
        type: [String],
        default: new Array(),
        select: false
    },
    public: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

ListSchema.index({ creator: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('List', ListSchema);
