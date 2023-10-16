# Status Code

```
200 : SuccessFully Operation Performed
422 : Invalid Data / Invalid Id for account link
403 : Unauthorized request when account link id not belong to account
415 : WHen user Try to Connect itSelf
500 : Backend Site Error
```


# Create AccountLink

Request

```
POST URL : /account/accountId/link
Accept: application/json

*BODY* 
data : {
    link: linkId ,
    profileShow: boolean (optional),
    links: when contact card then required array of link,
    cardShow: boolean (optional),
    value: user enter,
    label: only when extra label is true,
    account: login account ,
    logo: only when extraImage is true,
}

```

Response 

```
data : {
     "_id": "id",
    "link": {
        "_id": "id",
        "__v": 0,
        "category": [
            {
                "_id": "id",
                "title": "catergoy title"
            }
        ],
        "isPro": false,
        "logo": "logo URL",
        "maxLinks": {
            "forFreeUser": 1,
            "forPaidUser": 2
        },
        "prefix": "",
        "title": "Youtube",
        "key": "",
        "placeholder": "Enter Youtube Video/Profile URL",
        "type": "Youtube Embedded",
        "isDeactive": false,
        "suffix": "",
        "length": 15
    },
    "profileShow": false,
    "cardShow": false,
    "value": "dfsf",
    "account": "id",
    "logo": {
        "_id": "id",
        "description": "",
        "title": "Type HG RE",
        "url": "url",
        "__v": 0
    },
    "label": "ss",
    "links": [],
    "createdAt": "2022-03-28T10:02:16.121Z",
    "updatedAt": "2022-03-28T10:02:16.121Z"
}
```

# Update AccountLink

Request

```
POST URL : /account/accountId/link/accountLink_id
Accept: application/json


*BODY* 
data : {
    profileShow: boolean (optional),
    cardShow: boolean (optional),
    value: user enter,
    account: login account ,
    label: only when extra label is true,
    links: when contact card then required array of link,
    logo: only when extraImage is true,
}
```

Response

```
updated Link
```


# Get AccountLink

Request

```
GET URL : /account/accountId/link/accountLink_id/

```

Response 

```

Array of link which user added
        
```

# Get Particular AccountLink

Request

```
GET URL : /account/accountId/link/accountLink_id/link_id   

```

Response 

```

Particular link details
        
```

# Delete Particular AccountLink

Request

```
DELETE URL : /account/accountId/link/accountLink_id/link_id   

```

Response 

```

Delete Particular link 
        
```