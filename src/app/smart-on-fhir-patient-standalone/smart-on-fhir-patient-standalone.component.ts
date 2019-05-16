/// <reference path=".,/../../../fhir.r4/index.d.ts" />
import { Component, OnInit } from '@angular/core';
import {
  AuthConfig,
  NullValidationHandler,
  OAuthService,
} from 'angular-oauth2-oidc-codeflow';
import { FhirJsHttpService, FHIR_HTTP_CONFIG, FhirConfig } from 'ng-fhirjs';

@Component({
  selector: 'app-smart-on-fhir-patient-standalone',
  templateUrl: './smart-on-fhir-patient-standalone.component.html',
  styleUrls: ['./smart-on-fhir-patient-standalone.component.scss'],
})
export class SmartOnFhirPatientStandaloneComponent implements OnInit {
  public getSmartLaunchConfig(): AuthConfig {
    const simulatorPatientStandalone = 'eyJrIjoiMSJ9';
    const simulatorPatientStandaloneSkipAppAuthorization =
      'eyJrIjoiMSIsImoiOiIxIn0';
    const simulatorPatientStandaloneWithKnownPatient =
      'eyJrIjoiMSIsImoiOiIxIiwiYiI6IjU3Yjg1NjgyLWNlNDItNDE4Ny1hNTkzLTc4NjQyNDhhOTQ4NCJ9';
    const simulator = simulatorPatientStandaloneWithKnownPatient;

    let smartAuthConfig: AuthConfig = {
      // https://manfredsteyer.github.io/angular-oauth2-oidc/docs/
      //         additional-documentation/configure-library-for-implicit-flow-without-discovery-document.html
      // Url of the Identity Provider
      issuer: 'https://launch.smarthealthit.org/v/r2/sim/' + simulator + '/',

      // Login-Url
      loginUrl:
        'https://launch.smarthealthit.org/v/r2/sim/' +
        simulator +
        '/auth/authorize',

      // URL of the SPA to redirect the user to after login
      redirectUri: window.location.origin + '/smartonfhirpatientstandalone',

      // The SPA's id. The SPA is registered with this id at the auth-server
      clientId: 'a0d973e2-baed-4808-ab27-03df890a33ce',

      // set the scope for the permissions the client should request
      // The first three are defined by OIDC. The 4th is a usecase-specific one
      scope: 'patient/*.read observation/*.read launch',

      /**
       * Defines whether to use OpenId Connect during implicit flow.
       */
      oidc: true,

      /**
       * Defines whether to request a access token during
       * implicit flow.
       */
      requestAccessToken: true,

      /**
       * Url of the token endpoint as defined by OpenId Connect and OAuth 2.
       */
      tokenEndpoint:
        'https://launch.smarthealthit.org/v/r2/sim/' +
        simulator +
        '/auth/token',

      /**
       * Defines whether https is required.
       * The default value is remoteOnly which only allows
       * http for localhost, while every other domains need
       * to be used with https.
       */
      // requireHttps: 'remoteOnly',
      requireHttps: false,

      /**
       * This property allows you to override the method that is used to open the login url,
       * allowing a way for implementations to specify their own method of routing to new
       * urls.
       */
      // openUri: ,

      showDebugInformation: true,

      /**
       * Map with additional query parameter that are appended to
       * the request when initializing implicit flow.
       * OAuthService createLoginUrl need aud paramerer, is missing aud parameter but adds alos  if (this.customQueryParams) {
       */
      customQueryParams: {
        aud: 'https://launch.smarthealthit.org/v/r2/sim/' + simulator + '/fhir',
      },
    };
    return smartAuthConfig;
  }

  userProfile: object;
  selectedPatient: fhir.r4.Patient;

  constructor(
    public oauthService: OAuthService,
    private fhirHttpService: FhirJsHttpService
  ) {
    this.oauthService.configure(this.getSmartLaunchConfig());
    this.fhirHttpService.updateConfig({
      baseUrl: this.getSmartLaunchConfig().issuer + 'fhir',
      credentials: 'same-origin',
    });

    this.oauthService.events.subscribe(e => {
      // tslint:disable-next-line:no-console
      console.debug('oauth/oidc event', e);
    });
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.setStorage(sessionStorage);
  }

  ngOnInit() {
    this.completeLoginWithCode().then(_ => {
      this.getPatient();
    });
  }

  getPatient() {
    const readObj = { type: 'Patient', id: this.access_token_patient };
    this.fhirHttpService.read(readObj).then(response => {
      this.selectedPatient = response.data;
    });
  }

  login(): void {
    this.oauthService.initAuthorizationCodeFlow();
  }
  logout() {
    this.oauthService.logOut();
  }

  completeLoginWithCode(): Promise<void> {
    // check if already logged in with valid access token
    if (!this.oauthService.hasValidAccessToken()) {
      return this.oauthService.tryLogin();
    }

    // if already logged in
    return new Promise<void>(resolve => {
      resolve();
    });
  }

  loadUserProfile(): void {
    this.oauthService.loadUserProfile().then(up => (this.userProfile = up));
  }

  get givenName() {
    var claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims['given_name'];
  }

  get familyName() {
    var claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims['family_name'];
  }

  set requestAccessToken(value: boolean) {
    this.oauthService.requestAccessToken = value;
    localStorage.setItem('requestAccessToken', '' + value);
  }

  get requestAccessToken() {
    return this.oauthService.requestAccessToken;
  }

  get id_token() {
    return this.oauthService.getIdToken();
  }

  get access_token() {
    return this.oauthService.getAccessToken();
  }

  get id_token_expiration() {
    return this.oauthService.getIdTokenExpiration();
  }

  get access_token_expiration() {
    return this.oauthService.getAccessTokenExpiration();
  }

  get access_token_patient() {
    return this.oauthService.getAdditionalParameters()['patient'];
  }

  get access_token_as_jwt() {
    return this.oauthService.getAssetTokenAsJwtJson();
  }

  // aditional tokesn additionalParams[key]
}
