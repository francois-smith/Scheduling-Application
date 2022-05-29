let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let app = express();

const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let routes = require('./router/router.js')(app, fs);

let port  = process.env.PORT || 3000;
app.listen(port);
console.log('Server is running on port ' + port);