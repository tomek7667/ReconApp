const port = 3000;
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let r01 = require('./routes/01');
let r02 = require('./routes/02');
let fs = require('fs');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// Modules routers:
app.use('/01', r01);
app.use('/02', r02);

app.listen(port, '0.0.0.0', () => {
  console.log(`Node server running on ${port}`);
});
