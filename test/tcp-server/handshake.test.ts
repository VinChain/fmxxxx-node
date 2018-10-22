import * as net from 'net';
import {createServer} from '../../_tmp/tcp-server';

const testHost = '127.0.0.1';
const testPort = 9999;

beforeAll(() => {
	this.server = createServer().listen(testPort, testHost);
	this.client = () => net.createConnection(testPort, testHost);
});

afterAll(() => {
	this.server.close();
});

beforeEach(() => {
	this.connection = this.client();
	this.connection.on('data', () => null);

	this.connection.awaiter = (event, timeout: number = 1000, clbk?) => new Promise((resolve, reject) => {
		const callback = jest.fn(clbk);
		const t = setTimeout(() => resolve(callback), timeout);
		this.connection.once(event, (...args) => {
			clearTimeout(t);
			callback(...args);
			resolve(callback);
		});
	});

});

afterEach(() => {
	if (!this.connection.destroyed) {
		this.connection.destroy();
	}
});


describe('Invalid IMEI behavior', () => {

	beforeEach(() => {
		this.invalidImeiBuffer = Buffer.from('123123123', 'hex');
	});

	test('Invalid IMEI should return 0x00', async () => {
		expect.assertions(1);

		const spy = this.connection.awaiter('data');
		this.connection.write(this.invalidImeiBuffer);

		await expect(spy).resolves.toBeCalledWith(Buffer.from([0x00]));
	});

	test('Invalid IMEI should close server socket and client will disconnect', async () => {
		expect.assertions(1);

		const spy = this.connection.awaiter('close');
		this.connection.write(this.invalidImeiBuffer);

		await expect(spy).resolves.toBeCalled();

	});

});

describe('Valid IMEI handshakes', () => {

	test.each([
		['000F313233343536373839303132333435'],
		['000f333532303934303837343234383439'],
	])('Passing valid IMEI 0x%s will respond with 0x01', async (imei) => {

		expect.assertions(1);
		const imeiBuffer = Buffer.from(imei, 'hex');

		const spy = this.connection.awaiter('data');
		this.connection.write(imeiBuffer);

		await expect(spy).resolves.toBeCalledWith(Buffer.from([0x01]));
	});

	test('Passing valid IMEI will not close the socket', async () => {
		expect.assertions(1);

		const spy = this.connection.awaiter('close', 1000);
		this.connection.write(Buffer.from('000F313233343536373839303132333435', 'hex'));

		await expect(spy).resolves.not.toBeCalled();
	});

});
