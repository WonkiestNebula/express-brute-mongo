MongoDB store adapter for the [express-brute](https://github.com/AdamPflug/express-brute).  
Updated from [express-brute-mongo](https://github.com/auth0/express-brute-mongo) for newer mongodb drivers.

## Installation

```
npm install express-brute-mongo-update
```

## Usage

```javascript
var ExpressBrute = require('express-brute'),
var MongoStore = require('express-brute-mongo-update');
var MongoClient = require('mongodb').MongoClient;

var store = new MongoStore(function (ready) {
  MongoClient.connect('mongodb://127.0.0.1:27017', function(err, client) {
    if (err) throw err;
    ready(client.db('test').collection('bruteforce-store'));
  });
});

var bruteforce = new ExpressBrute(store);

app.post('/auth',
  bruteforce.prevent, // error 403 if we hit this route too often
  function (req, res, next) {
    res.send('Success!');
  }
);
```

## Expire documents

Create an index with `expireAfterSeconds: 0` in mongo as follows:

```
db.my_api_limits_coll.ensureIndex({expires: 1}, {expireAfterSeconds: 0});
```

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
