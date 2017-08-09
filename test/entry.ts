import { use } from 'chai';
import * as sinonChai from 'sinon-chai';

use(sinonChai);

declare const require: any;
const testsContext: any = require.context('./', true, /\.spec\.ts/);
testsContext.keys().forEach(testsContext);
