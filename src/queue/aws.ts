import * as api from '@vingps/message-schema';
import * as aws from 'aws-sdk';
import * as debug from 'debug';
import {Queue} from './queue';

export class AWSQueue implements Queue<api.v2.Message> {

	protected readonly logger: debug.IDebugger;
	protected readonly sqs: aws.SQS;
	protected readonly queueUrl: string;

	protected readonly queue: aws.SQS.SendMessageBatchRequestEntry[] = [];
	protected queueId: number = 1;
	protected flushTimeout;


	constructor(key: string, secret: string, region: string, queueUrl: string) {
		const credentials = new aws.Credentials(key, secret);
		this.sqs = new aws.SQS({
			apiVersion: '2012-11-05',
			credentials,
			region,
		});

		this.queueUrl = queueUrl;
		this.logger = debug('queue:aws');
		this.logger('Sending to: %s', queueUrl);

		this.flush();
	}

	public async enqueue(message: api.v2.Message) {

		const msg: aws.SQS.SendMessageBatchRequestEntry = {
			Id: 'msg_' + this.queueId++,
			MessageAttributes: {
				api: {
					DataType: 'String',
					StringValue: JSON.stringify(message.apiVersion),
				},
				id: {
					DataType: 'String',
					StringValue: JSON.stringify(message.id),
				},
				provider: {
					DataType: 'String',
					StringValue: message.id.provider,
				},
			},
			MessageBody: JSON.stringify(message),
		};

		this.queue.push(msg);

		// handle flushing event on messages overflow
		if (this.queue.length >= 50) {
			this.flush();
		}
	}

	/**
	 * Flushes queue messages
	 */
	public async flush() {
		if (this.flushTimeout) {
			clearTimeout(this.flushTimeout);
		}

		while (this.queue.length) {

			// take batch of 10 entries
			let counter = 0;
			const entries: aws.SQS.Types.SendMessageBatchRequestEntryList = [];
			while (this.queue.length && counter < 10) {
				entries.push(this.queue.shift());
				counter++;
			}
			if (entries.length) {
				const request: aws.SQS.Types.SendMessageBatchRequest = {
					Entries: entries,
					QueueUrl: this.queueUrl,
				};
				const promise = this.sqs.sendMessageBatch(request).promise();
				promise.then((data) => {
					this.logger('%d messages sent', entries.length);
					return data;
				});
			}
		}

		// reset flush timeout
		this.flushTimeout = setTimeout(() => this.flush(), 5 * 1000);
	}

}
