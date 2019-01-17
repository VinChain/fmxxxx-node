
export interface Id {
	provider: string;
	[name: string]: any;
}

export interface FmxxxxId extends Id {
	provider: 'fmxxxx';
	imei: string;
}
