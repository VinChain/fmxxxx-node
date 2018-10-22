import {FailureCodesMessage, IoMessage, LocationMessage, ObdMessage} from '../types';

export type QueueMessage = LocationMessage | IoMessage | ObdMessage | FailureCodesMessage;

export interface Queue {
	enqueue: (message: QueueMessage) => Promise<void>;
}

export class MultiQueue implements Queue {

	protected readonly queues: Queue[] = [];

	public attach(queue: Queue) {
		this.queues.push(queue);
	}

	public async enqueue(message: QueueMessage) {
		return Promise.all(this.queues.map((queue) => queue.enqueue(message))).then(() => {
			return;
		});
	}

}
