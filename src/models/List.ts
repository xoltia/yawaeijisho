import { Types, Schema, Document, model } from 'mongoose';

export interface IList extends Document {
    creator: Types.ObjectId,
    slug: string,
    title: string,
    description?: string,
    words: string[],
    public: boolean,

}

const ListSchema = new Schema({
    creator: {
        type: Types.ObjectId,
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

export default model<IList>('List', ListSchema);
