var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'ks',
    database : 'pgtest'
  }
});

var Bookshelf = require('bookshelf')(knex);
var User = Bookshelf.Model.extend({
  tableName: 'users',
  rides: function(){
    return this.hasMany(Ride, 'user_id');
  }
});
var Ride = Bookshelf.Model.extend({
  tableName: 'rides',
  user: function() {
    return this.belongsTo(User);
  },
  requests: function(){
    return this.hasMany(Request, 'ride_id');
  }
});
var Request = Bookshelf.Model.extend({
  tableName: 'requests',
  user: function() {
    return this.belongsTo(User);
  },
  ride: function(){
    return this.belongsTo(Ride);
  }
});
var Users = Bookshelf.Collection.extend({
  model: User
});
var Rides = Bookshelf.Collection.extend({
  model: Ride
});
var Requests = Bookshelf.Collection.extend({
  model: Request
});


var _ = require('lodash');
var express = require('express');
var server = express();
var bodyParser = require('body-parser');
var router = express.Router();

server.use(bodyParser.urlencoded());
server.use(bodyParser.json());


//USER ROUTES
router.route('/users')
  .get(function (req, res) {
    Users.forge()
    .fetch({ withRelated: ['rides'] })
    .then(function (users) {
      res.json({ error: false, data: users.toJSON() });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  })
  .post(function (req, res) {
    User.forge({
      name: req.body.name,
      email: req.body.email
    })
    .save()
    .then(function (user) {
      res.json({ error: false, data: { id: user.get('id') } });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  });

router.route('/users/:id')
  .get(function (req, res) {
    User.forge({ id: req.params.id })
    .fetch({ withRelated: ['rides'] })
    .then(function (user) {
      if (!user) {
        res.status(404).json({ error: true, data: {} });
      }
      else {
        res.json({ error: false, data: user.toJSON() });
      }
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  });


//RIDE ROUTES
router.route('/rides')
  .get(function (req, res) {
    Rides.forge()
    .fetch({ withRelated: ['requests'] })
    .then(function (rides) {
      res.json({ error: false, data: rides.toJSON() });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  })
  .post(function (req, res) {
    Ride.forge({
      destination: req.body.destination,
      spacesAvailable: req.body.spacesAvailable,
      user_id: req.body.user_id
    })
    .save()
    .then(function (ride) {
      res.json({ error: false, data: { id: ride.get('id') } });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  });

router.route('/rides/:id')
  .get(function (req, res) {
    Ride.forge({ id: req.params.id })
    .fetch({ withRelated: ['requests'] })
    .then(function (ride) {
      if(!ride) {
        res.status(404).json({ error: true, data: {} });
      }
      else {
        res.json({ error: false, data: ride.toJSON() });
      }
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  })


//REQUEST ROUTES
router.route('/rides/:id/requests')
  .get(function (req, res) {
    Ride.forge({ id: req.params.id })
    .fetch({ withRelated: ['requests'] })
    .then(function (ride) {
      var requests = ride.related('requests');
      res.json({ error: false, data: requests.toJSON() });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  })
  .put(function(req, res){
    //make knex query using the params id for the ride
    //make a get request after the fact and return
    //see if they're any different
    console.log('------------REQ PARAM ID:', req.params.id);

    knex('requests').where({
      ride_id: req.params.id
    }).update({
      cancelled: true
    })
    .then(function(requests) {
      Ride.forge({ id: req.params.id })
      .fetch({ withRelated: ['requests'] })
      .then(function (ride) {
        var requests = ride.related('requests');
        res.json({ error: false, data: requests.toJSON() });
      })
      .otherwise(function (err) {
        res.status(500).json({ error: true, data: { message: err.message } });
      });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  });

router.route('/requests')
  .post(function (req, res) {
    Request.forge({
      user_id: req.body.user_id,
      ride_id: req.body.ride_id,
      created_at: new Date()
    })
    .save()
    .then(function (request) {
      res.json({ error: false, data: { id: request.get('id') } });
    })
    .otherwise(function (err) {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
  });
server.use(router);

server.listen(3000, function() {
  console.log("✔ Express server listening on port %d in %s mode", 3000, server.get('env'));
});
