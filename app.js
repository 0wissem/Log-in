//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs =require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine", "ejs")
app.use(express.static("public"))
///
app.use(session({
    secret:'usnig a srcert',
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())



//DB connection to userDB (or creating it if it's undefined)
mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true,useUnifiedTopology: true })
//
mongoose.set('useCreateIndex',true)
//Define the userSchema
const userSchema = new mongoose.Schema({
    email: String,
    password : String
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)
//
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//Routers
app.get('/',function(req,res){
    res.render('home')
})
app.get('/login',function(req,res){
    res.render('login')
})
app.get('/register',function(req,res){
    res.render('register')
})
app.get('/secrets',function(req,res){
    if(req.isAuthenticated())
        res.render('secrets')
    else{
        res.redirect('/login')
    }
})
app.get('/logout', function(req,res){
    req.logout()
    res.redirect('/')
})

// storing data in DB
app.post('/register',function(req,res){

    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register')
        } else {
            console.log('succesfully Registred');
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets')
            })
        }

})
})

// cheking of data entries to login
app.post('/login', function(req,res){

    const user = new User({
       usename: req.body.username,
       password: req.body.password
    })
    req.login(user,function(err){
        if(err){
           console.log(err)
        } else {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets')
            })
       }
   })

})






app.listen(3000,function(){
    console.log('server is listenning on the port 3000')
})