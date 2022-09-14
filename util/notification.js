const FCM = require('fcm-node');
var server_key = require('../notification-fdc24-firebase-adminsdk-bdi1h-870fa63445.json');
exports.fcm = new FCM(server_key);

