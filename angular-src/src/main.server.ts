import {enableProdMode} from '@angular/core';

import {environment} from './environments/environment';

if (environment.production || environment.qualityAssurance) {
  enableProdMode();
}

export { AppServerModule } from './app/app.server.module';
export { ngExpressEngine } from "@nguniversal/express-engine";


export { renderModule, renderModuleFactory } from '@angular/platform-server';
