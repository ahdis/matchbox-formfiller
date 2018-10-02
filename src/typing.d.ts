declare module "*.json" {
    const value: any;
    export default value;
}

declare module "fhirpath" {
    function evaluate(resource: any, path: string): any;
} 