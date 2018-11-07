import * as debug from 'debug';
import * as util from 'util';
import * as app from '../src';
import {Generic} from '../src/api/v1';
import {AWSQueue} from '../src/queue/aws';
import {MultiQueue} from '../src/queue/queue';
import {createFromEnv} from './docker-config';
import {log} from 'util';

const logger = debug('app');
const config = createFromEnv();
logger('Config: %o', config);

// run healthcheck
logger('Initializing health server');
const healthcheck = app.createHealthServer();
healthcheck.listen(16501);

// run online service
logger('Initializing online devices tracking');
const onliner = app.online(60);

// run fmxxxx server
logger('Initializing FMxxxx server');
const fmxxxx = app.createFmxxxxServer({
	handshakeTimeoutSec: config.handshakeTimeout,
	maxCommandQueue: 10,
});
fmxxxx.listen(16500);

// run heartbeat notifier
const heartbeatLogger = debug(logger.namespace + ':heartbeat');
let heartbeatMessagesCounter: { [type: string]: number } = {};
heartbeatLogger('Heartbeat set up for %d seconds', config.heartbeatPeriod);
setInterval(() => {

	const total = Object.getOwnPropertyNames(heartbeatMessagesCounter).reduce((acc, prop) => {
		acc += heartbeatMessagesCounter[prop];
		return acc;
	}, 0);

	const description = Object.getOwnPropertyNames(heartbeatMessagesCounter).reduce((acc, prop) => {
		acc.push(util.format('%s: %d', prop, heartbeatMessagesCounter[prop]));
		return acc;
	}, []).join(', ');

	heartbeatLogger(
		'%s, online: %d devices (%d last %d sec), %d messages%s',
		(new Date()).toISOString(),
		fmxxxx.connections,
		onliner.length,
		60,
		total,
		description ? ' [' + description + ']' : '',
	);
	heartbeatMessagesCounter = {};
}, Math.floor(config.heartbeatPeriod * 1000));


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

/* ----------------------- BINDINGS ---------------------- */

// Bind VIN/faultcodes requester
// TODO bind on message of faultcodes count
fmxxxx.on('connection', (device) => {
	device.command('obdinfo');
	device.command('faultcodes');
});

// Bind onliner & message counter
fmxxxx.on('data', (msg, device) => onliner.update(device.imei));
fmxxxx.on('data', (msg) => {
	if (heartbeatMessagesCounter[msg.type]) {
		heartbeatMessagesCounter[msg.type]++;
	} else {
		heartbeatMessagesCounter[msg.type] = 1;
	}
});

// Bind to message enqueuer
if (config.filter) {
	logger('Message filter configured to types: %s', config.filter.join(', '));
} else {
	logger('No message filter configured');
}
fmxxxx.on('data', (msg: Generic) => {
	if (config.filter && (config.filter.indexOf(msg.type) < 0)) {
		logger('Message %s filtered', msg.type);
		return;
	}
	populationQueue.enqueue(msg);
});
