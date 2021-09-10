const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');


const homeStartingContent = 'Education is the key to success... never stop learning! ';
const contactContent = 'You can contact me at danieltutorschoolisfun@gmail.com';


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//connect to database
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-daniel:Test-123@cluster0.mvuoh.mongodb.net/posts?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongo database connected');
});

//db schema and model setup
const postSchema = new mongoose.Schema({
  title: String,
  post: String
});

const Post = mongoose.model('post', postSchema)

//app get responses
//static pages
app.get('/', function(req,res){

  Post.find({}, function(err, foundpost){
    res.render('home', {
      homecontent: homeStartingContent,
      blogposts: foundpost
    });
  })
});

app.get('/about', function(req,res){
  res.render('about');
});

app.get('/contact-us', function(req,res){
  res.render('contact', {contactcontent: contactContent});
});

app.get('/compose', function(req,res){
  res.render('compose');
});

//custom pages
app.get('/posts/:posttitle', function(req,res){
  const postTitle = req.params.posttitle;

  Post.findOne({title:postTitle}, function(err, post){
    if(post == null){
      console.log('there is no page with ' + postTitle + ' in the database');
      res.redirect('/');
    }
    else{
      res.render('post', {
        posttitle: post.title,
        postcontent: post.post
      });
    }
  });
})

//app post responses
app.post('/compose', function(req,res){

  const newPost = new Post({
    title : req.body.blogtitle,
    post : req.body.blogpost
  });
  newPost.save();

  res.redirect('/')
})

let port = process.env.PORT
if(port == null || port == ''){
  port = 3000;
}
app.listen(port, (e)=>console.log('server listening on ' + port));
