const mongoose = require('mongoose');
const schema = mongoose.Schema;


module.exports = mongoose.model('poll', new schema({
    qustion: String,
    createrId: String,
    createrUsername:String,
    public: Boolean,
    options: [String],
    result: [Number]
},{timestamps : true}));