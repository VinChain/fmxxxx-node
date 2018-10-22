import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as net from 'net';
import {createServer} from '../../_tmp/tcp-server';

function eventWatch(
	emitter: EventEmitter,
	event: string,
	timeout: number = 1000,
	callback?): Promise<any> {

	const ret = jest.fn(callback);
	return new Promise((resolve) => {
		const t = setTimeout(() => resolve(ret), timeout);
		emitter.on(event, (...args) => {
			clearTimeout(t);
			ret(...args);
			resolve(ret);
		});
	});

}

const testHost = '127.0.0.1';
const testPort = 30999;

beforeAll(() => {
	this.server = createServer().listen(testPort, testHost);
});

afterAll((done) => {
	this.server.close(done);
});

beforeEach((done) => {
	this.connection = net.createConnection(testPort, testHost);

	// perform handshake
	this.connection.once('data', () => {
		done();
	});
	this.connection.write(Buffer.from('000F313233343536373839303132333435', 'hex'));
});

afterEach(() => {
	if (!this.connection.destroyed) {
		this.connection.destroy();
	}
});

describe('Test using dumps', () => {

	const snapshotsDir = __dirname + '/../__snapshots__';
	const dumps = fs.readdirSync(snapshotsDir)
		.filter((i) => /\.bin$/.test(i))
		.map((i) => ([i, fs.readFileSync(snapshotsDir + '/' + i)]));


	test.each(dumps)
	('Passed TCP/IP dump %s will not close socket and responses with correct packets data', async (i, dump) => {

		const dataSpy = eventWatch(this.connection, 'data');
		const closeSpy = eventWatch(this.connection, 'close');
		this.connection.write(dump);

		await expect(closeSpy).resolves.not.toBeCalled();
		await expect(dataSpy).resolves.toBeCalled();
		// await expect(dataSpy).resolves.toBeCalledWith(Buffer.from('00000001', 'hex'));

	});


});




