# Password Verification

Request

```
POST URL : /user/password_verification
Accept: application/json

*BODY*
data : {
    password : "password" (string)
}

```

Response

```
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

Success with status code _200_ for Successfully Password Verified
message: "Password Verified"

```

# Email Change

Request

```

POST URL : /user/password_vemail_verificationerification
Accept: application/json

_BODY_ data : {
password : "passwod"
}

```

Response

```

message: "Password Verified"

```

# Update User Email

Request

```

POST URL : /user/update_email
Accept: application/json

It takes a **TOKEN** as **authorization** in header for validate the user is authorized or not...

_BODY_ required newMail and password.
Password is for checking user it's self or not .

```

Success with status code _200_ for Email Updated Successfully .

```

# Update User Password

Request

```

POST URL : /user/update_password
Accept: application/json

It takes a **TOKEN** as **authorization** in header for validate the user is authorized or not...

*BODY*
{
    "currentPassword": (string)(required),
    "newPassword": (string)(required)
}
currentPassword is for checking user it's self or not .

```

Response

```
Error with status code *422* Invalid Body
Error with status code *401* Incorrect Password.
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* for Password Updated Successfully.
message: "Password updated"

```

# Email Verification

Request

```

POST URL : /user/email_verification
Accept: application/json

It takes a **TOKEN** as **authorization** in header for validate the user is authorized or not...

*BODY*
{
    "newEmail": (string)(required),
}
```

Response

```
Error with status code *422* Invalid Body
Error with status code *409* If Email already in Used.
Error with status code *224* Something went Wrong.
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* If loginUser Email is same as user entered newEmail.
message: "Data Successfully Updated"

Success with status code *200* Email Verified.
message: "Verification code has been sent."

```

# Update Email

Request

```

POST URL : /user/email_update
Accept: application/json

It takes a **TOKEN** as **authorization** in header for validate the user is authorized or not...

*BODY*
{
    "newEmail": (string)(required),
    "updateEmailOTP": (number)(required)
}
```

Response

```
Error with status code *422* Invalid Body
Error with status code *422* Invalid Code.
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* If loginUser Email is same as user entered newEmail.
message: "Data Successfully Updated"

Success with status code *200* Email Updated.
message: "Email Updated."

```

# Phone Verification

Request

```

POST URL : /user/phone_verification
Accept: application/json


*BODY*
{
    "newPhone": (string)(required),
}
```

Response

```
Error with status code *422* Invalid Body
Error with status code *409* for Number Already Use.
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* Phone Verified.
message: "success."

```

# Update Phone

Request

```

POST URL : /user/phone_update
Accept: application/json


*BODY*
{
    "newPhone": (string)(required),
}
```

Response

```
Error with status code *422* Invalid Body
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* Phone Updated.
message: "Phone Number Updated."

```

# Get User

Request

```

GET URL : /user/
Accept: application/json

It takes a **TOKEN** as **authorization** in header for validate the user is authorized or not...

```

Response

```
Error with status code *500* Hmm... Something went wrong. Please try again later.
```

```
Success with status code *200* User Founded.

Get Populated User

```

# Get AllUser (Admin Only)

Request

```

GET URL : /user/all
Accept: application/json


```

Response

```
Success with status code *200* AllUser Founded.

Get All User

```

# Forget Password

Request

```
POST URL : /user/forget_password
Accept: application/json

*BODY*
data : {
    email : (string)(required)
}

```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *422* for Invalid Data(User Data Not Founded).
Error with status code *224* for Invalid Data(Something Went Wrong).
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```
Success with status code *200* for Successfully Password Changed.
message: "Email successfully sended."

```

# Reset Password

Request

```

POST URL : /user/reset_password
Accept: application/json

*BODY*
data : {
token : (string)(required),
password : (string)(required)
}

```

Response

```
Error with status code *500* for Something happened wrong try again after somthing.
```

```
Error with status code *200* Successfully Password Changed.
message:"Password Successfully changed"
```

# Delete Request

Request

```

PATCH URL : /user/
Accept: application/json
```

```
Success with status code *200* for To Delete Account
message:"We will delete your account soon."

```

# Delete User (Admin Only)

Request

```

DELETE URL : /user/:_id
Accept: application/json

*PARAMS* user Id
```

Response

```
Error with status code *422* Invalid Data(If User Id Not Found).
```

```
Success with status code *200* Successfully User Deleted.
message: "User Deleted."
```

# Deactivate User (Admin Only)

Request

```

PATCH URL : /user/deactivate/:_id
Accept: application/json

*BODY*
{
    "hour":(number)(required)
}

*PARAMS* user Id
```

Response

```
Error with status code *422* Invalid Data(If User Id Not Found).
Error with status code *422* Invalid Date(If date Not Found).
```

```
Success with status code *200* Successfully User Deactivated.
message: "User deactivated."
```

# Suspend User (Admin Only)

Request

```
POST URL : /SuspendUser/:userId
Accept application/json

*BODY*
{
    "suspendTill":(Date)(required),
    "suspendMessage":(string)(required),
    "suspendType":(id)(required)
}

*PARAMS* user Id
```

Response

```
Error with status code *422* for User Not Found(If Id Not Found).
Error with status code *422* for User Not Found(If User Not Found).
Error with status code *422* for Invalid Data.
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully user Suspended.
{
    "suspendTill": (date),
    "suspendMessage": (string),
    "suspendType": (string)
}
```

# UnSuspend User (Admin Only)

Request

```
POST URL : /unSuspendUser/:userId
Accept application/json

*PARAMS* user Id
```

Response

```
Error with status code *422* for User Not Found(If Id Not Found).
Error with status code *422* for User Not Found(If User Not Found).
Error with status code *422* for Invalid Data.
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully user Unsuspended.

```
