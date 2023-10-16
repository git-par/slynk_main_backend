# Response Code 

```

200 : SuccessFully Operation Performed
422 : Invalid Data / Invalid Id for Account or Connection 
403 : Unauthorized request when Connection or Request not belong to that account
415 : WHen user Try to Connect itSelf
500 : Backend Site Error

```



# Create Incoming Connect / Connect

Request

```
for crete incoming connection or request
POST URL : /incoming_connection/profile_id/in_connect
Accept: application/json

*For Login User*
// Click on Connect Button
*BODY* required data = {
    targetAccount : { account : Login user account Id },
     firstName: profile_firstName,
     lastName : profile_lastName,
     email: companyName: profile_companyName,
     role : profile_role,
     image : profile_image
     }
it will added in connection
// For share details

*BODY* required data = {
    targetAccount : {
        account : Login user account Id,
        show : true ( share profile info) / false ( not share slynk profile )
        },
    userData = [ { //this field must be required if user not enter userData field then gives []
        label : "dgdf",
        value : "sdds"
    }]
     firstName: profile_firstName,
     lastName : profile_lastName,
     email: companyName: profile_companyName,
     role : profile_role,
     image : profile_image
     }
it will added in incoming connection

If connection or request was already maded then itwill return old data respectively.

// For without login


*BODY* required data = {
    targetAccount : filed not present
    userData = [ { //this field must be required if user not enter userData field then gives []
        label : "dgdf",
        value : "sdds"
    }]
     firstName: profile_firstName,
     lastName : profile_lastName,
     email: companyName: profile_companyName,
     role : profile_role,
     image : profile_image
     }


```

Response 

```
{
    "_id": "id",
    "account": "id",
    "targetAccount": {
        "account": "id",
        "show": false
    },
    "userData": [
        {
            "label": "Email",
            "value": "aswee",
            "_id": "id"
        },
        {
            "label": "Linkedin",
            "value": "asas",
            "_id": "id"
        }
    ],
    "image": "62318e9e793ba68c2135a650",
    "firstName": "firstName",
    "lastName": "lastName ",
    "phoneNumber": null,
    "email": null,
    "companyName": "companyName",
    "role": "Developer",
    "createdAt": "createdAt",
    "updatedAt": "2022-03-26T14:42:22.197Z",
    "newRequest": false
}
```




# Get All Connection

Request

```

GET URL : /incoming_connection/profile_account_id/in_connect
```

Response 

```

[
    {
        "_id": "id",
        "account": {
            "_id": "id",
            "firstName": "Test ",
            "lastName": "Test",
            "aboutMe": "",
            "profileImage": null
        },
        "targetAccount": {
            "account": "id",
            "show": false
        },
        "userData": [
            {
                "label": "Email",
                "value": "kmnkmn",
                "_id": "id"
            }
        ],
        "image": null,
        "firstName": "km",
        "lastName": "kkmk",
        "phoneNumber": "1122334455",
        "email": "aa@gmail.com",
        "companyName": "jn",
        "role": "njn",
        "createdAt": "2022-03-26T18:02:04.422Z",
        "updatedAt": "2022-03-26T18:02:13.852Z",
        "newRequest": false
    }
]

```

# Get Particular Connection

Request

```

GET URL : /incoming_connection/profile_account_id/in_connect/request id
```

Response 

```
    {
        "_id": "id",
        "account": {
            "_id": "id",
            "firstName": "Test ",
            "lastName": "Test",
            "aboutMe": "",
            "profileImage": null
        },
        "targetAccount": {
            "account": "id",
            "show": false
        },
        "userData": [
            {
                "label": "Email",
                "value": "kmnkmn",
                "_id": "id"
            }
        ],
        "image": null,
        "firstName": "km",
        "lastName": "kkmk",
        "phoneNumber": "1122334455",
        "email": "aa@gmail.com",
        "companyName": "jn",
        "role": "njn",
        "createdAt": "2022-03-26T18:02:04.422Z",
        "updatedAt": "2022-03-26T18:02:13.852Z",
        "newRequest": false
    }

```


# Update Connection /  Request

Request

```

POST URL : /incoming_connection/login_id/in_connect/update_id
Accept: application/json

*BODY*

{
    "_id": "id",
    "account": "id", // not necessary
    "targetAccount": { // not necessary
        "account": "id", // not necessary
        "show": false 
    },
    "userData": [
        {
            "label": "Email",
            "value": "aswee",
        },
        {
            "label": "Linkedin",
            "value": "asas",
        }
    ],
    "image": "62318e9e793ba68c2135a650",
    "firstName": "firstName",
    "lastName": "lastName ",
    "phoneNumber": null,
    "email": null,
    "companyName": "companyName",
    "role": "Developer",
}


```


Response 

```
Updated Incoming Request
{
    "_id": "id",
    "account": "id",
    "targetAccount": {
        "account": "id",
        "show": false
    },
    "userData": [
        {
            "label": "Email",
            "value": "aswee",
            "_id": "id"
        },
        {
            "label": "Linkedin",
            "value": "asas",
            "_id": "id"
        }
    ],
    "image": "62318e9e793ba68c2135a650",
    "firstName": "firstName",
    "lastName": "lastName ",
    "phoneNumber": null,
    "email": null,
    "companyName": "companyName",
    "role": "Developer",
    "createdAt": "date",
    "updatedAt": "date",
    "newRequest": false
}

```

# Approve Request
Request

```

POST URL : /incoming_connection/login_id/approve/update_id
*BODY*
    {
        approved : "APPROVED" /  "REJECTED" 
    }
```

Response 

```
request moved to connection with same id
{
    "_id": "update_id", 
    "account": "id",
    "targetAccount": {
        "account": "id",
        "show": false
    },
    "userData": [
        {
            "label": "Email",
            "value": "aswee",
            "_id": "id"
        },
        {
            "label": "Linkedin",
            "value": "asas",
            "_id": "id"
        }
    ],
    "image": "62318e9e793ba68c2135a650",
    "firstName": "firstName",
    "lastName": "lastName ",
    "phoneNumber": null,
    "email": null,
    "companyName": "companyName",
    "role": "Developer",
    "createdAt": "createdAt",
    "updatedAt": "2022-03-26T14:42:22.197Z",
    "newRequest": false
}

```

# New Request Label ( NEW )
Request
```

POST URL : /incoming_connection/login_id/newRequest/update_id

```
Response

```
{
    "_id": "update_id", 
    "account": "id",
    "targetAccount": {
        "account": "id",
        "show": false
    },
    "userData": [
        {
            "label": "Email",
            "value": "aswee",
            "_id": "id"
        },
        {
            "label": "Linkedin",
            "value": "asas",
            "_id": "id"
        }
    ],
    "image": "62318e9e793ba68c2135a650",
    "firstName": "firstName",
    "lastName": "lastName ",
    "phoneNumber": null,
    "email": null,
    "companyName": "companyName",
    "role": "Developer",
    "createdAt": "createdAt",
    "updatedAt": "2022-03-26T14:42:22.197Z",
    "newRequest": false
}

```


# Get Connection / Request 

```

POST URL : /incoming_connection/login_id/targetAccount/profile_id

```

Response 

```
If Connection or Request availble then It will return data  basis of login_account_id and profile_id
else null
```