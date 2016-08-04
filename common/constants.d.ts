declare namespace Constants {
    export const configAPIUrl : Object;
    export const test_map : Object;
    export const testFlow : Array<Object>;
    export const testNetworkNodes : Array<Object>;
    export const testNetworkClients : Object;
    export const testNetworkServices : Object;

    export const layers : Object;

    export const platforms : Object;

    export const superLayers : Object;

    export const API_ENV : string;
    export const CLIENT_ID : string;
}

declare module 'Constants' {
    export = Constants;
}