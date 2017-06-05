const mongoose = require('mongoose');
const schema = mongoose.Schema;


module.exports = mongoose.model('user', new schema({
    name: String,
    username: String,
    email: { type: String,lowercase: true},
    password: String,
},{timestamps : true}));

