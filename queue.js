'use strict'

let child_process = require('child_process');

let processes = [];
let mult = 40;
let max_ticket = 200;
let count = mult * max_ticket;

let slaves_count = 2;


// let servers = ['couchbase://192.168.1.36', 'couchbase://192.168.1.37', 'couchbase://192.168.1.42'];
// let servers = ['couchbase://192.168.1.36', 'couchbase://192.168.1.37'];
let servers = ['couchbase://192.168.1.36'];
// let servers = ['couchbase://194.226.171.146'];
let response_count = 0;
let errors = 0;
let time;
let ready = 0;

let cursor = 0;

function command(id) {
	processes[cursor].send({
		command: 'get',
		id: id
	});
	cursor = (cursor + 1) % processes.length;
}

function go() {
	time = process.hrtime();
	for (let j = 0; j < mult; j += 1) {
		let data = [];
		for (let i = 0; i < max_ticket; i += 1) {
			let id = 'ticket-department-1-2016-04-05--' + i;
			command(id);
			// data.push(id);
		}
		// command(data);
	}
}
for (let i = 0; i < slaves_count; i++) {
	let chprocess = child_process.fork(__dirname + '/slave.js');
	processes.push(chprocess);
	console.log('i', i, chprocess.pid);
	chprocess.send({
		command: 'init',
		server: servers[i % servers.length]
	});

	chprocess.on('message', (d) => {
		if (d.state) {
			ready++;
			if (ready == slaves_count) go();
			return;
		}

		errors += d.errors;
		response_count++;
		if (response_count == count) {
			let diff = process.hrtime(time);
			let total_time = (diff[0] * 1e9 + diff[1]) / 1000000;
			console.log('benchmark took %d msec', total_time);
			console.log('responses', response_count);
			console.log('Errors:', errors);
			console.log('r/ses:', response_count / total_time * 1000);
			process.exit();
		}
	});
}