import * as fmxxxx from '@omedia/teltonika-fmxxxx';
import {EventEmitter} from 'events';
import {Generic} from './api/v1';

export interface ServerEvents {
	on(event: 'data', listener: (message: Generic) => void);
}

export class FmxxxxServer extends EventEmitter implements ServerEvents {

	private fmxxxx: fmxxxx.Server;

	constructor() {
		super();
		this.fmxxxx = fmxxxx.createServer('tcp');

		// subscribe to data event
	}

	public listen(...args: any[]) {
		// @ts-ignore
		this.fmxxxx.listen(...args);
	}

}

export function createServer(): FmxxxxServer {
	return new FmxxxxServer();
}
