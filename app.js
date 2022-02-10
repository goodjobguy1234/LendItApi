const express = require("express");
const app = express();
const cors = require("cors");
const createError = require('http-errors');
var logger = require('morgan');
const customResponse = require('./middleware/customResponse');


require('dotenv').config();
require('./db/db.js')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

//custom middleware for doing custom json response
app.use(customResponse);
app.use(function (req, res, next) {
    const protocol = req.protocol;
    const host = req.hostname;
    const url = req.originalUrl;
    const fullurl = `${protocol}://${host}:${port}${url}`;

    console.log('url', fullurl)
    next()
})
//test
app.get('/', (req, res) => {
    let {id, catagory} = req.query;
    if(id === undefined || catagory === undefined) {
        return res.badreq({
            message: "empty id and catagory" 
        })
    } else {
        return res.success({
            result: {
                id: +id,
                catagory: catagory
            }
        })
    }
});

const port = process.env.PORT || 3000;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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


app.listen(port, () => {
    
    console.log(`listening on port ${port}`);
});