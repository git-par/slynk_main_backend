# Create TagsType (Admin Only)

Request

```
POST URL : /tags_type
Accept: application/json

*BODY*
{
        "size": size(string)(optional),
        "color": color(string)(optional),
        "batchNo": batchNo(string)(required),
        "type": type(string)(required),
        "tagImage": id(Object Id)(required),
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
         "size": size(string),
         "color": color(string),
         "batchNo": batchNo(string),
         "type": type(string),
         "tagImage": id(Object Id)
    }

```

# Update TagsType (Admin Only)

Request

```
PATCH URL : /tags_type/:id
Accept: application/json

*BODY*
{
    "size": size(string)(optional),
    "color": color(string)(optional),
    "batchNo": batchNo(string)(required),
    "type": type(string)(optional),
    "tagImage": id(Object Id)(optional),
}

*PARAMS* TagsType Id
```

Response

```
Error with status code *422* for Invalid Data.
Error with status code *422* for Invalid TagsType (If Params Not Found)
Error with status code *500* for Something happened wrong.

```

```
Success with status code *200* for Successful Updated Tags Type
Updated Tags Type Detail
{
    "size": size(string),
    "color": color(string),
    "batchNo": batchNo(string),
    "type": type(string),
    "tagImage": id(Object Id)
}
```
