# Create Links (Admin Only)

Request

```
POST URL: /links/
Accept: application/json

*BODY* required
{
    "title": (string),(required),
    "logo": (string),(required),
    "isPro":  (boolean),(required),
    "isDeactive": (boolean),(optional),
    "prefix": (string),(optional),
    "androidPrefix": (string),(optional),
    "iosPrefix": (string),(optional),
    "suffix": (string),(optional)"",
    "placeholder": (string),(optional),
    "extraLabel": (boolean),(optional),
    "extraImage": (boolean),(optional),
    "extraPlaceholder": (string),(optional)
    "type": (string),(optional),
    "key": (string),(optional),
    "category": (array),(required),
    "maxLinks": { "forFreeUser": (number),(required),"forPaidUser": (number),(required) }(required),
}
```

Response

```
Error with status code *422* for Link with this title is already available.
Error with status code *500* for Something happened wrong try again after sometimes.
```

```
Success with status code *200* for Successful Created Links
New Link Detail
{
"id": id(string)
"title": title(string),
"logo": id(string),
"isPro": true|false,
"isDeactive": true|false,
"prefix": (string),
"androidPrefix": (string),
"iosPrefix": (string),
"suffix": (string),
"placeholder": (string),
"extraLabel": true|false,
"extraImage": true|false,
"extraPlaceholder": (string),
"type": (string),
"length": (number),
"key": (string),
"category": id(array),
"maxLinks": { "forFreeUser": (number),"forPaidUser": (number)}
}
```

# UpdateLinks (Admin Only)

Request

```
PATCH URL : /links/:_id
Accept: application/json

*BODY*
{
    "title": (string),(required),
    "logo": (string),(required),
    "isPro":  (boolean),(required),
    "isDeactive": (boolean),(optional),
    "prefix": (string),(optional),
    "androidPrefix": (string),(optional),
    "iosPrefix": (string),(optional),
    "suffix": (string),(optional)"",
    "placeholder": (string),(optional),
    "extraLabel": (boolean),(optional),
    "extraImage": (boolean),(optional),
    "extraPlaceholder": (string),(optional)
    "type": (string),(optional),
    "key": (string),(optional),
    "category": (array),(required),
    "maxLinks": { "forFreeUser": (number),(required),"forPaidUser": (number),(required) }(required),
}

*PARAMS* Link Id
```

Response

```
Error with status code *422* for Invalid Link( If params Not found ).
Error with status code *422* for Invalid Account ( If Link Not found ).
Error with status code *422* for Invalid BODY.
Error with status code *422* for Link with this title is already available.
Error with status code *500* for Something happened wrong.
```

```
Success with status code *200* for Successfully Updated Link
Updated Link Detail
{
"title": title(string),
"logo": id(string),
"isPro": true|false,
"isDeactive": true|false,
"prefix": (string),
"androidPrefix": (string),
"iosPrefix": (string),
"suffix": (string),
"placeholder": (string),
"extraLabel": true|false,
"extraImage": true|false,
"extraPlaceholder": (string),
"type": (string),
"length": (number),
"key": (string),
"category": id(array),
"maxLinks": { "forFreeUser": (number),"forPaidUser": (number)}
}
```

# Get Links

Request

```
GET URL : /link/
Accept application/json

```

Response

```
Error with status code *422* for Invalid Link.

```

```

Success with status code *200* for Successfully All link founded .
 - It gives links details with users details

```

# Get Links By Id

Request

```
GET URL : /link/:_id
Accept application/json

*PARAMS* Link Id
```

Response

```
Error with status code *422* for Invalid Link.

```

```
Success with status code *200* for Successfully Link founded .
 - It gives Link details with users details
{
   "_id": linkID(string),
       "title": title(string),
        "logo": id(string),
        "isPro": true|false,
        "isDeactive": true|false,
        "prefix": (string),
        "androidPrefix": (string),
        "iosPrefix": (string),
        "suffix": (string),
        "placeholder": (string),
        "extraLabel": true|false,
        "extraImage": true|false,
        "extraPlaceholder": (string),
        "type": (string),
        "length": (number),
        "key": (string),
        "category": id(array),
        "maxLinks": {"forFreeUser": (number),    "forPaidUser": (number)}
}
```

# Deactivate (Admin Only)

Request

```
POST URL : /links/:_id
Accept: application/json

*BODY*
{
    isDeactivate: (Boolean)
}

*PARAMS* Link ID
```

Response

```
Error with status code *422* for Invalid Link(If Params Not Found).

Error with status code *422* for Invalid Link Category(If Link Not Found)

Error with status code *422* for Invalid body

Error with status code *500* for message: "Hmm... Something went wrong. Please try again later.",

```

Response

```
Success with status code *200* for Sucessfully deactivated link


```

# Delete Link (Admin Only)

Request

```
DELETE URL : /links/:_id
Accept application/json

*PARAMS* Links Id
```

Response

```
Error with status code *422* for Invalid Link(If Id Not Found).
Error with status code *422* for Invalid Link(If link Not Found).
Error with status code *422* for Hmm... Something went wrong. Please try again later.

```

```

Success with status code *200* for Successfully account Deleted .


```

# Update Length (Admin Only)

Request

```
PATCH URL : /update_length
Accept: application/json

*BODY*
{
    "length": (number)(required)
}

*PARAMS* Link Id
```

Response

```
Error with status code *422* for Invalid BODY.
Error with status code *500* for Something happened wrong.
```

```
Success with status code *200* for Length Successfully Updated.

```
