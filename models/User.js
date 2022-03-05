const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
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

module.exports = model('User', UserSchema);
