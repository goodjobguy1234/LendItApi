const express = require("express");
const app = express();
const cors = require("cors");
const createError = require('http-errors');
var logger = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const customResponse = require('./middleware/customResponse');

require('dotenv').config()
require('./db/db.js')

const itemRouter = require('./routes/items');
const userRouter = require('./routes/users');

const swaggerOption = {
    swaggerDefinition: {
        info: {
            title: 'LendItApi',
            description: "Api for lend and borrowing item within the dorm",
            contract: {
                name: "Thitare Nimanong"
            },
            servers: ["https://lent-it-api.herokuapp.com", "http://localhost:3000"]
        }
    },
    apis: ["app.js", "./routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOption);


require('dotenv').config();
require('./db/db.js')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

app.use('/items', itemRouter);
app.use('/users', userRouter);

// /**
//  * 
//  * @swagger
//  *  /:
//  *  get:
//  *   description: test api
//  *   parameters:
//  *   - in: query
//  *     name: id
//  *     type: int
//  *   - in: query
//  *     name: catagory
//  *     type : string
//  *   responses:
//  *    200:
//  *     description: A successful response
//  * 
//  */
// app.get('/', (req, res) => {
//     let {id, catagory} = req.query;
//     if(id === undefined || catagory === undefined) {
//         return res.badreq({
//             message: "empty id and catagory" 
//         })
//     } else {
//         return res.success({
//             result: {
//                 id: +id,
//                 catagory: catagory
//             }
//         })
//     }
// });

// /**
//  * @swagger
//  * paths:
//  *  /test:
//  *   get:
//  *    description: test api
//  *    responses:
//  *      200:
//  *          description: A successful response
//  * 
//  */
// app.get('/test', (req, res) => {
//     res.send("test");
// });

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