// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/
/*********************************************
This basic accelerometer example logs a stream
of x, y, and z data from the accelerometer
*********************************************/
var http = require('http');
var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);


var previous;
var unlocked = false;


var rfidlib = require('rfid-pn532');

var rfid = rfidlib.use(tessel.port['B']);

rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');

  rfid.on('data', function (card) {
    console.log('UID:', card.uid.toString('hex'));
    var uid = card.uid.toString('hex');
    if (uid === '3e223600') {
      ///for 1 minute
      ////if charger moves, don't do anything!!
      unlocked = true;
      console.log('You unlocked your charger :) :)');
      setTimeout(function () {
        unlocked = false;
        console.log('LOCKED DOWN');
      }, 10000);
    }
  });
});

rfid.on('error', function (err) {
  console.error(err);
});

// Initialize the accelerometer.
accel.on('ready', function () {
  // Stream accelerometer data
  accel.getAcceleration(function (err, xyz) {
    if (err) console.log(err);
    console.log(xyz);
    previous = xyz;
  });

  function findDiff(prev, cur) {
    return Math.abs(prev - cur);
  }

  setInterval(function () {

    accel.getAcceleration(function (err, xyz) {
      if (err) console.log(err);
      console.log(xyz);
      // if (diff is big enough)
      // compare previous to xyz
      // do sth
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];

      if (!unlocked) {
        if (findDiff(x, previous[0]) > 0.1) {
          console.log('OH MY GOD SOMEONE STOLE MY CHARGER');

          var request = http.request({
            hostname: '192.168.3.100',
            port: 3001,
            path: '/charger',
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain'
            }
          }); ///request
          request.write('ALERT');
        } //if diff
        previous = xyz;
      } //if unlocked
    });//getAcceleration
  }, 1000); //setInterval
});

accel.on('error', function (err) {
  console.log('Error:', err);
});





module.exports = rfid;
