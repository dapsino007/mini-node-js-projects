const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/signup.html');
});

app.post('/response', function(req, res){
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
      	   FNAME: firstName,
      	    LNAME: lastName,
        }
      }
    ]
  }

  const jsonData = JSON.stringify(data);

  const url = 'https://us6.api.mailchimp.com/3.0/lists/46a9bbeaa2';
  const options = {
    method: 'POST',
    auth: process.env.API_KEY
  };

  const request = https.request(url, options, function(response){
    response.on('data', (data)=>{
      console.log(JSON.parse(data));
      if(response.statusCode === 200){res.sendFile(__dirname+'/success.html');}
      else{res.sendFile(__dirname+"/failure.html");}
    })
  });

  request.write(jsonData);
  request.on('error', (e) => {console.error(e);});
  request.end();



});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, (e)=> console.log('server running'));


