'use strict'

let couchbase = require('couchbase');

let myCluster = new couchbase.Cluster('couchbase://194.226.171.146');
let myBucket = myCluster.openBucket('rdf');
myBucket.operationTimeout = 10000;

myBucket.get('counter-ticket-department-1-2016-04-05', function (err, res) {
	console.log('Value: ', res.value);
	let v = res.value;
	let time = process.hrtime();
	let counter = 0;
	let mult = 10;
	let q = 0;
	for (let j = 0; j < mult; j += 1) {
		for (let i = 0; i < v; i += 1) {
			myBucket.get('ticket-department-1-2016-04-05--' + i, function (err, res) {
				// console.log('Value: ', res);
				if (err) {
					q += 1;
				}
				counter++;
				if (counter == (v - 1) * mult) {
					var diff = process.hrtime(time);
					console.log(q);
					console.log('%d benchmark took %d msec', counter, (diff[0] * 1e9 + diff[1]) / 1000000);
					process.exit();
				}
			});
		}
	}
});