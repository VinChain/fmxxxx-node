const sampleIo = {
	data: {
		'11': Buffer.from('0000000214b777ed', 'hex'),
		'14': Buffer.from('0000000000ce39c8', 'hex'),
		'16': Buffer.from('01aa284a', 'hex'),
		'21': Buffer.from('04', 'hex'),
		'24': Buffer.from('0000', 'hex'),
		'66': Buffer.from('2fcd', 'hex'),
		'67': Buffer.from('0f89', 'hex'),
		'68': Buffer.from('0000', 'hex'),
		'69': Buffer.from('01', 'hex'),
		'80': Buffer.from('00', 'hex'),
		'182': Buffer.from('0006', 'hex'),
		'199': Buffer.from('00000000', 'hex'),
		'200': Buffer.from('00', 'hex'),
		'205': Buffer.from('c480', 'hex'),
		'206': Buffer.from('004b', 'hex'),
		'239': Buffer.from('00', 'hex'),
		'240': Buffer.from('00', 'hex'),
		'241': Buffer.from('00006466', 'hex'),
	},
	eventId: Buffer.from('0', 'hex'),
};

test('Decoding of odometer', () => {

	for (const prop of Object.getOwnPropertyNames(sampleIo.data)) {
		const buff = sampleIo.data[prop];
		switch (buff.byteLength) {
			case 4:
				console.log('DATA %s', prop);
				console.log(buff.readInt32BE(0) / 1000);
				console.log(buff.readInt32LE(0) / 1000);
				console.log(buff.readUInt32BE(0) / 1000);
				console.log(buff.readUInt32LE(0) / 1000);
		}


	}

});
