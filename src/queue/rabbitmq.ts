import * as api from '@vingps/message-schema';
import * as amqp from 'amqplib';
import * as debug from 'debug';
import {EventEmitter} from 'events';
import {Queue} from './queue';

export interface RabbitmqQueueEvents {
	on(event: 'error', listener: (err: Error) => void);
}

export class RabbitmqQueue extends EventEmitter implements RabbitmqQueueEvents, Queue<api.v2.Message> {

	protected readonly logger: debug.IDebugger;
	protected channel: amqp.Channel;
	protected readonly url: string;
	protected readonly queue: string;

	constructor(url: string, queue: string) {
		super();
		this.logger = debug('queue:rabbitmq');
		this.logger('Sending to: %s -> %s', url, queue);
		this.url = url;
		this.queue = queue;
	}

	public async enqueue(message: api.v2.Message) {

		// prepare message
		const payload = JSON.stringify(message);
		const buffer = Buffer.from(payload, 'UTF-8');

		// prepare channel
		const channel = this.channel ? this.channel : await this.connect();

		if (!channel.sendToQueue(this.queue, buffer)) {
			this.logger('Message %s not sent', payload);
			this.emit('error', new Error('Unable to send message'));
		}
	}

	public async connect(): Promise<amqp.Channel> {
		this.logger('Connecting to queue: %s', this.url);
		const connection = await amqp.connect(this.url);
		connection.on('error', (err) => this.emit('error', err));

		const channel = await connection.createChannel();
		channel.on('error', (err) => this.emit('error', err));

		this.channel = channel;

		return this.channel;
	}

}
