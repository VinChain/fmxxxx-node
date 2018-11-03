import * as debug from 'debug';
import * as app from '../src';
import {createFromEnv} from './docker-config';
import {MultiQueue} from '../src/queue/queue';
import {Generic} from '../src/api/v1';
import {AWSQueue} from '../src/queue/aws';

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
let heartbeatMessagesCounter = 0;
heartbeatLogger('Heartbeat set up for %d seconds', config.heartbeatPeriod);
setInterval(() => {
	heartbeatLogger(
		'%s, online: %d devices (curr: %d), %d messages',
		(new Date()).toISOString(),
		onliner.length,
		fmxxxx.connections,
		heartbeatMessagesCounter,
	);
	heartbeatMessagesCounter = 0;
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
fmxxxx.on('data', () => heartbeatMessagesCounter++);

// Bind to message enqueuer
fmxxxx.on('data', (msg: Generic) => {
	if (config.filter && (config.filter.indexOf(msg.type) < 0)) {
		return;
	}
	populationQueue.enqueue(msg);
});
