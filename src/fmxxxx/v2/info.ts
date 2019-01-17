/**
 * Generates number of API v2 events from 'info' event message
 */
import * as fmxxxx from '@vingps/teltonika-fmxxxx';
import * as api from '../api/v2';

export function generate(telemetry: fmxxxx.Telemetry, timestamp: Date): api.InfoEvent[] {
	// in case of partial frame, generic event properties are generated separately of telemetry-specific
	type PartialInfoObject = {
		[name in keyof api.InfoEvent]?: api.InfoEvent[name];
	};

	const genericInfo: PartialInfoObject = {
		event: 'info',
		timestamp: timestamp.getTime(),
	};

	const events: PartialInfoObject[] = [];

	// here's huge api event switch case for every event of decoded IO
	// tslint:disable:object-literal-sort-keys

	// permanent events iteration
	for (const name of Object.keys(telemetry.permanent)) {
		const item: fmxxxx.TelemetryItem = telemetry[name];
		switch (name) {

			// IO block
			case 'Digital Input 1':
				events.push({
					name: 'input',
					source: 'internal',
					subtype: 'digital',
					channel: 1,
					value: item.value,
				});
				break;
			case 'Digital Input 2':
				events.push({
					name: 'input',
					source: 'internal',
					subtype: 'digital',
					channel: 2,
					value: item.value,
				});
				break;
			case 'Digital Input 3':
				events.push({
					name: 'input',
					source: 'internal',
					subtype: 'digital',
					channel: 3,
					value: item.value,
				});
				break;

			case 'Analog Input 2':
				events.push({
					name: 'input',
					source: 'internal',
					subtype: 'analog',
					channel: 2,
					value: item.value * 1000, // mV -> V
					units: 'V',
				});
				break;

			case 'Analog Input 1':
				events.push({
					name: 'input',
					source: 'internal',
					subtype: 'analog',
					channel: 1,
					value: item.value * 1000, // mV -> V
					units: 'V',
				});
				break;

			case 'Digital Output 1':
				events.push({
					name: 'output',
					source: 'internal',
					subtype: 'digital',
					channel: 1,
					value: !!item.value,
				});
				break;

			case 'Digital Output 2':
				events.push({
					name: 'output',
					source: 'internal',
					subtype: 'digital',
					channel: 2,
					value: !!item.value,
				});
				break;
			// end of IO block

			case 'ICCID1': // ICCID2 included
				if (telemetry.permanent.ICCID2) {
					events.push({
						name: 'iccid',
						source: 'internal',
						value: item.value + telemetry.permanent.ICCID2.value, // concat 2 sections
					});
				}
				break;

			case 'Fuel Used GPS':
				events.push({
					name: 'fuel used',
					source: 'gps',
					value: item.value * 1000, // mL -> L
					units: 'L',
				});
				break;

			case 'Fuel Rate GPS':
				events.push({
					name: 'fuel rate',
					source: 'gps',
					value: item.value / (item.multiplier ? item.multiplier : 1), // mL -> L
					units: 'L/h',
				});
				break;

			case 'Eco Score':
				events.push({
					name: 'eco score',
					source: 'internal',
					value: item.value * (item.multiplier ? item.multiplier : 1),
				});
				break;

			case 'Total Odometer':
				events.push({
					name: 'odometer',
					source: 'internal',
					subtype: 'total',
					value: item.value * (item.multiplier ? item.multiplier : 1) / 1000, // m -> km
					units: 'km',
				});
				break;

			case 'Trip Odometer':
				events.push({
					name: 'odometer',
					source: 'internal',
					subtype: 'trip',
					value: item.value * (item.multiplier ? item.multiplier : 1) / 1000, // m -> km
					units: 'km',
				});
				break;


			case 'Axis X': // Axis Y, Axis Z
				if (telemetry.permanent['Axis Y'] && telemetry.permanent['Axis Z']) {
					events.push({
						name: 'accelerometer',
						source: 'internal',
						value: {
							x: item.value * 1000, // mG -> G
							y: telemetry.permanent['Axis Y'].value * 1000, // mG -> G
							z: telemetry.permanent['Axis Z'].value * 1000, // mG -> G
						},
						units: 'G',
					});
				}
				break;


			// BLE battery voltages group
			case 'BLE 1 Battery Voltage':
				events.push({
					name: 'battery voltage',
					source: 'ble',
					channel: 1,
					value: item.value,
					units: '%',
				});
				break;
			case 'BLE 2 Battery Voltage':
				events.push({
					name: 'battery voltage',
					source: 'ble',
					channel: 2,
					value: item.value,
					units: '%',
				});
				break;
			case 'BLE 3 Battery Voltage':
				events.push({
					name: 'battery voltage',
					source: 'ble',
					channel: 3,
					value: item.value,
					units: '%',
				});
				break;
			case 'BLE 4 Battery Voltage':
				events.push({
					name: 'battery voltage',
					source: 'ble',
					channel: 4,
					value: item.value,
					units: '%',
				});
				break;
			// endof BLE voltages

			// BLE temperature block
			case 'BLE 1 Temperature':
				if (!item.error) {
					events.push({
						name: 'temperature',
						source: 'ble',
						channel: 1,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'BLE 2 Temperature':
				if (!item.error) {
					events.push({
						name: 'temperature',
						source: 'ble',
						channel: 2,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'BLE 3 Temperature':
				if (!item.error) {
					events.push({
						name: 'temperature',
						source: 'ble',
						channel: 3,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'BLE 4 Temperature':
				if (!item.error) {
					events.push({
						name: 'temperature',
						source: 'ble',
						channel: 4,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			// endof BLE temperatures

			case 'GSM Signal':
				events.push({
					name: 'gsm signal',
					source: 'internal',
					channel: 1,
					value: item.value * 20,
					units: '%',
				});
				break;

			case 'Speed':
				events.push({
					name: 'speed',
					source: 'internal',
					value: item.value,
					units: 'km/h',
				});
				break;

			case 'External Voltage':
				events.push({
					name: 'battery voltage',
					source: 'internal',
					subtype: 'vehicle',
					value: item.value / 1000, // mv -> V
					units: 'V',
				});
				break;

			case 'Battery Voltage':
				events.push({
					name: 'battery voltage',
					source: 'internal',
					subtype: 'internal',
					value: item.value / 1000, // mv -> V
					units: 'V',
				});
				break;

			case 'Battery Current':
				events.push({
					name: 'battery current',
					source: 'internal',
					subtype: 'internal',
					value: item.value / 1000, // mA -> A
					units: 'A',
				});
				break;

			// Dallas temperature settings block
			case 'Dallas Temperature 1':
				if (telemetry.permanent['Dallas Temperature ID 1']) {
					events.push({
						name: 'temperature',
						source: 'dallas',
						channel: telemetry.permanent['Dallas Temperature ID 1'].value,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'Dallas Temperature 2':
				if (telemetry.permanent['Dallas Temperature ID 2']) {
					events.push({
						name: 'temperature',
						source: 'dallas',
						channel: telemetry.permanent['Dallas Temperature ID 2'].value,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'Dallas Temperature 3':
				if (telemetry.permanent['Dallas Temperature ID 3']) {
					events.push({
						name: 'temperature',
						source: 'dallas',
						channel: telemetry.permanent['Dallas Temperature ID 3'].value,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			case 'Dallas Temperature 4':
				if (telemetry.permanent['Dallas Temperature ID 4']) {
					events.push({
						name: 'temperature',
						source: 'dallas',
						channel: telemetry.permanent['Dallas Temperature ID 4'].value,
						value: item.value * (item.multiplier ? item.multiplier : 1),
						units: '°C',
					});
				}
				break;
			// endof Dallas temperature settings block

			// BLE humidity block
			case 'BLE 1 Humidity':
				events.push({
					name: 'humidity',
					source: 'ble',
					channel: 1,
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%RH',
				});
				break;
			case 'BLE 2 Humidity':
				events.push({
					name: 'humidity',
					source: 'ble',
					channel: 2,
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%RH',
				});
				break;
			case 'BLE 3 Humidity':
				events.push({
					name: 'humidity',
					source: 'ble',
					channel: 3,
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%RH',
				});
				break;
			case 'BLE 4 Humidity':
				events.push({
					name: 'humidity',
					source: 'ble',
					channel: 4,
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%RH',
				});
				break;
			// endof BLE humidity block

			case 'Battery Level':
				events.push({
					name: 'battery level',
					source: 'internal',
					subtype: 'internal',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'Charger Connected':
				events.push({
					name: 'charger connected',
					source: 'internal',
					value: !!item.value,
				});
				break;

			case 'Driving Direction':
				events.push({
					name: 'driving direction',
					source: 'internal',
					value: ((val): string => {
						switch (val) {
							case 1:
								return 'forward';
							case 2:
								return 'backward';
							default:
								return 'unknown';
						}
					})(item.value),
				});
				break;

			case 'Ignition':
				events.push({
					name: 'ignition',
					source: 'internal',
					value: !!item.value,
				});
				break;

			case 'Movement':
				events.push({
					name: 'movement',
					source: 'internal',
					value: !!item.value,
				});
				break;

		}
	}

	// obd events iteration
	for (const name of Object.keys(telemetry.obd)) {
		const item: fmxxxx.TelemetryItem = telemetry[name];
		switch (name) {

			case 'Number of DTC':
				events.push({
					name: 'dtc count',
					source: 'obd',
					value: item.value,
				});
				break;

			case 'Engine Load':
				events.push({
					name: 'engine load',
					source: 'obd',
					subtype: 'calculated',
					value: item.value,
					units: '%',
				});
				break;

			case 'Absolute Load Value':
				events.push({
					name: 'engine load',
					source: 'obd',
					subtype: 'absolute',
					value: item.value,
					units: '%',
				});
				break;

			case 'Coolant Temperature':
				events.push({
					name: 'temperature',
					source: 'obd',
					subtype: 'coolant',
					value: item.value,
					units: '°C',
				});
				break;

			case 'Short Fuel Trim':
				events.push({
					name: 'short fuel trim',
					source: 'obd',
					value: item.value,
					units: '%',
				});
				break;

			case 'Fuel pressure':
				events.push({
					name: 'fuel pressure',
					source: 'obd',
					value: item.value,
					units: 'kPa',
				});
				break;

			case 'Intake MAP':
				events.push({
					name: 'intake map',
					source: 'obd',
					value: item.value,
					units: 'kPa',
				});
				break;

			case 'Engine RPM':
				events.push({
					name: 'tachometer',
					source: 'obd',
					subtype: 'engine',
					value: item.value,
					units: 'rpm',
				});
				break;

			case 'Vehicle Speed':
				events.push({
					name: 'speed',
					source: 'obd',
					value: item.value,
					units: 'km/h',
				});
				break;

			case 'Timing Advance':
				events.push({
					name: 'timing advance',
					source: 'obd',
					value: item.value,
					units: '°',
				});
				break;

			case 'Intake Air Temperature':
				events.push({
					name: 'temperature',
					source: 'obd',
					subtype: 'intake',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '°C',
				});
				break;

			case 'MAF':
				events.push({
					name: 'maf',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'g/sec',
				});
				break;

			case 'Throttle Position':
				events.push({
					name: 'throttle position',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'Run Time Since Engine Start':
				events.push({
					name: 'run time since engine start',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 's',
				});
				break;

			case 'Relative Fuel Rail Pressure':
				events.push({
					name: 'fuel rail pressure',
					source: 'obd',
					subtype: 'relative',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'kPa',
				});
				break;

			case 'Direct Fuel Rail Pressure':
				events.push({
					name: 'fuel rail pressure',
					source: 'obd',
					subtype: 'direct',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'kPa',
				});
				break;

			case 'Commanded EGR':
				events.push({
					name: 'egr',
					source: 'obd',
					subtype: 'commanded',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'EGR Error':
				events.push({
					name: 'egr',
					source: 'obd',
					subtype: 'error',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'Fuel Level':
				events.push({
					name: 'fuel level',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'Distance Since Codes Clear':
				events.push({
					name: 'distance since codes clear',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'km',
				});
				break;

			case 'Barometric Pressure':
				events.push({
					name: 'barometric pressure',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'kPa',
				});
				break;

			case 'Control Module Voltage':
				events.push({
					name: 'control module voltage',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1) * 1000, // mV -> V
					units: 'V',
				});
				break;

			case 'Ambient Air Temperature':
				events.push({
					name: 'temperature',
					source: 'obd',
					subtype: 'ambient',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '°C',
				});
				break;

			case 'Absolute Fuel Rail Pressure':
				events.push({
					name: 'fuel rail pressure',
					source: 'obd',
					subtype: 'absolute',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'kPa',
				});
				break;

			case 'Hybrid battery pack life':
				events.push({
					name: 'battery level',
					source: 'obd',
					subtype: 'hybrid pack',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '%',
				});
				break;

			case 'Engine Oil Temperature':
				events.push({
					name: 'temperature',
					source: 'obd',
					subtype: 'oil',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: '°C',
				});
				break;

			case 'Fuel Injection Timing':
				events.push({
					name: 'fuel injection timing',
					source: 'obd',
					value: item.value,
					units: '°',
				});
				break;

			case 'Fuel Rate':
				events.push({
					name: 'fuel rate',
					source: 'obd',
					value: item.value * (item.multiplier ? item.multiplier : 1),
					units: 'L/100km',
				});
				break;

		}

	}

	// eventual iteration
	for (const name of Object.keys(telemetry.eventual)) {
		const item: fmxxxx.TelemetryItem = telemetry[name];
		switch (name) {
			case 'Alarm':
				events.push({
					name: 'alarm',
					source: 'internal',
					value: !!item.value,
				});
				break;

			case 'Gyroscope axis':
				events.push({
					name: 'gyroscope',
					source: 'internal',
					value: {
						x: item.value[0],
						y: item.value[1],
						z: item.value[2],
					},
					units: '°/s',
				});
				break;
			case 'Towing':
				events.push({
					name: 'towing',
					source: 'internal',
					value: !!item.value,
				});
				break;

			case 'Crash detection':
				events.push({
					name: 'crash detection',
					source: 'internal',
					value: ((val): string => {
						switch (val) {
							case 2:
								return 'limited not calibrated';
							case 3:
								return 'limited calibrated';
							case 4:
								return 'full not calibrated';
							case 5:
								return 'full calibrated';
							default:
								return 'crash';
						}
					})(item.value),
				});
				break;

			case 'Immobilizer':
				events.push({
					name: 'immobilizer',
					source: 'internal',
					value: ((val): string => {
						switch (val) {
							case 1:
								return 'connected';
							case 2:
								return 'authorized';
							default:
								return 'not connected';
						}
					})(item.value),
				});
				break;

			case 'Jamming':
				events.push({
					name: 'jamming',
					source: 'internal',
					value: !!item.value,
				});
				break;

			case 'Unplug':
				events.push({
					name: 'unplug',
					source: 'internal',
					value: !!item.value,
				});
				break;
		}
	}

	// tslint:enable:object-literal-sort-keys

	return events.map((evt) => ({
		...genericInfo,
		evt,
	} as api.InfoEvent));
}
