# Stackoverflow clone
A simple clone of Stackoverflow for Softcom back-end assessment

## Running
### Prerequisites
- Running or testing the application requires a running instance of a MongoDB server.
- Navigate to the `backend` directory: `cd backend`
- Copy `.env.example` to `.env` and edit environment data
- Alternatively set the `env` variables on the command line

## Starting on Windows
set DEBUG=<APP_NAME>& npm start

## Starting on Unix
DEBUG=<APP_NAME> npm start

## Testing

### Pre-requisites
- See the pre-requisites on the **Running** section
- Run `npm test`

## Routes
The base API route is **`/api/v1`**. So every route below is assumed to begin with the base route.

A more detailed API documentation can be found on the [Swagger page](https://app.swaggerhub.com/apis/simplymichaelorji/StackoverflowCloneAPIForSoftcom/1.0.0)


### Users routes

- **User signup**
    - route: `POST /users`
    - protected: `false`
    - request headers: none              
    - request body: (`firstname`, `lastname`, `email`, `username`, `password`, `confirmPassword`)
    - response: `data` object with property `user`

- **User sign in**
    - route: `POST /users/login`
    - protected: `false`
    - request headers: none
    - request body: (`email` or `username`, `password`)
    - response:  `data` object with properties: `user` and `authorization`          

- **User sign out**
    - route: `GET /users/logout`
    - protected: `false`
    - request headers: none
    - request body: none
    - response:

- **Retrieve user listing**:
    - route: `GET /users`
    - protected: `false`
    - request headers: none              
    - request body: none
    - response: `data` object with properties: `total`, `length`, `users`

- **Search users**:
    - route: `GET /users/search?query=<str>`
    - protected: `false`
    - request headers: none              
    - request body: none
    - response: `data` object with properties: `total`, `length`, `users`
----------------------

### Questions routes
- **Ask question**
    - route: `POST /questions`
    - protected: `true`
    - request headers: `Authorization`
    - request body: (`title`, `body`)
    - response: `data` object with property `question`

- **List questions**
    - route: `GET /questions`
    - protected: `false`
    - request headers: none
    - request body: none
    - response: `data` object with properties: `total`, `length`, `questions`

- **Search questions**
    - route: `GET /questions/search?query=<str>`
    - protected: `false`
    - request headers: none
    - request body: none
    - response: `data` object with properties: `total`, `length`, `questions`              

- **View question (retrieve details of a question)**
    - route: `GET /questions/:id`
    - protected: `false`
    - request headers: none
    - request body: none
    - response: `data` object with property `question`

- **Answer question**
    - route: `POST /questions/:id/answers`
    - protected: `true`
    - request headers: `Authorization`
    - request body: (`body`)
    - response: `data` object with property `answer`

- **Vote on a question**
    - route: `POST /questions/:id/votes`
    - protected: `true`
    - request headers: `Authorization`
    - request body: (`direction`: `up` | `down`)
    - response: `data` object with property `vote`
--------------------------

### Answers routes
- **Search answers**
    - route: `GET /answers/search?query=<str>`
    - protected: `false`
    - request headers: none
    - request body: none
    - response: `data` object with properties: `total`, `length`, `results`

- **View answer (retrieve details of an answer)**
    - route: `GET /questions/:id`
    - protected: `false`
    - request headers: none
    - request body: none
    - response: `data` object with property `answer`

- **Vote on an answer**
    - route: `POST /questions/:id/votes`
    - protected: `true`
    - request headers: `Authorization`
    - request body: (`direction`: `up` | `down`)
    - response: `data` object with property `vote`
