export interface DockerConfig {

	heartbeatPeriod: number;
	handshakeTimeout?: number;

	aws?: {
		accessKeyId: string;
		accessSecretKey: string;
		queueUrl: string;
		region: string;
	};

}

export function createFromEnv(): DockerConfig {
	const config: DockerConfig = {
		handshakeTimeout: process.env.HANDSHAKE_TIMEOUT ? parseInt(process.env.HANDSHAKE_TIMEOUT, 10) : 10,
		heartbeatPeriod: process.env.HEARTBEAT_PERIOD ? parseInt(process.env.HEARTBEAT_PERIOD, 10) : 60,
	};

	if (process.env.AWS_ACCESS_KEY_ID) {
		config.aws = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			accessSecretKey: process.env.AWS_SECRET_KEY,
			queueUrl: process.env.AWS_SQS_QUEUE_NAME,
			region: process.env.AWS_REGION,
		};
	}

	return config;
}
