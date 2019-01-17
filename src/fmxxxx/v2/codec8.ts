/**
 * Generates location API v2 event from codec8 GPS section
 */
import * as fmxxxx from '@vingps/teltonika-fmxxxx';
import * as api from '../api/v2';

export function generate(record: fmxxxx.Record): api.Event[] {
	const events: api.Event[] = [];

	// tslint:disable:object-literal-sort-keys
	events.push({
		event: 'location',
		source: 'gps',
		timestamp: record.timestamp.getTime(),
		latitude: record.gps.latitude,
		longitude: record.gps.longitude,
		altitude: record.gps.altitude,
		speed: record.gps.speed,
		satellites: record.gps.satellites,
		course: record.gps.angle,
	});

	events.push({
		event: 'info',
		source: 'gps',
		timestamp: record.timestamp.getTime(),
		name: 'speed',
		value: record.gps.speed,
		units: 'km/h',
	});
	// tslint:enable:object-literal-sort-keys

	return events;
}
