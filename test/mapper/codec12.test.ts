import {map} from '../../src/fmxxxx/mapper/codec12';

test('Decoding of codec12 obdinfo command', () => {

	const response = 'Prot:0,VIN:N/A,TM:80,CNT:0,ST:IDLE,P1:0x0,P2:0x0,P3:0x0,P4:0x0,MIL:0,DTC:0,ID1,Hdr:0,Phy:0';

	const result = map('test', response);

	console.log(result);

});

test('Decoding fault codes command', () => {


});
