# Stackoverflow clone
A simple clone of Stackoverflow for Softcom back-end assessment

## Routes
The base API route is **`/api/v1`**. So every route below is assumed to begin with the base route.


### Users routes

- **User signup**
    - route: `POST /users`
    - protected: `false`
    - request headers: none              
    - request body: (`firstname`, `lastname`, `email`, `username`, `password`, `confirmPassword`)
    - response: `data` object with property `user`

- **User sign in**
    - route: `POST /login`
    - protected: `false`
    - request headers: none
    - request body: (`email` or `username`, `password`)
    - response:  `data` object with properties: `user` and `authorization`          

- **User sign out**
    - route: `DELETE /logout`
    - protected: `true`
    - request headers: `Authorization`
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
