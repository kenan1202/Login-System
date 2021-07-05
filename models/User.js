const mongoose = require('mongoose');
const {isEmail} = require('validator');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: [true, 'A username is already exist'],
        validate: [isEmail, 'Please enter valid email']
    },
    password: {
        type: String,
        required: true
    }
}, {
    collection: 'users'
});

const model = mongoose.model('User', UserSchema);

module.exports = model;