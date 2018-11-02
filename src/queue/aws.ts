import * as aws from 'aws-sdk';
import * as debug from 'debug';
import {Generic} from '../api/v1';
import {Queue} from './queue';

export class AWSQueue implements Queue<Generic> {

	protected readonly logger: debug.IDebugger;
	protected readonly sqs: AWS.SQS;
	protected readonly queueName: string;

	constructor(key: string, secret: string, region: string, queue: string) {
		const credentials = new aws.Credentials(key, secret);
		this.sqs = new aws.SQS({
			apiVersion: '2012-11-05',
			credentials,
			region,
		});

		this.logger = debug('queue:aws');
	}

	public async enqueue(message: Generic) {
		const request: aws.SQS.SendMessageRequest = {
			MessageAttributes: {
				id: {
					DataType: 'String',
					StringValue: JSON.stringify(message.id),
				},
				provider: {
					DataType: 'String',
					StringValue: message.id.provider,
				},
				type: {
					DataType: 'String',
					StringValue: message.type,
				},
			},
			MessageBody: JSON.stringify(message),
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/091879517775/vingps-sensor',
		};
		const promise = this.sqs.sendMessage(request).promise();
		promise.then((data) => {
			this.logger('Message sent, ID=%s', data.MessageId);
		});
	}

}
