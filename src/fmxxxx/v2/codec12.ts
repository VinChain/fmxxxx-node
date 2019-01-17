/**
 * Generates VIN and DTC codes info API v2 event from codec12
 */
import * as api from '../api/v2';

export function generate(command: string): api.InfoEvent[] {

	const base = {
		event: 'info',
		source: 'internal',
		timestamp: Date.now(),
	};

	// tslint:disable:object-literal-sort-keys
	// try OBDinfo command
	try {
		const obdinfo = mapObdinfo(command);
		const vinEvent: api.InfoEvent = {
			...base as api.InfoEvent,
			name: 'vin',
			value: obdinfo.VIN,
		};
		return [ vinEvent ];
	} catch (e) {
		// ignore
	}

	// try Faultcodes command
	try {
		const codes = mapFaultcodes(command);
		const faultcodesEvent: api.InfoEvent = {
			...base as api.InfoEvent,
			name: 'dtc codes',
			value: codes,
		};
		return [ faultcodesEvent ];
	} catch (e) {
		// ignore
	}
	// tslint:enable:object-literal-sort-keys
}

/**
 * Protocol,
 * VIN,
 * Adaptive Timing value,
 * requested PID counter,
 * OBD application state,
 * available vehicle PIDs,
 * mil status,
 * number of DTCs
 *
 * @example Prot:0,VIN:N/A,TM:80,CNT:0,ST:IDLE,P1:0x0,P2:0x0,P3:0x0,P4:0x0,MIL:0,DTC:0,ID1,Hdr:0,Phy:0
 */
export interface ObdinfoResult {
	protocol: number;
	VIN: string | false;
	TM: number;
	CNT: number;
	ST: string;

	[name: string]: any;
}

function mapObdinfo(response: string): ObdinfoResult {
	const regexp = /^Prot:(\d+),VIN:(N\/A|[A-Z0-9]+),TM:(\d+),CNT:(\d+),ST:([^,]+),/;

	if (!regexp.test(response)) {
		throw new Error('Not an OBD info command');
	}

	const parts = response
		.trim()
		.split(',')
		.map((i) => i.trim())
		.reduce((acc, part) => {
			const subregexp = /^([a-zA-Z0-1_]+):(.*)$/;
			if (subregexp.test(part)) {
				const [, name, value] = subregexp.exec(part);
				acc.set(name.trim().toLowerCase(), value.trim().toLowerCase());
			}
			return acc;
		}, new Map());

	return {
		CNT: parseInt(parts.get('cnt'), 10),
		ST: parts.get('st').toUpperCase(),
		TM: parseInt(parts.get('tm'), 10),
		VIN: parts.get('vin') === 'n/a' ? false : parts.get('vin').toUpperCase(),
		protocol: parseInt(parts.get('prot'), 10),
	};
}

function mapFaultcodes(response: string): string[] {
	const regexp = /^((No fault codes detected)|(([A-Z]{1}\d{4})+,?))$/;

	if (!regexp.test(response)) {
		throw new Error('Not a Faultcodes result');
	}

	if (response === 'No fault codes detected') {
		return [];
	} else {
		return response.split(',').map((i) => i.trim());
	}
}
