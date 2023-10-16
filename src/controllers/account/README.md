# Create Account

Request

```
POST URL : /account
Accept: application/json

*BODY* required firstName, lastName, user ( id ), profileImage (optional).
```

Response

```
Error with status code *422* for Invalid BODY
Error with status code *422* for User Don't have PRO version
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successful Created Account
New Account Detail
    {
        "_id": accountID(string),
        "firstName": firstName,
        "lastName": lastName,
        "companyName": "",
        "role": "",
        "location": "",
        "user": userID(string),
        "profileImage": "",
    }

```

# Update Account

Request

```
PATCH URL : /account/_id
Accept: application/json

*BODY* required firstName (optional), lastName (optional), user (id), profileImage (optional), comapanyName (optional), role (optional), location (optional).

*PARAMS* Account Id
```

Response

```
Error with status code *422* for Invalid BODY.
Error with status code *422* for Invalid Image.
Error with status code *422* for Invalid Account ( If params Not found ).
Error with status code *422* for Invalid Account ( If Account Not found ).
Error with status code *403* for Unauthorized request.
Error with status code *500* for Something happened wrong.

```

```
Success with status code *200* for Successful Updated Account
Updated Account Detail
{
     "_id": accountID(string),
        "firstName": firstName,
        "lastName": lastName,
        "companyName": "",
        "role": "",
        "location": "",
        "user": userID(string),
        "profileImage": "",
}
```

# Get Account

Request

```
GET URL : /account/_id

*PARAMS* Account Id
```

Response

```
Error with status code *422* for Invalid Account.

```

```

Success with status code *200* for Successfully account founded .
 - It gives account details with users details
  "_id": accountID(string),
        "firstName": firstName,
        "lastName": lastName,
        "companyName": "",
        "role": "",
        "location": "",
        "user": userID(string),
        "profileImage": "",

```

# Delete Account

Request

```
DELETE URL : /account/_id

*PARAMS* Account Id
```

Response

```
Error with status code *422* for Invalid Account.

```

```

Success with status code *200* for Successfully account Deleted .


```
