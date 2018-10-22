import * as debug from 'debug';
import * as net from 'net';

export const createHealthServer = (): net.Server => {
	const server = net.createServer();
	const logger = debug('healthcheck:server');

	server.on('connection', (socket) => {
		// logger('Health check connnection established');
		socket.write('Hello!', 'hex');
	});

	return server;
};

