'use strict'

let _ = require('lodash');
let couchbase = require('couchbase');

let myCluster;
let myBucket;

function get(id) {
	let aid = _.castArray(id);
	_.forEach(aid, id => {
		myBucket.get(id, function (err, res) {
			process.send({
				result: res,
				errors: err
			});
		});
	});
};


process.on('message', (m) => {

	if (m.command == 'init') {
		console.log('<#%s> Server: ', process.pid, m.server);
		myCluster = new couchbase.Cluster(m.server);
		myBucket = myCluster.openBucket('rdf');
		myBucket.operationTimeout = 100000;
		process.send({
			state: 'ready'
		});
		return;
	}

	if (m.command == 'get') {
		get(m.id);
	}
})