# matchbox-ng angular frontend to matchbox

see latest [test release](https://test.ahdis.ch/matchbox/#/)

angular web applications which uses fhir for:

- displaying Questionnaires (R4 with first SDC extension support)
- Validation of FHIR resources

built with:

- using [fhir-kit-client](https://github.com/Vermonster/fhir-kit-client) for accessing a fhir server
- integrated [fhirpath.js](https://github.com/lhncbc/fhirpath.js/)
- using [angular material](https://material.angular.io/) for UI components

see [on github pages](https://ahdis.github.io/matchbox-formfiller)

Note:
Chrome on OSX has a CORS Problem and cannot execute te $extract operation, this happens only to a http url, but not to a https url

- Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request.
- Looks like this could happen: For those struggling with this in the future, the problem was that the URL was returning a 302-Redirect, and even though the new location was presenting CORS headers with 200-OK, the initial 302 response was not.

# development setup

if you are not using the devcontainer from this project with [VS Code Remote Development](https://code.visualstudio.com/docs/remote/containers) extension you need to have angular cli and [yarn](https://yarnpkg.com/en/) installed:

```
npm install -g @angular/cli
npm install
ng build --configuration development
```

and then

ng serve --configuration development

## usage

Run `ng serve --configuration development` to start the app, app will be at [http://localhost:4200](http://localhost:4200/).
If you use the Visual Code functionality with Remote containers: Open Folder in container option, you need to start it with `ng serve --host 0.0.0.0`.

if you use localhost and have cross site blocking issues within chrome start chrome directly from command line (osx)

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-features=CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating

## running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## deploying to github pages

ng add angular-cli-ghpages

ng build --configuration production --base-href /matchbox/
ng deploy --base-href=/matchbox/

note: communication via fhir servers is currently over http, therefore the https access has to be switched off in the github project

## docker container

The formfiller is also available as docker container "matchbox-formfiller". You can expose the internal port 80 as any port you like.

## building and deploying the docker container

ng build --configuration production
docker build -t matchbox-formfiller .
docker tag matchbox-formfiller eu.gcr.io/fhir-ch/matchbox-formfiller:v172
docker push eu.gcr.io/fhir-ch/matchbox-formfiller:v172

## running with docker

docker run -d -t -i -p 4300:80 -e DOMAIN='localhost' -e MAG='https://test.ahdis.ch/mag-pmp' -e MATCHBOX='http://host.docker.internal:8080/matchbox' matchbox-formfiller

## frontend for matchbox

this angular app is directly provided with matchbox

```
ng build --configuration production --base-href /matchbox/
rm -rf ../matchbox/src/main/resources/static/*
cp -r dist/* ../matchbox/src/main/resources/static
```

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

sucessfull builds will be deployed on [github pages](https://ahdis.github.io/matchbox-formfiller/#/)

### rad order poc
