import * as api from '@vingps/message-schema';
import * as fmxxxx from '@vingps/teltonika-fmxxxx';
import * as debug from 'debug';
import {EventEmitter} from 'events';
import {generate as generateCodec12} from './v2/codec12';
import {generate as generateCodec8} from './v2/codec8';
import {generate as generateInfo} from './v2/info';

export interface ServerEvents {
	on(event: 'connection', listener: (device: fmxxxx.Device) => void);

	on(event: 'data', listener: (message: api.v2.Message, device: fmxxxx.Device) => void);
}

export class FmxxxxServer extends EventEmitter implements ServerEvents {

	protected static generateId(device: fmxxxx.Device): api.v2.Id {
		// generates id for fmxxxx device
		return {
			imei: device.imei,
			provider: 'fmxxxx',
		};
	}

	protected static mapCodec8(device: fmxxxx.Device, record: fmxxxx.Record): api.v2.Message {
		return {
			apiVersion: 2,
			id: FmxxxxServer.generateId(device),
			messages: generateCodec8(record),
		};
	}

	protected static mapCodec12(device: fmxxxx.Device, command: string): api.v2.Message {
		return {
			apiVersion: 2,
			id: FmxxxxServer.generateId(device),
			messages: generateCodec12(command),
		};
	}

	protected static mapInfo(device: fmxxxx.Device, telemetry: fmxxxx.Telemetry, timestamp: Date): api.v2.Message {
		return {
			apiVersion: 2,
			id: FmxxxxServer.generateId(device),
			messages: generateInfo(telemetry, timestamp),
		};
	}

	private readonly fmxxxx: fmxxxx.Server;
	private readonly logger: debug.IDebugger;

	constructor(options?: fmxxxx.ServerOptions) {
		super();

		this.logger = debug('fmxxxx:mapper');
		this.fmxxxx = fmxxxx.createServer('tcp', options);

		this.fmxxxx.on('connection', (device) => this.emit('connection', device));

		this.fmxxxx.on('record', (device, record) => {
			this.publish(FmxxxxServer.mapCodec8(device, record), device);
		});
		this.fmxxxx.on('command', (device, command) => {
			this.publish(FmxxxxServer.mapCodec12(device, command), device);
		});
		this.fmxxxx.on('info', (device, telemetry, timestamp) => {
			this.publish(FmxxxxServer.mapInfo(device, telemetry, timestamp), device);
		});
	}

	public listen(...args: any[]) {
		// @ts-ignore
		this.fmxxxx.listen(...args);
	}

	get connections() {
		return this.fmxxxx.length;
	}

	protected publish(device, data: api.v2.Message) {
		if (data.messages && data.messages.length) {
			this.emit('data', data, device);
		}
	}

}

export function createServer(options?: fmxxxx.ServerOptions): FmxxxxServer {
	return new FmxxxxServer(options);
}
