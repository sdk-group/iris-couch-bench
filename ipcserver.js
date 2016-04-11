'use strict'
const ipc = require('node-ipc');
let child_process = require('child_process');

let ready = 0;
let mult = 100;
let max_ticket = 200;
let count = mult * max_ticket;
let response_count = 0;
let errors = 0;

let slaves_count = 2;
let processes = [];
let cursor = 0;
let time;

ipc.config.id = 'world';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve(
	function () {
		console.log('Start!');
		for (let i = 0; i < slaves_count; i++) {
			let chprocess = child_process.fork(__dirname + '/ipcclient.js');
		}
	}
);

ipc.server.start();

ipc.server.on(
	'app.ready',
	function (data, socket) {
		ipc.server.emit(
			socket,
			'app.settings', {
				server: 'couchbase://192.168.1.36'
			});
	}
);


ipc.server.on(
	'app.go',
	function (data, socket) {
		ready++;
		processes.push(socket);
		console.log('Workers ready', ready);
		if (ready == slaves_count) doBench();
	});

ipc.server.on(
	'app.response',
	function (d, socket) {
		// errors += d.errors;
		response_count += d.length;
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

function command(id) {
	ipc.server.emit(
		processes[cursor],
		'app.get', {
			id: id
		});

	cursor = (cursor + 1) % processes.length;
}

function doBench() {
	time = process.hrtime();
	for (let j = 0; j < mult; j += 1) {
		let data = [];
		for (let i = 0; i < max_ticket; i += 1) {
			let id = 'ticket-department-1-2016-04-05--' + i;
			// command(id);
			data.push(id);
		}
		command(data);
	}
};