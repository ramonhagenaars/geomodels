// Type definitions for geomodels.js

export type AnyClass = { new (): any };

export declare abstract class GeoModel {
	constructor(epsg: number);
	size: number;
	epsg: number;
	toJSON(): JSON;
	static fromJSON(json: JSON, epsg?: number): GeoModel;
	toArray(): Array<number>;
	promoteTo(clazz: AnyClass): GeoModel;
	contains(that: GeoModel): number;
	equals(that: GeoModel): boolean;
}

export declare abstract class GeoMultiModel extends GeoModel {
	constructor (elements: Array<GeoMultiModel>);
	elements: Array<GeoModel>;
	length: number;
	size: number;
	toArray(): Array<number>;
	static fromArray(array: Array<Array<any>>, epsg?: number): GeoMultiModel;
	mapElements(mapperFunction: Function): GeoMultiModel;
	mapSubElements(clazz: AnyClass, mapperFunction: Function): GeoMultiModel;
	flatten(): GeoModel;
}

export declare class GeoPoint extends GeoModel {
	constructor (x: number, y: number, epsg: number);
	toArray(): Array<number>;
	static fromArray(pointArray : Array<number>, epsg? : number): GeoPoint;
	static predecessor: AnyClass;
	static successor: AnyClass;
}

export declare class GeoMultiPoint extends GeoMultiModel {
	static predecessor: AnyClass;
	static successor: AnyClass;
}

export declare class GeoPolygon extends GeoMultiModel {
	static predecessor: AnyClass;
	static successor: AnyClass;
}

export declare class GeoMultiPolygon extends GeoMultiModel {
	static predecessor: AnyClass;
	static successor: AnyClass;
}

export declare const models: Array<AnyClass>;
