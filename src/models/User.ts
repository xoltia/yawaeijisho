import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser {
    username: string,
    password: string,
    comparePassword(string: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
});

UserSchema.pre('save', function(next) {
    // Continue if the password wasn't changed
    if (!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) next(err);
        // Set password to hashed password and continue
        this.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function(password) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, this.password, (err, success) => {
            if (err) return reject(err);
            return resolve(success);
        });
    });
}

export default model<IUser>('User', UserSchema);
