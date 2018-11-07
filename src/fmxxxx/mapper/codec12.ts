import * as debug from 'debug';
import * as v1 from '../../api/v1';
import {CodecMapper} from '../mapper';

const logger = debug('fmxxxx:mapper:codec12');

export type OutputType = v1.Vin | v1.FaultCodes;

export const map: CodecMapper<string, OutputType> = (imei, command: string): OutputType[] => {

	logger('Got %o', command);
	const result: OutputType[] = [];

	// try OBDinfo command
	try {
		const obdinfo = mapObdinfo(command);
		const vinData: v1.Vin = {
			apiVersion: 1,
			data: obdinfo.VIN,
			id: {imei, provider: 'fmxxxx'},
			timestamp: Date.now(),
			type: 'vin',
		};
		result.push(vinData);
		return result;
	} catch (e) {
		// ignore
	}

	// try Faultcodes command
	try {
		const codes = mapFaultcodes(command);
		const faultcodesData: v1.FaultCodes = {
			apiVersion: 1,
			data: codes,
			id: {imei, provider: 'fmxxxx'},
			timestamp: Date.now(),
			type: 'faultcodes',
		};
		result.push(faultcodesData);
		return result;
	} catch (e) {
		// ignore
	}

	logger('No commands parsed from %s', command);
	return result;
};

export default map;


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

	const NO_CODES = 'No fault codes detected';

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
