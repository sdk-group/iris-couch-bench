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
	myBucket.getMulti(
		['document_name_1', 'document_name_2'],
		function (err, res) {
			if (err) {
				console.log('one or more operations failed', err);
				return;
			}

			console.log('success!', res);
		});
	let a = [];
	for (let i = 0; i < v; i += 1) {
		a.push('ticket-department-1-2016-04-05--' + i);
	}
	console.log(a.length);

	for (let j = 0; j < mult; j += 1) {

		myBucket.getMulti(a, function (err, res) {
			counter++;
			console.log('#%s Errors: ', counter, err);
			if (counter == mult) {
				var diff = process.hrtime(time);
				console.log('benchmark took %d msec', (diff[0] * 1e9 + diff[1]) / 1000000);
				process.exit();
			}
		});

	}
});