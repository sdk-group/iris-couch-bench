'use strict'


let couchbase = require('couchbase');




process.on('message', (m) => {
	console.log('<#%s> Server: ', process.pid, m.server);
	let myCluster = new couchbase.Cluster(m.server);
	let myBucket = myCluster.openBucket('rdf');
	myBucket.operationTimeout = 100000;

	let v = m.tickets;
	let mult = m.mult;
	let time = process.hrtime();

	let counter = 0;
	let errors_count = 0;

	for (let j = 0; j < mult; j += 1) {
		for (let i = 0; i < v; i += 1) {
			myBucket.get('ticket-department-1-2016-04-05--' + i, function (err, res) {
				// console.log('Value: ', res);
				if (err) {
					errors_count += 1;
				}
				counter++;
				if (counter == v * mult) {
					var diff = process.hrtime(time);
					// console.log('reading errors:', errors_count);
					// console.log('%d benchmark took %d msec', counter, (diff[0] * 1e9 + diff[1]) / 1000000);
					process.send({
						diff: (diff[0] * 1e9 + diff[1]) / 1000000,
						count: counter,
						errors: errors_count
					});
					process.exit();
				}
			});
		}
	}
})