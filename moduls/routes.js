const userdb = require('./usersDB');
const pollsdb = require('./pollsDB');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');

var secret = "hello";




module.exports = function(app){

    app.post('/api/signup',function(req,res){
        userdb.findOne({username: req.body.username},function(err,data){
              if(err) return console.log(err);
             if(data != null){
                 return res.send("this username is already taken");
             }
             else{
                bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(req.body.password,salt,function(err,hash){
                    var data = new userdb({
                                    name: req.body.name,
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: hash,
                                    polls:[]
                                    });
                    data.save(function(err){
                        if(err) return console.log(err);
                    });
                });
            });
            
            res.end();
             }
        });
        
        
        
    });

    app.post('/api/login',function(req,res){
        var email = (req.body.email).toLowerCase();
        if(email.indexOf('@') != -1){
            userdb.findOne({email: email},function(err,data){
                if(err) console.log(err);

                if(!data){
                    return res.status(403).send();
                }else{
                    bcrypt.compare(req.body.password, data.password, function(err, rez){
                        if(rez) {
                            var token = jwt.encode(data, secret);
                            return res.json({token: token, currUser: data.username});
                        }
                        else return res.status(403).send();
                    });
                }
            });
        }else{
             userdb.findOne({username: email},function(err,data){
                 if(err) console.log(err);

                if(!data){
                    return res.status(403).send();
                }else{
                    bcrypt.compare(req.body.password, data.password, function(err, rez){
                        if(rez) {
                            var token = jwt.encode(data, secret);
                            return res.json({token: token, currUser: data.username});
                        }
                        else return res.status(403).send();
                    });
                }
            });
        }
       
    });

    app.post('/api/newpoll',function(req,res){
        if(!req.body.token) return res.status(403).send();
        var user = jwt.decode(req.body.token, secret);
        var newPoll = new pollsdb({
               qustion: req.body.qustion,
                createrId: user._id,
                createrUsername:user.username,
                public: (req.body.public == "true")? true : false,
                options: req.body.options,
                result: req.body.result
       });

       newPoll.save(function(err){
           if(err) return console.log(err);
       });
        res.json(newPoll._id);
    });

    app.get('/api/getpoll/:id',function(req,res){
        var id = req.params.id;
        pollsdb.findById(id,function(err,data){
            if(err) return console.log(err);

            if(!data) return res.send("cant");
            else{
                res.json(data);
            }
        });
    });

    app.post('/api/getpoll/:id',function(req,res){
        var id = req.params.id;
        var index = req.body.result;
        var update = {};
        update['result.' + index] = 1;
        pollsdb.findByIdAndUpdate(id,{$inc:update},function(err){
            if(err) return console.log(err);
        });


        res.end();
    });

    app.get('/api/mypolls',function(req,res){

        var token = req.headers.user;
        var user =jwt.decode(token,secret);

        pollsdb.find({createrId: user._id},function(err,data){
           if(err) return console.log(err);
           if(!data) return res.json({qustion: "you have No polls!!"});
           res.json(data);
        });

    });

    app.get('/api/polls',function(req,res){

        pollsdb.find({public: true},function(err,data){
           if(err) return console.log(err);
           if(!data) return res.json({qustion: "you have No polls!!"});
           res.json(data);
        });

    });

    app.post('/api/delpoll',function(req,res){
        pollsdb.findByIdAndRemove(req.body._id,function(err){
            if(err) return console.log(err);
            res.end();
        });
    });


};