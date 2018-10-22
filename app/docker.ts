import * as fmxxxx from '@omedia/teltonika-fmxxxx';
import * as debug from 'debug';
import {createHealthServer} from '../src/health';
import {AWSQueue} from '../src/queue/aws';
import {MultiQueue} from '../src/queue/queue';
import {FailureCodesMessage, IoMessage, LocationMessage, ObdMessage} from '../src/types';
import * as configuration from './docker-config';

const logger = debug('app');
const config = configuration.createFromEnv();

const healthcheck = createHealthServer();
healthcheck.listen(16501);

const server = fmxxxx.Server.create({
	handshakeTimeout: config.handshakeTimeout * 1000, // seconds to milliseconds
});

server.listen('tcp', 16500);

server.on('connection', (imei) => {
	logger('%s client detected', imei);
});

// Graceful shutdown
// process.on('SIGINT', () => {
// 	server.close();
// });

// setup heartbeat
setInterval(() => {
	logger('Heartbeat at: %s', (new Date()).toISOString());
}, config.heartbeatPeriod * 1000);


// setup queues
const populationQueue = new MultiQueue();

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


server.on('data', (imei: string, codec: number, record) => {
	const messages: ExportMessage[] = [];
	switch (codec) {
		case 0x08:
			logger('Splitting CODEC=0x08 record');
			messages.push(...splitCodec8(record, imei));
			break;
		default:
			logger('Ignoring CODEC=0x0', codec.toString(16));
			break;
	}

	if (messages.length) {
		logger('Populating %d export messages', messages.length);
		try {
			for (const message of messages) {
				// logger('Message: %o', message);
				populationQueue.enqueue(message);
			}
		} catch (err) {
			logger('Error populating messages [%s]: %s', err.name, err.message);
		}

	}
});


type ExportMessage = LocationMessage | IoMessage | ObdMessage | FailureCodesMessage;
type DataSplitter<T> = (data: T, ...args: any[]) => ExportMessage[];

const splitCodec8: DataSplitter<fmxxxx.codec8.Record> = (data, imei) => {
	const messages: ExportMessage[] = [];

	const common = {
		id: imei,
		imei,
		provider: 'teltonika-node',
		timestamp: data.timestamp,
	};

	if (data.gps) {
		const message: LocationMessage = {
			...common,
			data: {
				altitude: data.gps.altitude,
				course: data.gps.angle,
				latitude: data.gps.latitude,
				longitude: data.gps.longitude,
				satellites: data.gps.sattelites,
				speed: data.gps.speed,
			},
			type: 'location',
		};
		messages.push(message);
	}

	if (data.io) {
		const ios = Object.keys(data.io.data)
			.filter((key) => !(data.io.data[key] instanceof Buffer))
			.reduce((sup, key) => {
				sup[key] = data.io.data[key];
				return sup;
			}, {});

		const message: IoMessage = {
			...common,
			data: ios,
			type: 'io',
		};
		messages.push(message);
	}
	return messages;
};

