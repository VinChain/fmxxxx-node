import * as fmxxxx from '@vingps/teltonika-fmxxxx';
import * as debug from 'debug';
import {EventEmitter} from 'events';
import * as api from './api/v2';
import {generate as generateCodec12} from './v2/codec12';
import {generate as generateCodec8} from './v2/codec8';
import {generate as generateInfo} from './v2/info';

export interface ServerEvents {
	on(event: 'connection', listener: (device: fmxxxx.Device) => void);

	on(event: 'data', listener: (message: api.Message, device: fmxxxx.Device) => void);
}

export class FmxxxxServer extends EventEmitter implements ServerEvents {

	protected static generateId(device: fmxxxx.Device): api.id.FmxxxxId {
		// generates id for fmxxxx device
		return {
			imei: device.imei,
			provider: 'fmxxxx',
		};
	}

	protected static mapCodec8(device: fmxxxx.Device, record: fmxxxx.Record): api.Message {
		return {
			apiVersion: 2,
			id: FmxxxxServer.generateId(device),
			messages: generateCodec8(record),
		};
	}

	protected static mapCodec12(device: fmxxxx.Device, command: string): api.Message {
		return {
			apiVersion: 2,
			id: FmxxxxServer.generateId(device),
			messages: generateCodec12(command),
		};
	}

	protected static mapInfo(device: fmxxxx.Device, telemetry: fmxxxx.Telemetry, timestamp: Date): api.Message {
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

		this.fmxxxx.on('record', (device, record) => FmxxxxServer.mapCodec8(device, record));
		this.fmxxxx.on('command', (device, command) => FmxxxxServer.mapCodec12(device, command));
		this.fmxxxx.on('info', (device, telemetry, timestamp) => FmxxxxServer.mapInfo(device, telemetry, timestamp));
	}

	public listen(...args: any[]) {
		// @ts-ignore
		this.fmxxxx.listen(...args);
	}

	get connections() {
		return this.fmxxxx.length;
	}

}

export function createServer(options?: fmxxxx.ServerOptions): FmxxxxServer {
	return new FmxxxxServer(options);
}
