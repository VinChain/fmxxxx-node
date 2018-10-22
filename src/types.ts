export type MessageType = 'location' | 'io' | 'obd' | 'codes';

export interface Message<T extends MessageType, P> {
	id: string;
	provider: string;
	timestamp: Date;
	imei?: string;
	type: T;
	data: P;
}

export interface LocationInfo {
	latitude: number;
	longitude: number;
	altitude: number;
	speed: number;
	course: number;
	satellites: number;
}

export interface IoData {
	[name: string]: number | string | IoItem;
}

export interface IoItem {
	value: number | string;
	units?: string;
	description: string;
}

export interface ObdInfo {
	vin: string;

	[name: string]: string;
}

export type FailureCodes = string[];

export type LocationMessage = Message<'location', LocationInfo>;
export type IoMessage = Message<'io', IoData>;
export type ObdMessage = Message<'obd', ObdInfo>;
export type FailureCodesMessage = Message<'codes', FailureCodes>;
