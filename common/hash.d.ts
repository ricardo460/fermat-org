declare namespace Hash {
    export function on(regex: string, actions: Object);
}

declare module 'Hash' {
    export = Hash;
}