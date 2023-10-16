# Status Code

```
200 : SuccessFully Operation Performed
422 : Invalid Data / Invalid Id for account link
403 : Unauthorized request when account link id not belong to account
415 : WHen user Try to Connect itSelf
500 : Backend Site Error
```

# Get Connect


Request

```
GET URL : /account/accountId/connect
Accept: application/json

```

Response 

```
Array Connect of login user

```

# Get Particular Connect


Request

```
GET URL : /account/accountId/connect/connectionID
Accept: application/json

```

Response 

```
Particular Connect of login user

```


# Delete Particular Connect

Request

```
DELETE URL : /account/accountId/connect/connectionID

```

Response 

```

Delete  Connect of login user
        
```


# New Request Label ( NEW )
Request
```

POST URL : /account/loginUserAcoountId/connect/newRequest/update_id

```
Response

```
full Details of connection
```