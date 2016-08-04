/// <reference path="../typings/index.d.ts" />

declare namespace Helper {

    export const SERVER : String;

    export function hide(element : any, duration? : number, keep? : boolean, callback? : () => void) : void;
    export function hideButtons() : void;
    export function show(element : any, duration? : number, callback? : () => void) : void;
    export function showMaterial(material : THREE.Material, duration? : number, easing? : () => void, delay? : number) : void;
    export function hideObject(object : THREE.Mesh, keep? : boolean, duration? : number);
    export function parseDate(date : string) : Date;
    export function capFirstLetter(string : string) : string;
    export function toMACRO_CASE(input : string) : string;
    export function getCode(pluginName : string) : string;
    export function getRepoDir(item : any) : string;
    export function applyTexture(source : string, object : THREE.Mesh, callback : (object : THREE.Mesh) => void) : void;
    export function drawText(text : string, x : number, y : number, context : CanvasRenderingContext2D, maxWidth : number, lineHeight : number) : number;
    export function searchElement(elementFullName : string) : number;
    export function getOutOfScreenPoint(z : number, view : string) : THREE.Vector3;
    export function isValidVector(vector : THREE.Vector2) : boolean;
    export function showBackButton() : void;
    export function hideBackButton() : void;
    export function getCenterView(view : string) : THREE.Vector3;
    export function fillTarget(x : number, y : number, z : number, view : string) : THREE.Vector3;
    export function getSpecificTile(_id : string) : any;
    export function getLastValueArray(array : Array<any>) : any;
    export function getCountObject(object : any) : number;
    export function getPositionYLayer(layer : number) : number;
    export function buildURL(base : string, params : Object) : string;
    export function clone<T>(obj : T) : T;
    export function getAPIUrl(route : string, params : Object) : string;
}

declare module 'Helper' {
    export = Helper;
}