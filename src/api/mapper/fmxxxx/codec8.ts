import * as fmxxxx from '@omedia/teltonika-fmxxxx';
import * as debug from 'debug';
import * as v1 from '../../v1';
import {CodecMapper} from './mapper';

export type Record = fmxxxx.codec8.Record;
export type OutputType = v1.Location | v1.Telemetry;

const logger = debug('fmxxxx:mapper:codec8');

export const codec8: CodecMapper<Record, OutputType> = (imei: string, record: Record): OutputType[] => {
	const messages = [];
	messages.push(...generateLocations(imei, record));
	messages.push(...generateTelemetry(imei, record));
	logger('%d messages generated', messages.length);
	return messages;
};

const generateLocations: CodecMapper<Record, v1.Location> = (imei, data) => {
	const messages = [];
	if (data.gps) {
		const location: v1.Location = {
			apiVersion: v1.VERSION,
			data: {
				altitude: data.gps.altitude,
				course: data.gps.angle,
				latitude: data.gps.latitude,
				longitude: data.gps.longitude,
				satellites: data.gps.sattelites,
				speed: data.gps.speed,
			},
			id: {
				imei,
				provider: 'fmxxxx',
			},
			timestamp: data.timestamp.getTime(),
			type: 'location',
		};
		messages.push(location);
	}
	return messages;
};

const generateTelemetry: CodecMapper<Record, v1.Telemetry | v1.FmxxxxIo> = (imei, data) => {
	const messages = [];

	// Add simple message for FMxxxx devices
	if (data.io) {
		const io: v1.FmxxxxIo = {
			apiVersion: v1.VERSION,
			data: Object.getOwnPropertyNames(data.io.data).sort().reduce((acc, ioId) => {
				acc[ioId] = data.io.data[ioId];
				return acc;
			}, {}),
			id: {
				imei,
				provider: 'fmxxxx',
			},
			timestamp: data.timestamp.getTime(),
			type: 'io',
		};
		messages.push(io);
	}


	// Compiles telemetry data
	if (data.io) {
		const telemetry: v1.Telemetry = {
			apiVersion: v1.VERSION,
			data: {},
			id: {
				imei,
				provider: 'fmxxxx',
			},
			timestamp: data.timestamp.getTime(),
			type: 'telemetry',
		};

		// preset accel
		if (data.io.data['17'] && data.io.data['18'] && data.io.data['19']) {
			telemetry.data.accelerometer = { x: 0, y: 0, z: 0 };
		}

		// common
		for (const ioId of Object.getOwnPropertyNames(data.io.data)) {
			const value = data.io.data[ioId];
			switch (parseInt(ioId, 10)) {
				case 239:
					telemetry.data.ignition = !!value;
					break;
				case 240:
					telemetry.data.movement = !!value;
					break;
				case 24:
					telemetry.data.speed = value;
					break;
				case 36:
					telemetry.data.engine_rpm = value;
					break;
				case 13:
					telemetry.data.average_fuel_use = value;
					break;
				case 48:
					telemetry.data.fuel_level = value;
					break;
				case 16:
					telemetry.data.total_odometer = value / 1000; // km
					break;
				case 199:
					telemetry.data.trip_odometer = value / 1000; // km
					break;
				case 17:
					telemetry.data.accelerometer.x = value / 1000; // mG => G
					break;
				case 18:
					telemetry.data.accelerometer.y = value / 1000; // mG => G
					break;
				case 19:
					telemetry.data.accelerometer.z = value / 1000; // mG => G
					break;
			}
		}

		messages.push(telemetry);
	}

	return messages;
};

