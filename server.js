// modules =================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it
var methodOverride = require('method-override');
var mongojs = require("mongojs");
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var multiparty = require('multiparty');
var get_ip = require('ipware')().get_ip;
var device = require('express-device');
var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs = require('fs-extra');

// configuration ===========================================

// database config
var databaseUrl = 'mongodb://127.0.0.1:27017/a4';

var port = process.env.PORT || 3000; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)


app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({
    extended: true
})); // parse application/x-www-form-urlencoded

app.use(device.capture());
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static('./public/img'));

app.use(expressSession({
    secret: 'a4secretKeyHere',
    resave: true,
    saveUninitialized: true
}));
// database functions ======================================

// Return number of users in db
var db_get_user_count = function(callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find().count(function(err, count) {
                db.close();
                callback(count);
            });
        }
    });
}

//Get all users in db
var db_get_all_users = function(callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find().toArray(function(err, docs) {
                db.close();
                callback(docs);
            });
        }
    });
}

// Get user data, queried by email
var db_get = function(email, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find({
                "email": email
            }).toArray(function(err, docs) {
                db.close();
                callback(docs);
            });
        }
    });
}

// Remove user by email
var db_remove = function(email, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").remove({
                "email": email
            }, function(err, docs) {
                db.close();
                callback(true);
            });
        }
    });
}

// Get user type by email, (admin, superadmin, normal)
var db_get_type = function(email, callback) {
    db_get(email, function(response) {
        if (response) {
            //console.log(response);
            //console.log(response[0].type);

            callback(response[0].type);
        } else {

            callback("normal");
        }
    });
}

// Get all users other than requesting session user
var db_get_all = function(email, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find({
                "email": {
                    $ne: email
                }
            }).toArray(function(err, docs) {
                db.close();
                callback(docs);
            });
        }
    });
}

// Save new user to database
var db_save = function(data, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").save(data, function(err, saved) {

                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    callback(true);
                }
            });
        }
    });
}

// Check if user is already in database
var db_in = function(data, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find({
                "email": data.email,
                "password": data.password
            }).count(function(err, saved) {

                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    if (saved >= 1)
                        callback(true);
                    else
                        callback(false);
                }
            });
        }
    });
}

var db_update_location = function(email, lat, long, callback) {
    data = {
        "latitude" : lat,
        "longitude": long
    };
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").updateOne({
                "email": email
            },
        {
            '$addToSet': {
                'locations': data
            }
        });
        }
    });
}

// Check is user is already in db, by email
var db_email_in = function(data, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").find({
                "email": data.email
            }).count(function(err, saved) {

                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    if (saved >= 1)
                        callback(true);
                    else
                        callback(false);
                }
            });
        }
    });
}

// Log IP information
var db_add_to_connection = function(address, family, port, email) {

    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            return false;
        } else {
            db.collection("users").update({
                "email": email
            }, {
                '$addToSet': {
                    'connection': [address, family, port]
                }
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    return false;
                } else {
                    db.close();
                    if (saved == 1)
                        return true;
                    else
                        return false;
                }
            });
        }
    });
}

// Log device information
var db_add_to_device = function(item, email) {

    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            return false;
        } else {
            db.collection("users").update({
                "email": email
            }, {
                '$addToSet': {
                    'devices': item
                }
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    return false;
                } else {
                    db.close();
                    if (saved == 1)
                        return true;
                    else
                        return false;
                }
            });
        }
    });
}

// Log platform information
var db_add_to_platform = function(item, email) {

    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            return false;
        } else {
            db.collection("users").update({
                "email": email
            }, {
                '$addToSet': {
                    'platforms': item
                }
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    return false;
                } else {
                    db.close();
                    if (saved == 1)
                        return true;
                    else
                        return false;
                }
            });
        }
    });
}

// Update user data via email
var db_update = function(data, email, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").updateOne({
                "email": email
            }, {
                $set: {
                    "email": data.email,
                    "first": data.first,
                    "last": data.last,
                    "description": data.description
                }
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    callback(true);
                }
            });
        }
    });
}

// Add url/endpoint logged by user
var db_update_url = function(email, url, callback) {
    key = "urls." + url;
    url = {};
    url[key] = 1;

    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").updateOne({
                "email": email
            }, {
                $inc: url
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    callback(true);
                }
            });
        }
    });
}

// Change user type to admin
var db_promote = function(email, callback) {
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            db.collection("users").updateOne({
                "email": email
            }, {
                $set: {
                    "type": "administrator"
                }
            }, function(err, saved) {
                if (err || !saved) {
                    db.close();
                    callback(false);
                } else {
                    db.close();
                    if (saved == 1)
                        callback(true);
                    else
                        callback(false);
                }
            });
        }
    });
}

// Reduce user type to normal
var db_demote = function(email, callback) {
        MongoClient.connect(databaseUrl, function(err, db) {
            if (err) {
                callback(false);
            } else {
                db.collection("users").updateOne({
                    "email": email
                }, {
                    $set: {
                        "type": "normal"
                    }
                }, function(err, saved) {
                    if (err || !saved) {
                        db.close();
                        callback(false);
                    } else {
                        db.close();
                        callback(true);
                    }
                });
            }
        });
    }
    // routes ==================================================

// In charge of logging all url/endpoints requested by user
// This interceptor allows tracking of most visited pages/endpoints
var middleware = function(req, res, next) {
    db_get(req.session.email, function(response){
        if (response.length < 1){
            req.session.loggedIn = false;
            req.session.email = null;
            req.session.type = "normal";

            req.session.destroy();
            res.redirect('/');
            // send redirect
        }
        else {
            db_get_type(req.session.email, function(response) {
                    req.session.type = response;

                    // Proceed
                    logUrl(req, res, next);
            });
        }
    });
}

var logUrl = function (req, res, next){
    db_update_url(req.session.email, req.url, function(response) {
        // use respone to log whether or not url went through
    });
    next();
}



// Delete a user, requires privledge
app.post('/DeleteUser', middleware, function(req, res) {
    var data = req.body;
    var email = data.email;
    // Only allow admins and superadmins to remove users
    if (req.session.type == "administrator" || req.session.type == "superadministrator") {
        db_remove(email, function(status) {
            if (status) {
                res.status(200).send({
                    data: "success"
                });
            } else {
                res.status(403).send({
                    data: "failure"
                });
            }
        });
    } else {
        res.status(403).send({
            data: "failure"
        });
    }
});

// Promote a user, requires privledge
app.post('/PromoteUser', middleware, function(req, res) {
    var data = req.body;
    var email = data.email;
    // Only allow admins and superadmins to remove users
    if (req.session.type == "superadministrator") {
        db_promote(email, function(status) {

            res.status(200).send({
                data: "success"
            });

        });
    } else {
        res.status(403).send({
            data: "failure"
        });
    }
});

app.post('/logLocation', middleware, function(req, res) {
    var data = req.body;

    console.log(req.session.email);
    console.log(data.lat);
    console.log(data.long);

    db_update_location(req.session.email, data.lat, data.long);
});

// Demote a user, requires privledge
app.post('/DemoteUser', middleware, function(req, res) {
    var data = req.body;
    var email = data.email;
    // Only allow admins and superadmins to remove users
    if (req.session.type == "superadministrator") {
        db_demote(email, function(status) {
            if (status) {
                res.status(200).send({
                    data: "success"
                });
            } else {
                res.status(403).send({
                    data: "failure"
                });
            }
        });
    } else {
        res.status(403).send({
            data: "failure"
        });
    }
});

app.post('/register', logUrl, function(req, res) {
    var data = req.body;
    db_get_user_count(function(r) { // Check if first user, can set superadmin
        db_email_in(data, function(status_exists) { // Check already in db
            if (!status_exists) {
                if (r == 0) {
                    data["type"] = "superadministrator";
                    data["platforms"] = [];
                    data["devices"] = [];
                    data["connection"] = [];
                    data["urls"] = {};
                    db_save(data, function(status) {
                        if (status) {
                            res.status(200).send({
                                data: "success"
                            });
                        } else {
                            res.status(403).send({
                                data: "failure"
                            });
                        }
                    });
                } else {
                    data["type"] = "normal";
                    db_save(data, function(status) {
                        if (status) {
                            res.status(200).send({
                                data: "success"
                            });
                        } else {
                            res.status(403).send({
                                data: "failure"
                            });
                        }
                    });
                }
            } else {
                res.status(403).send({
                    data: "failure"
                });
            }
        });
    });
});

app.post('/updateProfileData', middleware, function(req, res) {
    var data = req.body;
    var email = data.email;
    db_update(data, req.session.email, function(status) {
        console.log(status);
        if (status) {
            req.session.email = email;
            res.status(200).send({
                data: "success"
            });
        } else {
            res.status(403).send({
                data: "failure"
            });
        }
    });
});


app.post('/updateOtherProfileData', middleware, function(req, res) {
    var data = req.body;
    var email = data.email;
    // Need to be admin/super in order to alter others information
    if (req.session.type == "administrator" || req.session.type == "superadministrator"){
        db_update(data, email, function(status) {
            console.log(status);
            if (status) {
                res.status(200).send({
                    data: "success"
                });
            } else {
                res.status(403).send({
                    data: "failure"
                });
            }
        });
    }
});

app.post('/login', logUrl, function(req, res) {
    remoteAddress = req.connection.remoteAddress;
    socketInfo = req.connection._peername;
    address = socketInfo.address;
    family = socketInfo.family;
    port = socketInfo.port;

    var data = req.body;
    var email = data.email;

    db_in(data, function(status) {
        if (status) {
            // Log device/platform/IP information about user
            db_add_to_device(req.device.type, email);
            db_add_to_platform(req.headers['user-agent'], email);
            db_add_to_connection(address, family, port, email);

            req.session.loggedIn = true;
            req.session.email = email;
            db_get_type(req.session.email, function(response) {
                if (response == "administrator") {
                    req.session.type = "administrator";
                } else if (response == "superadministrator") {
                    req.session.type = "superadministrator";
                } else {
                    req.session.type = "normal";
                }
                res.status(200).send({
                    data: "success"
                });
            });
        } else {
            res.status(403).send({
                data: "failure"
            });
        }
    });
});


app.post('/changeProfilePic', middleware, function(req, res) {
    var form = new formidable.IncomingForm();
    // Accept file upload to a temp location
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received upload:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });

    // After file transfer finished, transfer file to desired location
    form.on('end', function(fields, files) {
        if (this.openedFiles) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = './public/img/';
            fs.copy(temp_path, new_location + req.session.email + ".jpg", function(err) {
                if (err) {
                    //console.error(err);
                } else {
                    //console.log("success!")
                }
            });
        }
    });
});

app.get('/GetAggregatedData', middleware, function(req, res) {
    db_get_all_users(function(data) {
        if (data) {
            var locations = [];
            var urls = {};

            // Getting all locaiton and url information
            for (var i = 0; i < data.length; i++){
                person = data[i];
                if ("locations" in person)
                    locations.push(person.locations[0]);

                for (var key in person.urls){
                    if (key in urls)
                        urls[key] += person.urls[key];
                    else
                        urls[key] = person.urls[key];
                }
            }
            data = {
                "urls" : urls,
                "locations" : locations
            };
            res.status(200).send(data);
        } else {
            res.status(403).send({
                data: "failure"
            });
        }
    });
});

app.get('/ProfileData', middleware, function(req, res) {
    db_get(req.session.email, function(data) {
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(403).send({
                data: "failure"
            });
        }
    });
});

// Get the list of users in db
app.get('/UserList', middleware, function(req, res) {
    db_get_all(req.session.email, function(data) {
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(403).send({
                data: "failure"
            });
        }
    });
});

app.get('/logout', middleware, function(req, res) {
    // Reset the session email, logged in status, and type
    req.session.loggedIn = false;
    req.session.email = null;
    req.session.type = "normal";

    req.session.destroy();
    res.redirect('/');
});

app.get('/cover.jpg', logUrl, function(req, res) {
    res.sendfile('./public/img/cover.jpg');
});

// Facilitates serving images/profile images to server
app.get('/img/*', logUrl, function(req, res) {
    parsed = req.url.split("/");
    if (parsed.length == 3) {
        parsed_email = parsed[2];
        if (parsed_email.indexOf("@") > -1) {
            if (fs.existsSync('./public/img/' + parsed_email + ".jpg")) {
                res.sendfile('./public/img/' + parsed_email + ".jpg");
            } else {
                res.sendfile('./public/default.jpg');
            }

        } else {
            if (req.session.loggedIn) {
                if (fs.existsSync('./public/img/' + req.session.email + ".jpg")) {
                    res.sendfile('./public/img/' + req.session.email + ".jpg");
                } else {
                    res.sendfile('./public/default.jpg');
                }
            } else
                res.sendfile('./public/default.jpg');
        }
    } else {
        if (req.session.loggedIn) {
            // Code to find there actual display picture
            res.sendfile('./public/img/' + req.session.email + ".jpg");
        } else
            res.sendfile('./public/default.jpg');
    }
});

app.get('/private/css/style.css', logUrl, function(req, res) {
    if (req.session.loggedIn)
        res.sendfile('./private/css/style.css');
});

app.get('/css/style.css', logUrl, function(req, res) {
    res.sendfile('./public/css/style.css');
});

app.get('/js/*', logUrl, function(req, res) {
    res.sendfile('./public' + req.url);
});

app.get('/private/js/*', logUrl, function(req, res) {
    res.sendfile('.' + req.url);
});

app.get('/views/*', logUrl, function(req, res) {
    res.sendfile('./public' + req.url);
});

app.get('/ng-file-upload.min.js', logUrl, function(req, res) {
    res.sendfile('./public/libs/ng-file-upload.min.js');
});

app.get('/ng-file-upload-shim.min.js', logUrl, function(req, res) {
    res.sendfile('./public/libs/ng-file-upload-shim.min.js');
});

// Serves main index.html file, based on user type (admin/super/normal)
app.get('/', logUrl, function(req, res) {
    if (req.session.loggedIn) {
        if (req.session.type == "administrator")
            res.sendfile('./private/index_admin.html');
        else if (req.session.type == "superadministrator")
            res.sendfile('./private/index_superadmin.html');
        else
            res.sendfile('./private/index.html');
    } else {
        res.sendfile('./public/index.html');
    }
});

// start app ===============================================
app.listen(port);
console.log('Server started on port: ' + port); // shoutout to the user
