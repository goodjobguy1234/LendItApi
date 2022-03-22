# LendItApi
An api for lend or borrow item in the university dorm. this is final project for web application. the api write by using express.js connect with mongoDB.

# Contributors (Team)
- Krittamet Chuwongworaphinit 6111252
- Thitare Nimanong 6210015
- Jeffrey Zhi Yee Chong 6310023

# How To Get Start

## Install
Clone the project and run `npm install` or run `yarn` to install dependencies.

## Run the App
    npm start (for npm)

    yarn start (for yarn)


# Features
The features according to the following:
- Users can lend item by spcifying price and duration. Items can be add/edit/delete by the lender.
- Borrowing items - Users can choose from the search page and add wanted items into borrowing list, confirmation request will be sent back to the lenders before processing (pending state).
- Returning items - a confirmation request will notify both lenders and borrower before returning item.
- Users can keep track of lending/borrowing history.


# Api list
## Item API

`GET /items` 

`POST /items`

`GET /items/:id`

`GET /items/?userId={studentID}`

`PUT /items/:id`

`DELETE /items/:id`

## Users API

`GET /users`

`GET /users/:studentID`

`PUT /users/:studentID`
 
## Borrow API
`POST /borrows/create-borrow`

`PATCH /borrows/lender/accept`
 
`GET /borrows/:id` 

`GET /borrows/lender?userId={userid}`

`GET /borrows/borrower?userId={userid}`

`DELETE /borrows/:id`

## Transaction
`GET /transactions` 

`GET /transactions/:id`

`GET /transactions/detail/:id`

`POST /transactions`

`PATCH /transactions/:id`
 

## Auth
`POST /auth/register`

`POST /auth/login`
 

---
for more API's information https://lent-it-api.herokuapp.com/api-docs/




