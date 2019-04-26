# NgFhirSample

[![Build Status](https://travis-ci.com/ahdis/ng-fhir-sample.svg?branch=master)](https://travis-ci.com/ahdis/ng-fhir-sample)

angular web applications which uses fhir for:

- displaying Questionnaires (R4 with first SDC extension support)
- searching for patients and questionnaires

built with:

- using [ng-fhirjs](https://github.com/ahdis/ng-fhirjs) as a wrapper for accessing a fhir server with [fhir.js](https://github.com/FHIR/fhir.js)
- integerated [fhirpath.js](https://github.com/lhncbc/fhirpath.js/)
- using [angular material](https://material.angular.io/) for UI components

see [on github pages](http://github.ahdis.ch/ng-fhir-sample)

# development setup

you need to have angular cli installed:

```
npm install -g @angular/cli
```

## usage

Run `ng serve` to start the app, app will be at [http://localhost:4200](http://localhost:4200/)

if you use localhost and have cross site blocking issues within chrome start chrome directly from command line (osx)

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating

## running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## deploying to github pages

ng build --prod --base-href "http://github.ahdis.ch/ng-fhir-sample"
angular-cli-ghpages

note: communicatin via fhir servers is currently over http, therefore the https access has to be switched off in the github project
