// Type definitions fhir.js 
// Project: https://github.com/FHIR/fhir.js
// Definitions by: oliver egger, https://github.com/oliveregger


/** resource interface */
interface IResource {
    resourceType: string;
    id?: string;
    meta?: any;
    text?: any;
    [others: string]: any;
}

interface Auth { bearer?: string; user?: string; pass?: string }
interface Config { baseUrl: string; auth?: Auth; credentials: string; headers?: Map<string, any> }
// method could be refined to (GET|POST|PUT|DELETE)
interface Minimal { debug?: boolean }
interface RequestObj extends Minimal { method: "DELETE" | "GET" | "HEAD" | "JSONP" | "OPTIONS"; url: string, headers?: any, data?: any }
interface ResponseObj { status: number; headers?: Map<string, string[]>; config: any; data: IResource }

/** set the debug property property to true to get console logging activated */

/** FHIR Resource Type */
interface ResourceType extends Minimal { "type": string }
interface ReferenceObj extends Minimal { "reference": string }
interface BundleObj extends Minimal { bundle: any } 
interface ReadObj extends ResourceType { id: string }
interface QueryObj extends ResourceType { query: any }
interface VReadObj extends ReadObj { versionId: string }
interface Adapter extends Minimal { http: (args: any) => Promise<any>, defer?: any }

/** Create Objects */
interface Tag { term: string; schema: string; label: string }
interface Entry extends Minimal { resource: IResource; category?: Tag[] } 

declare function http(requestObj: RequestObj): Promise<ResponseObj>;

// to declard headerFn function to get header, i.e. headerFn('Content')
declare function succes(data: any, status: any, headerFn: any, config: Config): void;
declare function error(data: any, status: any, headerFn: any, config: Config): void;

/** Interface defintion to fhir.js */

interface IFhir {

    /** Get a capability statement for the system */
    conformance(empty: Minimal): Promise<ResponseObj>;

    /** Create a new resource with a server assigned id */
    create(entry: Entry): Promise<ResponseObj>;

    /** Read the current state of the resource */
    read(resource: ReadObj): Promise<ResponseObj>;

    /** Retrieve the change history for all resources */
    history(empty: Minimal): Promise<ResponseObj>;

    /** Retrieve the change history for a particular resource type */
    typeHistory(query: ResourceType): Promise<ResponseObj>;

    /** Retrieve the change history for a particular resource */
    resourceHistory(query: ReadObj): Promise<ResponseObj>;

    /** Read the state of a specific version of the resource */
    vread(query: VReadObj): Promise<ResponseObj>;

    /** Update an existing resource by its id (or create it if it is new) */
    update(entry: Entry): Promise<ResponseObj>;

    /** Delete a resource */
    delete(query: Entry): Promise<ResponseObj>;

    /** The transaction interactions submit a set of actions to perform on a server in a single HTTP request/response. */
    transaction(bundle: Entry): Promise<ResponseObj>;

    /** searches a set of resources based on some filter criteria */
    search(query: QueryObj): Promise<ResponseObj>;

    /** returns the next results in a series of pages */
    nextPage(query: BundleObj): Promise<ResponseObj>;

    /** returns the previous results in a series of pages */
    prevPage(query: BundleObj): Promise<ResponseObj>;


    /** These functions below are not yet typescripted because the exact funticionality is not clear */

    /** Validate a resource, but see see issue here first: https://github.com/FHIR/fhir.js/issues/93 */
    validate(query: any): any;

    /** POST on /Document ? */
    document(query: any): any;

    /** GET on /Profile/:type ? */
    profile(query: any): any;

    /** resolves a referenced resources, don't now how ho pass in the defer() function */
    resolve(ref: ReferenceObj): Promise<ResponseObj>;

}

declare function fhir(x: Config, a: Adapter) : IFhir;
