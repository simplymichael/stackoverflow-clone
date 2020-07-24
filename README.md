# Stackoverflow clone
A simple clone of Stackoverflow for Softcom back-end assessment

## Routes
The base API route is **`/api/v1`**. So every route below is assumed to begin with the base route.

- **User signup**
    - route: `POST /users`
    - request headers: none              
    - request body: (`firstname`, `lastname`, `email`, `username`, `password`, `confirmPassword`)
    - response: `data` object with property `user`

- **User sign in**
    - route: `POST /login`
    - request headers: none
    - request body: (`email` or `username`, `password`)
    - response:  `data` object with properties: `user` and `authorization`          

- **User sign out**
    - route: `DELETE /logout`
    - request headers: `Authorization`
    - request body: none
    - response:

- **Ask question**
    - route: `POST /questions`
    - request headers: `Authorization`
    - request body: (`title`, `body`)
    - response: `data` object with property `question`

- **List questions**
    - route: `GET /questions`
    - request headers: none
    - request body: none
    - response: `data` object with property `questions`              

- **View question**
    - route: `GET /questions/:id`
    - request headers: none
    - request body: none
    - response: `data` object with property `question`

- **Answer question**
    - route: `POST /questions/:id/answers`
    - request headers: `Authorization`
    - request body: (`body`)
    - response: `data` object with property `answer`

- **Vote on a question**
    - route: `POST /questions/:id/votes`
    - request headers: `Authorization`
    - request body: (`direction`: `up` | `down`)
    - response: `data` object with property `vote`

- **Search questions**
    - route: `GET /questions/search`
    - request headers: none
    - request body: none
    - response: `data` object with property `results`

- **Search answers**
    - route: `GET /answers/search`
    - request headers: none
    - request body: none
    - response: `data` object with property `results`

- **Search users**
    - route: `GET /users/search`
    - request headers: none
    - request body: none
    - response: `data` object with property `results`
