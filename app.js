const express = require("express");
const app = express();
const cors = require("cors");
const createError = require('http-errors');
var logger = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const customResponse = require('./middleware/customResponse');
const bcrypt = require('bcryptjs');

require('dotenv').config()
require('./db/db.js')
const Item = require('./db/models/items');
const User = require('./db/models/users');

const itemData = require('./sampleData/items.json');
const userData = require('./sampleData/users.json');

const itemRouter = require('./routes/items');
const userRouter = require('./routes/users');
const transactionRouter = require('./routes/transactions');
const BorrowRouter = require('./routes/borrows');
const AuthRouter = require('./routes/auth');
const { use } = require("./routes/users");

const swaggerOption = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "LendItApi",
			version: "1.0.0",
			description: "Api for lend and borrowing item within the dorm",
		},
		servers: [
			{
				url: "https://lent-it-api.herokuapp.com",
			},
			{
				url: "http://localhost:3000"
			}
		],
	},
	apis: ["./routes/*.js"],
}



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
app.use('/auth', AuthRouter);
app.use('/items', itemRouter);
app.use('/users', userRouter);
app.use('/transactions', transactionRouter);
app.use('/borrows', BorrowRouter);

app.get('/loadItemData', (req, res) => {
    Item.insertMany(itemData,{ ordered: false, rawResult: true }, (err, newCollection) => {
        if(err) return res.internal({errors: err, result: newCollection, message: "load item fail"});
        return res.success({errors: err, result: newCollection, message: "load item sucess"});
    });
});

app.get('/loadUserData', (req, res) => {
	userData.forEach( async (user) => {
		let userItem = {}

		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(user.password, salt);
		
		for (const key in user) {
			// console.log(key)
			if(key == "password") {
				userItem[`${key}`] = hashPassword;
			} else {
				userItem[`${key}`] = user[`${key}`];
			}
		}
		console.log("print from user item",userItem)
		
		var endUser = new User({...userItem});
		endUser.save();
	});
	return res.success({message: "user saved"})
	// User.insertMany(userData, (err, newCollection) => {
    //     if(err) return res.internal({errors: err, result: newCollection, message: "load item fail"});
    //     return res.success({errors: err, result: newCollection, message: "load item sucess"});
    // });
});

app.delete('/deleteUserData', (req, res) => {
	User.deleteMany({}, (err, resultRes) => {
		if(err) return res.internal({errors:err.errors, message: err.message});
		return res.success({message: "Delete All User Data"});
	});
});

app.delete('/deleteItemData', (req, res) => {
	Item.deleteMany({}, (err, resultRes) => {
		if(err) return res.internal({errors: err.errors, message: err.message});
		return res.success({message: "Delete All ItemData"});
	});
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