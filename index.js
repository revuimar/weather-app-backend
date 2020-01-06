const express = require('express')
let bodyParser = require('body-parser')
const es6Renderer = require('express-es6-template-engine');
const app = express();
const router = express.Router();
const port = 3000;
const cookieParser = require('cookie-parser');
const session = require("express-session");
const passport = require("./src/routing/passport");
const cron = require('node-cron');
const db = require('./src/query/database');


app.use(express.static(__dirname+'/client'));
app.use(cookieParser('keyboard cat'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));
app.use(router);


app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    console.log("index.js user:  ", req.user)
    res.locals.user = req.user || null
    next();
});

app.engine('html', es6Renderer);
app.set('views', './client');
app.set('view engine', 'html');

app.use(require("./src/routing/navigation"));
app.use(require("./src/routing/api"));

app.get('*', function(req, res, next) {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

cron.schedule('0 0 */12 * * *', function(){
    console.log('task triggered after full 12h');
    db.updateData();
});



app.listen(port,()=> console.log(`server listening on ${port}!`))
