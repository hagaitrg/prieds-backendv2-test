var mongoose = require('mongoose');
require('dotenv').config();

var url = process.env.DB_URL;

var DB_ref = mongoose
  .createConnection( url )

  .on('error', function (err) {
    if (err) {
      console.error('Error connecting to MongoDB.', err.message);
      process.exit(1);
    }
  })
  .once('open', function callback() {
    console.info('Mongo db connected successfully ' + url);
  });

module.exports = DB_ref;
