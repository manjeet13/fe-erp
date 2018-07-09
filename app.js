require('dotenv').config();
const session = require('express-session');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');

const FileStore = require('session-file-store')(session);
//var favicon = require('serve-favicon');
//var express = require('express');
var express = require('express');
var path = require('path');
var passport = require('passport');
//const CONFIG = require('./config/config.js');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dynamicStatic = require('express-dynamic-static')();
var book = require('./routes/book');
var login = require ('./fe-server/main/process/default/routes/login.js');
var login_ctrl = require('./fe-server/main/process/default/controllers/login.js');
var aureole_lookup = require('./fe-server/main/process/default/routes/aureole_lookup.js');
var emp_details = require('./fe-server/legislations/fe/clients/fe/main/process/default/routes/fe_hrt_emp_info_t.js')
var aureole_lookup_ctrl = require('./fe-server/main/process/default/controllers/login.js');
var fe = express();
var app = express(); 
//import middleware
var middleware = require('./fe.middleware.dispatcher.js');


app.use(login_ctrl);
app.use(aureole_lookup_ctrl); 
app.use(passport.session());

app.use(logger('dev'));

app.use(dynamicStatic);

app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware')
    console.log(req.sessionID)
    return uuid() // use UUIDs for session IDs
  },
  key:'user_sid',
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,     //cookie won't be save for someone unauthorized(false)
  cookie:{
        maxAge:1200000,
        expires:1200000
  }
})); 
 
// checks if user's cookie is saved in the browser when user is logout
app.use((req, res, next)=>{
  if(req.cookies.user_sid && !req.session.username){
    res.clearCookie('user_sid');
  }
  next();   
});


//app.use('/api', book);
app.use('/api/default/login', login);
app.use(passport.session());

// app.use('/api/default/login',login);
// app.use('/api/default/aureolelookup',aureole_lookup);
// app.use('/api/default/empdetails',emp_details);
//app.get('/api/aureolelookup/*',aureole_lookup);
//main get Route 
/* app.use('/client/:id', function(req,res,next){
  if(req.params.id){
    console.log(req.params.id)
    clientIdentifier = req.params.id;
  }
  dynamicStatic.setPath(path.resolve(__dirname, 'dist/'+clientIdentifier)) 
  res.sendFile("index.html", {root: "./dist/" + clientIdentifier })
}); */

//dynamic route middleware
app.use('/:client/api/',middleware);

app.use(express.static(path.join(__dirname, "dist")));

/**
 * Angular app serve route
 * All routes starting with "ng" are routed to serve angular's "index.html"
 */

app.get("/fe/*", (req, res) => {
  console.log("/fe/*");
  console.log(req.session);
  return res.sendFile(path.join(__dirname, "dist", "fe", "index.html"));
});

// const models = require("./fe-server/main/process/default/models");
// models.sequelize.authenticate().then(() => {
//     console.log('Connected to SQL database:', CONFIG.db_name);
// })
// .catch(err => {
//     console.error('Unable to connect to SQL database:',CONFIG.db_name);
// });
// if(CONFIG.app==='dev'){
//     models.sequelize.sync();
//     // models.sequelize.sync({ force: true });
// }



// const sequelize = new Sequelize('mysql://chiragbansal:>G?3"qS/@dev-mumbai.cyvlbltrfdzs.ap-south-1.rds.amazonaws.com:3306/dev');


module.exports = app;








































// //var express = require('express');
// var express = require('express');
// var path = require('path');
// var passport = require('passport');
// //var favicon = require('serve-favicon');
// var logger = require('morgan');
// var bodyParser = require('body-parser');
// var dynamicStatic = require('express-dynamic-static')();
// var book = require('./routes/book');
// var login = require('./fe-server/main/process/default/routes/login.js');
// var login_ctrl = require('./fe-server/main/process/default/controllers/login.js')
// var fe = express();
// var app = express();

// var clientIdentifier;


// app.use(login_ctrl);
// app.use(passport.session());

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ 'extended': 'false' }));

// app.use(dynamicStatic);
// app.use('/api', book);
// app.use('/api/default/login', login);
// //main get Route 
// /* app.use('/client/:id', function(req,res,next){
//   if(req.params.id){
//     console.log(req.params.id)
//     clientIdentifier = req.params.id;
//   }
//   dynamicStatic.setPath(path.resolve(__dirname, 'dist/'+clientIdentifier)) 
//   res.sendFile("index.html", {root: "./dist/" + clientIdentifier })
// }); */
// app.use(express.static(path.join(__dirname, "dist")));
// /**
//  * Angular app serve route
//  * All routes starting with "ng" are routed to serve angular's "index.html"
//  */
// app.get("/fe/*", (req, res) => {
//   return res.sendFile(path.join(__dirname, "dist", "fe", "index.html"));
// });

// module.exports = app;
