var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var fileUpload = require('express-fileupload');
var session = require('express-session');
var index = require('./routes/index');
var dashboard = require('./routes/dashboard');
var users = require('./routes/users');
var guru = require('./routes/guru');
var pegawai = require('./routes/pegawai');
var expressValidator = require('express-validator');
var methodOverride = require('method-override');
var connection = require('express-myconnection');
var mysql = require('mysql2');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:"telkom"}));
app.use(flash());
app.use(fileUpload());
app.use(expressValidator());
app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body == 'object' && '_method' in req.body)
        {
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*------------------------------------------
connection peer, register as middleware
type koneksi : single,pool and request
-------------------------------------------*/
app.use(
    connection(mysql,{
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER, // your mysql user
        password : process.env.MYSQLPASSWORD, // your mysql password
        port : process.env.MYSQLPORT, //port mysql
        database:process.env.MYSQLDATABASE // your database name
    },'pool') //or single
);
app.use('/', index);
app.use('/dashboard', dashboard);
app.use('/guru', guru);
app.use('/pegawai', pegawai);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
