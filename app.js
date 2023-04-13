var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var users = require('./routes/users');

var app = express();
app.use(express.json());

app.use('/api/v1/users', users);

app.listen(process.env.PORT || 8000, function () {
    console.log(
        "Express server listening on port %d in %s mode",
        this.address().port,
        app.settings.env
    );
});

// module.exports = app;
