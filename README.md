# NgFhirSample

[![Build Status](https://travis-ci.com/ahdis/ng-fhir-sample.svg?branch=master)](https://travis-ci.com/ahdis/ng-fhir-sample)

angular web applications which uses fhir for:

- displaying Questionnaires (R4 with first SDC extension support)
- searching for patients and questionnaires

built with:

- using [ng-fhirjs](https://github.com/ahdis/ng-fhirjs) as a wrapper for accessing a fhir server with [fhir.js](https://github.com/FHIR/fhir.js)

- integerated [fhirpath.js](https://github.com/lhncbc/fhirpath.js/)
- using [angular material](https://material.angular.io/) for UI components

see [on github pages](https://ahdis.github.io/ng-fhir-sample)

Note:
Chrome on OSX has a CORS Problem and cannot exectute te $extract operation:

- Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request.
- Looks like this could happen: For those struggling with this in the future, the problem was that the URL was returning a 302-Redirect, and even though the new location was presenting CORS headers with 200-OK, the initial 302 response was not.

# development setup

if you are not using the devcontainer from this project with [VS Code Remote Development](https://code.visualstudio.com/docs/remote/containers) extension you need to have angular cli and [yarn](https://yarnpkg.com/en/) installed:

```
npm install -g @angular/cli
yarn install
```

## usage

Run `ng serve` to start the app, app will be at [http://localhost:4200](http://localhost:4200/).
If you use the Visual Code functionality with Remote containers: Open Folder in container option, you need to start it with `ng serve --host 0.0.0.0`.

if you use localhost and have cross site blocking issues within chrome start chrome directly from command line (osx)

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating

## running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## deploying to github pages

ng build --prod --base-href /ng-fhir-sample/
angular-cli-ghpages

note: communicatin via fhir servers is currently over http, therefore the https access has to be switched off in the github project

## Contributing

Have a look at [contributing](CONTRIBUTING.md).

## setup fhir-kit-client

```
yarn add fhir-kit-client
yarn add @types/fhir-kit-client --dev
cp ./index.d.ts ./node_modules/@types/fhir-kit-client/
yarn add debug
yarn add @types/debug --dev
```

see also https://github.com/visionmedia/debug/issues/305
enter in chrome console for debugging the following:
localStorage.debug = 'fhir-kit-client:\*';

localStorage.debug = 'fhir-kit-client:_,app:_';
