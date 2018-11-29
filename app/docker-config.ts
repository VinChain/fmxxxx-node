export interface DockerConfig {

	heartbeatPeriod: number;
	handshakeTimeout?: number;

	filter?: string[];

	aws?: {
		accessKeyId: string;
		accessSecretKey: string;
		queueUrl: string;
		region: string;
	};

	rabbitmq?: {
		url: string;
		queue: string;
	};

}

export function createFromEnv(): DockerConfig {
	const config: DockerConfig = {
		handshakeTimeout: process.env.HANDSHAKE_TIMEOUT ? parseInt(process.env.HANDSHAKE_TIMEOUT, 10) : 10,
		heartbeatPeriod: process.env.HEARTBEAT_PERIOD ? parseInt(process.env.HEARTBEAT_PERIOD, 10) : 60,
	};

	if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SQS_QUEUE_NAME) {
		config.aws = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			accessSecretKey: process.env.AWS_SECRET_KEY,
			queueUrl: process.env.AWS_SQS_QUEUE_NAME,
			region: process.env.AWS_REGION,
		};
	}

	if (process.env.RABBITMQ_URL && process.env.RABBITMQ_QUEUE) {
		config.rabbitmq = {
			queue: process.env.RABBITMQ_QUEUE,
			url: process.env.RABBITMQ_URL,
		};
	}

	if (process.env.MESSAGE_FILTER) {
		const filter = process.env.MESSAGE_FILTER.split(',').map((i) => i.trim());
		if (filter.length) {
			config.filter = filter;
		}
	}

	return config;
}
