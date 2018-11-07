import * as fmxxxx from '@omedia/teltonika-fmxxxx';
import * as debug from 'debug';
import {EventEmitter} from 'events';
import {Generic} from '../api/v1';
import codec12 from './mapper/codec12';
import codec8 from './mapper/codec8';

export interface ServerEvents {
	on(event: 'connection', listener: (device: fmxxxx.Device) => void);

	on(event: 'data', listener: (message: Generic, device: fmxxxx.Device) => void);
}

export class FmxxxxServer extends EventEmitter implements ServerEvents {

	private readonly fmxxxx: fmxxxx.Server;
	private readonly logger: debug.IDebugger;

	constructor(options?: fmxxxx.ServerOptions) {
		super();

		this.logger = debug('fmxxxx:mapper');
		this.fmxxxx = fmxxxx.createServer('tcp', options);

		// subscribe to data event
		// this.fmxxxx.on('data', (device, codec, record) => this.map(device, codec, record));
		this.fmxxxx.on('connection', (device) => this.emit('connection', device));

		this.fmxxxx.on('record', (device, record) => this.map(device, 8, record));
		this.fmxxxx.on('command', (device, record) => this.map(device, 12, record));

	}

	public listen(...args: any[]) {
		// @ts-ignore
		this.fmxxxx.listen(...args);
	}

	protected map(device: fmxxxx.Device, codecId: number, record) {
		const records: Generic[] = [];
		switch (codecId) {
			case fmxxxx.CODEC8:
				records.push(...codec8(device.imei, record));
				break;
			case fmxxxx.CODEC12:
				records.push(...codec12(device.imei, record));
				break;
		}
		this.logger('%d messages generated from device %s', records.length, device.imei);
		records.forEach((r) => this.emit('data', r, device));
	}

	get connections() {
		return this.fmxxxx.length;
	}

}

export function createServer(options?: fmxxxx.ServerOptions): FmxxxxServer {
	return new FmxxxxServer(options);
}
