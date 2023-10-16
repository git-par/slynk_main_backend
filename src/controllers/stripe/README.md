# Status Code

```
200 : SuccessFully Operation Performed
422 : Session not found of stripe session
403 : Unauthorized request 
500 : Backend Site Error
```

# Update User to pro

```
POST URL : /account
Accept: application/json
token

*BODY* required 
{
    CHECKOUT_SESSION_ID: "CHECKOUT_SESSION_ID"
}
```

Response 

```

{
    message : "Success" ( when user updated )
}
```
