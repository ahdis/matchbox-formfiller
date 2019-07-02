declare module 'fhirpath' {
  export function evaluate(resource: any, path: string): any;
}
