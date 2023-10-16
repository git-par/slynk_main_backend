# Create Link Category

Request

```
POST URL : /linkscategory
Accept: application/json

*BODY* required title.
```

Response

```
Error with status code *422* for Invalid BODY.
Error with status code *422* for Link Already exist.
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successful Link Category Created
new Link Category Details :
    {
        "_id": ObjectID(string),
        "title": title,
        "links": []
    }

```

# Update Link Category (Admin Only)

Request

```
PATCH URL : /linkscategory/:_id
Accept: application/json

*BODY* required title.
```

Response

```
Error with status code *422* for Invalid BODY.
Error with status code *422* for Invalid Link Category ( If params Not found ).
Error with status code *422* for Invalid Link Category ( If Link Category Not found ).
Error with status code *500* for Something happened wrong.

```

```
Success with status code *200* for Successful Link Category Updated
Updated Link Category Details :
    {
        "_id": ObjectID(string),
        "title": title,
        "links": []
    }

```

# Get LinkCategory

Request

```
GET URL : /links_category
Accept application/json

```

Response

```
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successfully All Link Category Founded.
```

# Get LinkCategory By Id

Request

```
GET URL : /links_category/:_id
Accept application/json

*PARAMS* linkCategory Id
```

Response

```
Error with status code *422* for Invalid Link Category(If Id Not Found).
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successfully Link Category With Populate Data Founded.
```

# Get Not Populated

Request

```
GET URL : /links_category/not_populated
Accept application/json

*PARAMS* linkCategory Id
```

Response

```
Error with status code *422* for Invalid Link Category(If populatedLinksCategory not found).
Error with status code *500* for Something happened wrong try again after sometimes.

```

```
Success with status code *200* for Successfully link Category (If Id not Found)

Success with status code *200* for Successfully Link Category With Populate Data Founded.
```

# Delete Link Category

Request

```
DELETE URL : /linkscategory/_id
Accept: application/json

*PARAMS* Account Id
```

Response

```
Error with status code *422* for Invalid Account.

```

```

Success with status code *200* for Successfully Link Category Deleted .

```
