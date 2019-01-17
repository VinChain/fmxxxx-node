import * as id from './id';
import { Root } from './root';

export { id };
export const VERSION = 2;

export interface Message extends Root {
	apiVersion: 2;
	id: id.Id;
	messages: Array<Event | InfoEvent | LocationEvent>;
}

export interface Event {
	event: 'location' | 'info';
	source: string;
	timestamp: number;
	[name: string]: any;
}

export interface InfoEvent extends Event {
	event: 'info';
	source: 'obd' | 'internal' | 'external' | 'ble' | 'rs232' | string;
	name: string;
	description?: string;
	subtype?: string;
	channel?: number | string;
	value: boolean | string | number | any[] | object;
	units?: string;
	error?: string;
}

export interface LocationEvent extends Event {
	event: 'location';
	source: 'gps' | 'glonass' | 'lac';
	latitude: number;
	longitude: number;
	altitude?: number;
	speed?: number;
	course?: number;
	satellites?: number;
}
