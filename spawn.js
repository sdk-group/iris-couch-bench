'use strict'

let child_process = require('child_process');


let processes = [];
let count = 40;

// let servers = ['couchbase://192.168.1.36', 'couchbase://192.168.1.37', 'couchbase://192.168.1.42'];
// let servers = ['couchbase://192.168.1.36', 'couchbase://192.168.1.37'];
let servers = ['couchbase://194.226.171.146'];
let response_count = 0;
let errors = 0;
let total = 0;
let time = 0;
for (let i = 0; i < count; i++) {
	let process = child_process.fork(__dirname + '/worker.js');
	processes.push(process);
	console.log('i', i, process.pid);
	process.send({
		server: servers[i % servers.length],
		mult: 20,
		tickets: 200
	});
	process.on('message', (d) => {
		response_count++;
		errors += d.errors;
		total += d.count;
		time += d.diff;
		if (response_count == count) {
			console.log('Errors:', errors);
			console.log('Total reads:', total);
			console.log('Avg. time:', time / count);
			console.log('r/ses:', total / (time / count) * 1000);
		}
	});
}