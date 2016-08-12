declare namespace CLI {
    
    export function query(list : Array<any>|any, condition: (any) => boolean): Array<any>;
    export function shutDown() : void;
    export function forceElementClick(id : string) : void;
    export function goToQuality(qa : string) : void;
}

declare module 'CLI' {
    export = CLI;
}