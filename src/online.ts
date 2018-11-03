export class Online {

	private readonly onlineDevices: Map<string, number>;
	private readonly cleanupInterval: number;

	constructor(timeout: number = 60) {
		this.onlineDevices = new Map<string, number>();

		if (timeout) {
			this.cleanupInterval = setInterval(() => {
				const currTimestamp = Date.now();
				for (const [imei, timestamp] of this.onlineDevices) {
					if (timestamp + 60 * 1000 <= currTimestamp) {
						this.onlineDevices.delete(imei);
					}
				}
			});
		}
	}

	public* entries(): IterableIterator<string> {
		for (const [imei, timeout] of this.onlineDevices) {
			yield imei;
		}
	}

	public update(imei: string) {
		if (imei) {
			this.onlineDevices.set(imei, Date.now());
		}
	}

	public remove(imei) {
		if (this.onlineDevices.has(imei)) {
			this.onlineDevices.delete(imei);
		}
	}

	get length(): number {
		return this.onlineDevices.size;
	}

	public close() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
	}

}

export default (timeout?: number) => {
	return new Online(timeout ? timeout : 60);
};
