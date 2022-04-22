import { Types, Schema, model } from 'mongoose';

export interface IFunc {
    name: string,
    creator: Types.ObjectId
    script: string
};

const FuncSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    creator: {
        type: Types.ObjectId,
        required: true,
        index: true
    },
    script: {
        type: String,
        required: true
    }
});

export default model<IFunc>('Func', FuncSchema);
