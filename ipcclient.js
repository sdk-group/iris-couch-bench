'use strict'

const ipc = require('node-ipc');

let _ = require('lodash');
let couchbase = require('couchbase');
let busy = require('busy');

let busyCheck = busy(function (amount) {
	console.log('Loop was busy for', amount, 'ms');
});

let myCluster;
let myBucket;
let batch_size = 50;

ipc.config.id = 'hello';
ipc.config.retry = 1000;
ipc.config.silent = true;

ipc.connectTo(
	'world',
	function () {
		ipc.of.world.on(
			'connect',
			function () {
				ipc.log('## connected to world ##', ipc.config.delay);
				ipc.of.world.emit(
					'app.ready', {
						id: process.pid
					}
				);
			}
		);

	}
);

ipc.of.world.on('disconnect', () => process.exit());

ipc.of.world.on(
	'app.settings',
	function (data) {
		console.log(data);
		myCluster = new couchbase.Cluster(data.server);
		myBucket = myCluster.openBucket('rdf');
		myBucket.operationTimeout = 100000;
		ipc.of.world.emit(
			'app.go', {
				id: process.pid
			}
		);
	}
);

ipc.of.world.on(
	'app.get',
	function (data) {
		// if (busyCheck.blocked) {
		// 	console.log("I'm busy right now, sorry.");
		// }
		get(data.id);
	}
);

function get(id) {
	let aid = _.castArray(id);
	// _.forEach(aid, id => {
	// 	myBucket.get(id, function (err, res) {
	// 		send(err, res);
	// 	});
	// });
	myBucket.getMulti(aid, (err, res) => {
		ipc.of.world.emit('app.response', _.values(res));
	})
};

let stored = 0;
let s = [];

function send(err, res) {
	stored++;
	s.push(res);
	if (stored == batch_size) {
		ipc.of.world.emit('app.response', s);
		s = [];
		stored = 0;
		return;
	}
}