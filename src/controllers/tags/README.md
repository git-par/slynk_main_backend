# Create Tags (Admin Only)

Request

```
POST URL: /links/
Accept: application/json

*BODY* required
{
    "size": (string),(optional),
    "color": (string),(required),
    "batchNo": (string),(required),
    "type": (string),(required),
    "random": (string),(required),
}
```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *500* for Something happened wrong try again after sometimes.
```

```
Success with status code *200* for Successful Created Tags
New Tags Detail

{
    "id": id(string)
    "size": (string),
    "color": (string),
    "batchNo": (string),
    "type": (string),
    "random": (string),
    "block":(boolean),
    "urlname":(string),
    "account":(id),
    "label":(string),
    "tag image":(id)
}
```

# Get Tags

Request

```
GET URL : /tags/:urlName
Accept application/json

*PARAMS* urlName
```

Response

```
Error with status code *403* for Invalid Data(If User Not Found).

```

```

Success with status code *200* for Successfully tags founded .
 - It gives tags details
{
    "block":(boolean),
   "_id": tagsID(string),
    "size": (string),
    "color": (string),
    "batchNo": (string),
    "type": (string),
    "random": (string),
    "urlname":(string),
    "account":(id),
    "label":(string),
    "tag image":(id),
    "shouldUpdateRoute":(boolean)
}
```

# Link Account

Request

```
POST URL : /tags/:urlName
Accept application/json

*BODY*
{
    "account":(Id)(required),
    "label":(string)(required),
}

*PARAMS* tags Id
```

Response

```
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully account founded .
 - This tag will assign to users
```

# Update Tag Label

Request

```
PATCH URL : /tags/:_id
Accept application/json

*BODY*
{
    "account":(Id)(required),
    "label":(string)(required),
}

*PARAMS* tags Id
```

Response

```
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully account founded .
 - This tag will updated to users
```

# Block Tag

Request

```
PATCH URL : /tags/block/:urlName
Accept application/json

*BODY*
{
    "block":(boolean)(required)
}

*PARAMS* tags urlName
```

Response

```
Error with status code *422* for Invalid Body
Error with status code *422* for Invalid Id(If not Found Params).
Error with status code *422* for Invalid Id(If not Found Tag By Url).
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully tags Bloked .
 - This tag will blocked for all users
```

# Free Tag

Request

```
POST URL : /tags/free/:urlName
Accept application/json

*PARAMS* tags urlName
```

Response

```
Error with status code *422* for Invalid Id(If not Found Tag By Url).
Error with status code *403* for Unauthorized request.
Error with status code *500* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully tags free for all user.
 - This tag will free for all users.
```
