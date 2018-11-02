import * as fmxxxx from '@omedia/teltonika-fmxxxx';
import * as debug from 'debug';
import {createListener} from '../src/api/mapper/fmxxxx';
import {Generic} from '../src/api/v1';
import {createHealthServer} from '../src/health';
import online from '../src/online';
import {AWSQueue} from '../src/queue/aws';
import {MultiQueue} from '../src/queue/queue';
import * as configuration from './docker-config';

const logger = debug('app');
const config = configuration.createFromEnv();

const onlineDevices = online(30);

// setup healthcheck
const healthcheck = createHealthServer();
healthcheck.listen(16501);

const server = fmxxxx.Server.create({
	handshakeTimeout: config.handshakeTimeout * 1000, // seconds to milliseconds
});

const streaming = createListener(server);
server.listen('tcp', 16500);

server.on('connection', (imei) => {
	logger('%s client connected', imei);
	onlineDevices.update(imei);
});
server.on('data', (imei) => {
	onlineDevices.update(imei);
});


// setup heartbeat
const heartbeatLogger = debug(logger.namespace + ':heartbeat');
let heartbeatCounter = 0;
heartbeatLogger('Heartbeat set up for %d seconds', config.heartbeatPeriod);
setInterval(() => {
	heartbeatLogger(
		'%s, online: %d devices, %d messages',
		(new Date()).toISOString(),
		onlineDevices.length,
		heartbeatCounter,
	);
	// heartbeatLogger([...onlineDevices.entries()]);
	heartbeatCounter = 0;
}, Math.floor(config.heartbeatPeriod * 1000));

streaming.on('data', () => heartbeatCounter++);

// setup queues
const populationQueue = new MultiQueue<Generic>();

if (config.aws) {
	const awsQueue = new AWSQueue(
		config.aws.accessKeyId,
		config.aws.accessSecretKey,
		config.aws.region,
		config.aws.queueUrl,
	);
	populationQueue.attach(awsQueue);
	logger('AWS SQS queue attached');
}

streaming.on('data', (msg) => populationQueue.enqueue(msg));
