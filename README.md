# matchbox-formfiller

[![Build Status](https://travis-ci.com/ahdis/matchbox-formfiller.svg?branch=master)](https://travis-ci.com/ahdis/matchbox-formfiller)

see deployed [version on github pages](https://ahdis.github.io/matchbox-formfiller/#/)

angular web applications which uses fhir for:

- displaying Questionnaires (R4 with first SDC extension support)
- searching for patients and questionnaires

built with:

- using [ng-fhirjs](https://github.com/ahdis/ng-fhirjs) as a wrapper for accessing a fhir server with [fhir.js](https://github.com/FHIR/fhir.js)
- integerated [fhirpath.js](https://github.com/lhncbc/fhirpath.js/)
- using [angular material](https://material.angular.io/) for UI components

see [on github pages](https://ahdis.github.io/matchbox-formfiller)

Note:
Chrome on OSX has a CORS Problem and cannot exectute te $extract operation, this happens only to a http url, but not to a https url

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

ng add angular-cli-ghpages

ng build --prod --base-href /matchbox-formfiller/
ng deploy --base-href=/matchbox-formfiller/

note: communicatin via fhir servers is currently over http, therefore the https access has to be switched off in the github project

## docker container

The formfiller is also available as docker container "matchbox-formfiller". You can expose the internal port 80 as any port you like.

## building and deploying the docker container

ng build --prod
docker build -t matchbox-formfiller .
docker tag matchbox-formfiller eu.gcr.io/fhir-ch/matchbox-formfiller:v5
docker push eu.gcr.io/fhir-ch/matchbox-formfiller:v5

## running with backends

Run "docker-compose up" in the "backend" folder to run a local version including the matchbox-order backend and database.
App will be at [http://localhost:4300](http://localhost:4300/).

## PoC

[development project board](https://github.com/ahdis/matchbox-formfiller/projects/1)

## Contributing

Have a look at [contributing](CONTRIBUTING.md).

## setup fhir-kit-client

```
yarn add fhir-kit-client
yarn add @types/fhir-kit-client --dev
yarn add debug
yarn add @types/debug --dev

```

see also https://github.com/visionmedia/debug/issues/305
enter in chrome console for debugging the following:
localStorage.debug = 'fhir-kit-client:\*';

localStorage.debug = 'fhir-kit-client:_,app:_';

## travis ci setup

https://www.travis-ci.com/github/ahdis/matchbox-formfiller

### rad order poc
