export interface Queue<T> {
	enqueue: (message: T) => Promise<void>;
}

export class MultiQueue<T> implements Queue<T> {

	protected readonly queues: Array<Queue<T>> = [];

	public attach(queue: Queue<T>) {
		this.queues.push(queue);
	}

	public async enqueue(message: T) {
		return Promise.all(this.queues.map((queue) => queue.enqueue(message))).then(() => {
			return;
		});
	}

}
