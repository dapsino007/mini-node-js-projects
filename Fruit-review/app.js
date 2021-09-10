const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fruitsDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Successfully connected')
});

const fruitSchema = new mongoose.Schema({
  name: {type:String, required: true},
  rating:{type: Number, required: [true, 'Why no rating?'], min:1, max: 5},
  review: String
});

const personSchema = new mongoose.Schema({
  name: String,
  age: Number,
  Job: String,
  favoriteFruit: fruitSchema
});

const Fruit = mongoose.model('Fruit', fruitSchema);
const Person = mongoose.model('Person', personSchema);

const orange = new Fruit({
  name: 'orange',
  rating: 4,
  review: 'minus the occasional sour ones, oranges are great'
})
const apple = new Fruit({
  name: 'apple',
  rating: 5,
  review: 'Definitely a 5 star fruit'
})
const grape = new Fruit({
  name: 'grape',
  rating: 4.5,
  review: 'Now we are talking aquired taste'
})

const person = new Person({
  name: 'Billy',
  age: 34,
  Job: 'Software Engineer'
})

const daniel =  new Person({
  name: 'Daniel',
  age: 34,
  Job: 'Web Developer',
  favoriteFruit: apple
});

daniel.save();

Person.updateOne({name:'Billy'}, {favoriteFruit: grape}, function(err){
  if(err){console.log(err);}
  else{console.log('Successfully undated favorite Fruit for Billy');}
})

// fruit.save();
// person.save();

// Fruit.insertMany([orange, apple, grape], (err)=>{
//   if(err){
//     console.log(err);
//   }
//   else{console.log('Successfully saved all the fruits to fruitsDB')}
// });

// Fruit.find(function(err, fruits){
//   if(err){
//     console.log(err);
//   }
//   else{
//     fruits.forEach(fruit =>console.log(fruit.name));
//   }
// })
