const express = require('express');
const app = express();

const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const request = require('request');
const date = require(__dirname + '/date.js');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

//connect database
mongoose.connect('mongodb+srv://admin-daniel:Test-123@to-do-list.wwn87.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('todolistDB connected');
});

//create mongoose Schema
const itemSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemSchema]
});

const Item = mongoose.model('item', itemSchema);
const List = mongoose.model('list', listSchema);

const day = date.getDate();


//get responses
app.get('/', function(req,res){
    const homeTitle = 'My To-Do List'
    Item.find({}, function(err, foundItems){
      res.render('list', {title: homeTitle, date: day, newItem: foundItems});
    });
});

app.get('/:customList', function(req,res){
    const customList = _.capitalize(req.params.customList);
    const instr = new List({
      name: customList,
      items: [{name: "<--Tip: Click on checkbox to delete item"}]
    });

    List.findOne({name:customList}, function(err, foundItems){
        if(foundItems == null){
            instr.save();
            res.redirect('/'+customList)
        }
        else{res.render('list',{title: customList, date: day, newItem: foundItems.items});}
    })
});

//post responses
app.post('/', function(req,res){
    const newItem = req.body.newtodo;
    const listName = req.body.listbutton;

    const addToList = new Item({
      name: newItem
    });

    if(listName === 'My'){
      addToList.save();
      res.redirect('/');
    }
    else{
      List.findOne({name:listName}, function(err, foundLists){
          foundLists.items.push({name:newItem});
          foundLists.save();
          res.redirect('/'+listName);
      })
    }
});

app.post('/delete', function(req,res){
    const itemID = req.body.checkbox;
    const listName = req.body.listname;

    if(listName === 'My To-Do List'){
        Item.findByIdAndRemove(itemID, err =>res.redirect('/'))
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id:itemID}}}, function(err, foundList){
          if(!err){
            res.redirect('/'+listName);
          }
        })
    }
});

//connect to localhost port
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, (e)=> console.log('Server running on port 3000'));
