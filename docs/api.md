/me Endpoint Documentation
Endpoint
GET /me

Description
The /me endpoint retrieves information about the currently authenticated user. It includes the user's basic details, the total number of books they have added, and the title of their most recent review (if available).

Request
Method: GET
Headers:
Authorization: Bearer <JWT_TOKEN> (required)
Response
Status Code: 200 OK
Content-Type: application/json
Body:
{
  "id": "user-id",
  "email": "user@example.com",
  "bookCount": 5,
  "latestReviewTitle": "The Great Gatsby"
}

Error Responses
401 Unauthorized:

Returned if the user is not authenticated or the JWT token is invalid.
Example:

{
  "error": "Unauthorized"
}
404 Not Found:

Returned if the user does not exist in the database.
Example:

{
  "error": "User not found"
}

500 Internal Server Error:

Returned if there is an unexpected error on the server.
Example:
{
  "error": "Internal server error"
}

Example Usage
Request:
GET /me HTTP/1.1
Host: api.bookbuddy.com
Authorization: Bearer <JWT_TOKEN>
Response:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "bookCount": 10,
  "latestReviewTitle": "To Kill a Mockingbird"
}

Notes
Ensure the Authorization header contains a valid JWT token obtained during login.
If the user has not written any reviews, the latestReviewTitle field will be null.