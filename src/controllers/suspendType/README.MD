# Create SuspendType (Admin Only)

Request

```
POST URL : /suspend_type
Accept: application/json

*BODY*
{
    "reason":(string)(required)
}
```

Response

```

Error with status code *422* for Invalid Data
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successful Created SuspendType

New SuspendType Detail
    {
        "_id": accountID(string),
        "reason": reason(string),
        "createdAt": " ",
        "updatedAt": " "
    }

```

# Update SuspendType

Request

```
PATCH URL : /suspend_type/:_id
Accept: application/json

*BODY*
{
    "reason":(string)(optional)
}

*PARAMS* Account Id
```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *422* for Invalid SuspendType (If Params Not Found)
Error with status code *500* for Something happened wrong.

```

```
Success with status code *200* for Successful Updated Suspend Type
Updated Suspend Type Detail
{
     "_id": accountID(string),
     "reason": reason(string),
     "createdAt": " ",
     "updatedAt": " "
}
```

# Get Suspend Type (Admin Only)

Request

```
GET URL : /suspend_type
Accept application/json
```

Response

```
Error with status code *500* for Somthing Happened wrong try again after sometime.
```

```
Success with status code *200* for Successfully suspendtype founded.
-It gives suspendtype details

 {
        "_id": accountID(string),
        "reason": reason(string),
        "createdAt": " ",
        "updatedAt": " "
 }
```
