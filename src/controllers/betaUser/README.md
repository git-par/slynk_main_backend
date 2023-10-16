# Create BETA USER

Request

```
POST URL : /betaUser/invite
Accept: application/json

*BODY*
Data:
{
    "firstName":(string)(optional),
    "lastName":(string)(optional),
    "plateForm":(string)(optional),
    "user":(string)(optional),
    "email":(string)(required),
    "phoneNumber:(string)(optional)
}
```

Response

```
Error status code *422* For Invalid Body.
Error status code *422* For Invalid Body(When you are already registered).
Error status code *224* For Invalid Body(When Something happen Wrong).
Error status code *415* For Invalid Body(When you have already subscribe).
Error status code *500* For Something happen Wrong try again after sometime.

```

```
Success status code *200* For Invite code successfully sended(If You are Already Beta User).

Success status code *200* For Invite code successfully sended(If You New Beta User Is Created).

```

# Verify Code

Request

```
POST URL : /betaUser/verify
Accept: application/json

*BODY*
Data:
{
    "code": (string)(required)
}
```

Response

```
Error status code *422* For Invalid Body.
Error status code *422* For Please Provide Valid Code(IF Not BetaUser).
Error status code *422* For You Already registerd With us.
Error status code *500* For Hmm... Something went wrong. Please try again later.
```

```
Success code *200* For When You Enter Master Code.
"message":"success"
Success code *200* IF Code Is verifed Successfully.
"message":"success"
```

# Get BETA USER (Admin Only)

Request

```
GET URL: /betaUser/
Accept: application/json

```

Response

```
Error status Code *500* For Somthing Happened wronge try again after sometime.
```

```
Success code *200* For Successfully Beta User Founded.
{
    "_id":(id),
        "firstName": (string),
        "lastName": (string),
        "email": (string),
        "platform": (string)
}
```

# Delete BETA USER (Admin Only)

Request

```
DELETE URL: /betaUser/:_id
Accept application/json

*PARAMS* BetaUser Id
```

Response

```
Error Status Code *422* Invalid Data(If Id not Founded.)
Error Status Code *422* Invalid Data(If BetaUser not Founded.)
```

```
Success Status Code *200* Beta User Successully Deleted"
"message":"Beta User deleted."
```
