const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    User_name: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Number_phone: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
