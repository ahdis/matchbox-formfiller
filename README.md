# NgFhirSample

# ng-fhirjs

ng-fhirjs is an angular module for [fhir.js](https://badge.fury.io/js/fhir.js). It uses HttpClient from @angular/common/http as a http adapter and provides a typescript interface to the fhir.js interface. The fhir-js-http service can be dynamically injected into your components. A testsuite has been added to verify the interface, however the interface covers not yet the complete functionality of the fhir.js implementation. Pull requests appreciated!

## usage
see app how to use the service

## running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## packag the library for using it independently
The service is packaged into library with the help [ng-packagr](https://github.com/dherges/ng-packagr), see the following [article(https://medium.com/@nikolasleblanc/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e) for help.

```
npm run packagr
cd dist
npm pack
```
new project:
```
npm install ../ng-fhir-sample/dist/ng-fhir-sample-0.0.0.tgz
```

instead of using `import { FhirJsHttpService, FHIR_HTTP_CONFIG }  './modules/ng-fhirjs/fhir-js-http.service'` 
use now `import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhir-sample';`


## development

### linking to local npm modules
if a fork of fhir.js is used you can link to the fork version in the folling way.

```
cd /somepath/fhir.js
npm link
    /usr/local/lib/node_modules/fhir.js -> /somepath/fhir.js
cd /someotherpath/ng-fhirjs
npm link fhir.js
   /someotherpath/node_modules/fhir.js -> /usr/local/lib/node_modules/fhir.js -> /somepaht/fhir.js
```

## building

first time: 
npm install


```
npm run-script build
npm run packagr
```

