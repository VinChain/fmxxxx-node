import * as debug from 'debug';
import * as app from '../src';
import {createFromEnv} from './docker-config';

const logger = debug('app');
const config = createFromEnv();
logger('Config: %o', config);

// run healthcheck
logger('Initializing health server');
const healthcheck = app.createHealthServer();
healthcheck.listen(16501);


// run online service
logger('Initializing online devices tracking');
const onliner = app.online(60);

// run fmxxxx server
logger('Initializing FMxxxx server');
const fmxxxx = app.fmxxxx.createServer();
