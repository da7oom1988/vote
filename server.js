
//requirment
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');


//static
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
var port = process.env.PORT || 3000;
const routes = require('./moduls/routes')(app);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/vote');



//listening
app.listen(port,function(err){
    if(err) return console.log(err);
    console.log("working in port: " + port)
});
