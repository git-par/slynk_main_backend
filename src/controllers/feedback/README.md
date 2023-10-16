# Admin Feedback (Admin Only)

Request

```
POST URL : /feedback/admin_reply
Accept application/json

*BODY*
{
    "email":(string)(required),
    "subject":(string)(required),
    "message":(string)(required),
}

```

Response

```
Error with status code *224* for Invalid Body (Something happened wrong try again after sometime).
Error with status code *422* for Invalid Body.
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully Admin Reply send.
 "message":"Reply has been Sent."
```

# Reply ALL User (Admin Only)

Request

```
POST URL : /feedback/mail_all_user
Accept application/json

*BODY*
{
    "subject":(string)(required),
    "message":(string)(required),
}

```

Response

```
Error with status code *422* for Invalid Body.
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully Send Reply.
 "message":"Mail Successfully Send."
```

# Create Feedback

Request

```
POST URL: /feedback/
Accept: application/json

*BODY* required
{
    "messageType": (string)(required),
    "responseType": (boolean)(required),
    "subject": (string)(required),
    "message": (string)(required),
}
```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *500* for Something happened wrong try again after sometimes.
```

```
Success with status code *200* for Successfully feedback send
"message":"Thank you for your feedback."
```

# Get Feedback

Request

```
GET URL : /feedback
Accept application/json
```

Response

```
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully feedback founded.
 - It gives All Feedback details.
{
    "_id": (feedbackId),
        "email": (string),
        "messageType": (MessageId),
        "responseType": (boolean),
        "subject": (string),
        "message": (string),
        "createdAt": "2022-03-30T06:35:04.025Z",
        "updatedAt": "2022-03-30T06:35:04.025Z"
}
```
