import {Server} from '@omedia/teltonika-fmxxxx';
import * as debug from 'debug';
import {EventEmitter} from 'events';
import {codec8, OutputType} from './codec8';

export interface ListenerEvents {
	on(event: 'data', callback: (msg: OutputType) => void);
}

export function createListener(server: Server): ListenerEvents {
	const emitter = new EventEmitter();
	const logger = debug('fmxxxx:mapper:listener');
	server.on('data', (imei, codec, record) => {
		switch (codec) {
			case 0x08:
				codec8(imei, record).forEach((msg) => emitter.emit('data', msg));
				break;

			default:
				logger('Codec %X is not supported', codec);
				break;
		}

	});

	logger('Initialized');
	return emitter;
}
