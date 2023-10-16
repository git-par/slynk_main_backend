# Create FeedbackType (Admin Only)

Request

```
POST URL: /feedback_type/
Accept: application/json

*BODY* required
{
    "title": (string)(required),
}
```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *500* for Something happened wrong try again after sometimes.
```

```
Success with status code *200* for Successfully feedbackType Created.
feedbackType:
{
    "_id": "624419287aa9ce8f98b490d9"(Id),
    "title": "sddhjksd"(string),
    "createdAt": "2022-03-30T08:47:36.708Z",
    "updatedAt": "2022-03-30T08:47:36.708Z"
}
```

# Get Feedback Type

Request

```
GET URL : /feedback_type
Accept application/json
```

Response

```
Error with status code *500* for Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* for Successfully feedbackType founded.
 - It gives All FeedbackTypes.
```
