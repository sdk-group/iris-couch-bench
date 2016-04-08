'use strict'

let Promise = require('bluebird');
let couchbase = require('couchbase');


process.on('message', (m) => {
	console.log('<#%s> Server: ', process.pid, m.server);
	let myCluster = new couchbase.Cluster(m.server);
	let myBucket = myCluster.openBucket('rdf');
	myBucket.operationTimeout = 100000;

	let get = (id) => {
		return new Promise((res, rej) => {
			myBucket.get(id, (err, v) => {
				if (err) rej(new Error(err));
				res(v);
			});
		})
	};

	let v = m.tickets;
	let mult = m.mult;
	let time = process.hrtime();

	let counter = 0;
	let errors_count = 0;
	let getter = Promise.coroutine(function* () {
		for (let j = 0; j < mult; j += 1) {
			for (let i = 0; i < v; i += 1) {
				// console.log('start', 'ticket-department-1-2016-04-05--' + i);
				yield get('ticket-department-1-2016-04-05--' + i).then((r) => {
					// console.log(r.value.label);
				}).catch((err) => {
					errors_count += 1;

				}).finally(() => {
					counter++;

					if (counter == v * mult) {
						var diff = process.hrtime(time);
						process.send({
							diff: (diff[0] * 1e9 + diff[1]) / 1000000,
							count: counter,
							errors: errors_count
						});
						process.exit();
					}
				});
				// console.log('stop', 'ticket-department-1-2016-04-05--' + i);
			}
		}

	});
	getter();
})