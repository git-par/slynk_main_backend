# Status Code
```
Error with status code *422* for Invalid BODY.
Error with status code *401* for Incorrect Password.
Error with status code *401* for Incorrect Mail.
Error with status code *403* for Unauthorized request .

Error with status code *500* for Something happened wrong.
Success with status code *200* for Sucessfully operation Performed.
```

# User Login

Request

```
POST URL : /auth/login
Accept: application/json

*BODY* required email, password and pushToken(optional).
```


```
Success with status code *200* for Successful login

    - Token is set in Cookie as auth
    - User data
        "isPro" false/true,
        "_id": userID(string),
        "email": abc@gmail.com,
        "googleId": if login with login,
        "FCMToken": [],
        "accounts": [
            {
                "_id": accountID(string),
                "firstName": firstName,
                "lastName": lastName,
                "companyName": companyName,
                "role": role,
                "location": "",
                "user": userID(string),
                "profileImage": pic (URL),
                "__v": 0
            },
            {
                "_id": accountID(string),
                "firstName": firstName,
                "lastName": lastName,
                "companyName": companyName,
                "role": role,
                "location": "",
                "user": userID(string),
                "profileImage": pic (URL),
                "__v": 0
            },...
        ]


```



# Get Session

Request

```
POST URL : /auth/session ( only for admin )

```

Response
```
login User Details
```

# Logout

Request
```
POST URL : /auth/logout 

```
Response
```
remove cookie 
```

# New User Register 

Request

```
POST URL : /auth/register
Accept: application/json

*BODY* required 
{
    firstName : "firstName",
    lastName : "lastName",
    code : "code",
    email : "email",
    password : "password",
    pushToken : "pushToken ( optional )"
  
}
```

Response
```
Error with status code *422* for Invalid BODY ( if email already taken "Email is already in use with another user please try with login.")


Success with status code *200* for Successful login ( it create a user and one account )
    - Token is set in Cookie as auth
    - User data with account created
    - Create Beta User if ( user enter master code )
```

# User Login with Google

Request

```
POST URL : /auth/login_with_google
Accept: application/json

*BODY* required 
{
    *BODY* required 
    firstName : "firstName ( optional )",
    lastName : "lastName ( optional )",
    code : "code ( optional )",
    googleId : "googleId",
    email : "email",
    password : "password ( optional )",
    pushToken : "pushToken ( optional )"
  

}
```

Response
```

Success with status code *200* for Successful login ( it create a user and one account )
    - If user is already exist then this will return User Data other wise this    will create new User asd one default Account for user
    - Token is set in Cookie as auth
    - isRegistered : true ( If user is not signuped ) / false ( If user is already signed up)
    - Create Beta User if ( user enter master code )

```


# LoginWithAdmin

Request

```
api for admin can login into anybody's account
POST URL : /auth/login_with_admin/userId
Accept: application/json


```
Response
```

Success with status code *200* for Successful login (
    - user data
    - token for login into user's account

```
