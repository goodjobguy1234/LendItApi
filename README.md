# LendItApi
An api for lend or borrow item in the university dorm. this is final project for web application. the api write by using express.js connect with mongoDB.

# Contributors (Team)
- Krittamet Chuwongworaphinit 6111252
- Thitare Nimanong 6210015
- Jeffrey Zhi Yee Chong 6310023

# How To Get Start

## Install
Clone the project and run `npm install` to install dependencies

## Run the App
    npm start


# Features
The features according to the following:
- Users can lend item by spcifying price and duration. Items can be add/edit/delete by the lender.
- Borrowing items - Users can choose from the search page and add wanted items into borrowing list, confirmation request will be sent back to the lenders before processing (pending state).
- Returning items - a confirmation request will notify both lenders and borrower before returning item.
- Users can keep track of lending/borrowing history.


# Api list
## Item Api

`GET /items` 

`POST /items`

`GET /items/id`

`GET /items/?catagory?name?price?rateType`

`PUT /items/id`

`DELETE /items/id`

## Users Api 
`POST /users`

`GET /users`

`GET /users/id`

`PUT /users/id`
 


## Transaction
`POST /transactions`

`PUT /transactions/id`
 
`GET /transactions` need body user id to get all transaction of that user




