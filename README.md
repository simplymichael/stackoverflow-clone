# Stackoverflow clone
A simple clone of Stackoverflow for Softcom back-end assessment

## Routes
The base API route is **`/api/v1`**. So every route below is assumed to begin with the base route.

| **Name**           | **Route**                   | **Body**          | **Headers**   | **Query** | **Response**       |
|--------------------------------------------------|-------------------|---------------|-----------|--------------------|
| User signup        | POST /users                 | firstname         |               |           | data.user          |
|                    |                             | lastname          |               |           |                    |
|                    |                             | email             |               |           |                    |
|                    |                             | username          |               |           |                    |
|                    |                             | password          |               |           |                    |
|                    |                             | confirmPassword   |               |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| User sign in       | POST /login                 | email or username |               |           | data.user          |
|                    |                             | password          |               |           | data.authorization |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| User sign out      | DELETE /logout              |                   | Authorization |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| Ask question       | POST /questions             | title             | Authorization |           |                    |
|                    |                             | body              |               |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| List questions     | GET /questions              |                   |               |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| View question      | GET /questions/:id          |                   |               |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| Answer question    | POST /questions/:id/answers | body              | Authorization |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| Vote on a question | POST /questions/:id/votes   | direction         | Authorization |           |                    |
|----------------------------------------------------------------------|---------------|-----------|--------------------|
| Search questions   | GET /questions/search       |                   |               |           |                    |
|--------------------|-----------------------------|-------------------|---------------|-----------|--------------------|
| Search answers     | GET /answers/search         |                   |               |           |                    |
|--------------------|-----------------------------|-------------------|---------------|-----------|--------------------|
| Search users       | GET /users/search           |                   |               |           |                    |
