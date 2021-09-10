const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//connect db
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('wikiDB connected');
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model('Article', articleSchema);

//Requests targeting all articles
app.route('/articles')
.get(function(req,res){
  Article.find((err, foundArticles)=>{
    if(!err){
        res.send(foundArticles);
    }
    else{
      res.send(err);
    }
  })
})

.post(function(req,res){
  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });
  newArticle.save(err=>{
    if(!err){
      res.send('Successfully saved article');
    }
    else{res.send(err);}
  });
})

.delete(function(req,res){
  Article.deleteMany(function(err){
    if(!err){
      res.send('Successfully deleted all articles')
    }
    else{
      res.send(err)
    }
  })
})

//Requests targeting specific articles
app.route('/articles/:title')
.get(function(req,res){
  Article.findOne({title: req.params.title}, (err, foundArticle)=>{
    if(foundArticle){res.send(foundArticle);}
    else{res.send('No articles with that title was found');}

  })
})
.put(function(req,res){
  Article.replaceOne(
    {title: req.params.title},
    {title: req.body.title, content: req.body.content},
    {overwrite: true},
    function(err){
      if(!err){res.send('Article was successfully updated!')}
      else{res.send('There was an error updating this article')}
    })
})
.patch(function(req,res){
  Article.updateOne(
    {title:req.params.title},
    {$set: req.body},
    function(err){
      if(!err){res.send('Successfully updated the article')}
      else{res.send('There was an error in the update')}
    })
})
.delete(function(req,res){
  Article.deleteOne({title:req.params.title}, function(err){
    if(!err){
      res.send('Successfully deleted article')
    }
    else{
      res.send('There was an error in deleting this article')
    }
  })
});

//connect server
app.listen(3000, (e)=> console.log('server listening on port 3000'))
