/* Copyright (c) 2018 Ramon Hagenaars
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE. */

/**
 * Base class for all geometry classes.
 */
class GeoModel {

    /**
     * Generic constructor for all GeoModel subclasses.
     * @param {int} epsg (optional) the well-known id of this GeoPoint.
     */
    constructor(epsg = 0) {
        this._epsg = epsg;
    }

    /**
     * The size of a model, which is the number of single atomic elements.
     * @return {number} the size of this Model.
     */
    get size() {
        return 1;
    }

    /**
     * An identifier that represents the spatial reference of this GeoModel. For example, 'World Geodetic System 1984'
     * (i.e. WGS 84 also informally referred to as 'latlon') would be 4326.
     * @return {int} the identifier of the spatial reference of this GeoModel or 0 if unset.
     */
    get epsg() {
        return this._epsg;
    }

    /**
     * Returns this instance in JSON format according to the GeoJSON format.
     *
     * For more info, see:
     * https://tools.ietf.org/html/rfc7946
     *
     * @returns {string} this GeoMultiPoint in JSON format.
     */
    toJSON() {
        // All GeoModel classes must be suffixed with the corresponding GeoJSON type.
        const geoJsonType = this.constructor.name.split('Geo')[1];

        return {
            type: geoJsonType,
            coordinates: this.toArray()
        };
    }

    /**
     * Creates a GeoModel instance from the given GeoJson geometry object. The given argument must be a json object, not
     * a string.
     * @param {json} json the geometry part of a GeoJson object.
     * @param {int} epsg (optional) the spatial reference identifier of this GeoModel.
     * @return {GeoModel} an GeoModel instance of the type that corresponds to the given GeoJson object.
     */
    static fromJSON(json, epsg=0) {
        if (!json.type || !json.coordinates) {
            throw new TypeError(`The given JSON object is no GeoJson: \n${JSON.stringify(json)}`);
        }

        const geoModels = models
            .filter(Model => Model.name == 'Geo' + json.type)
            .map(Model => Model.fromArray(json.coordinates, epsg));

        if (geoModels.length == 0) {
            throw new TypeError(`The given type is not supported: ${json.type}`);
        }

        return geoModels[0];
    }

    /**
     * Returns this instance as an array.
     * @return {[]} this instance in array form.
     */
    toArray() {
        return [];
    }

    /**
     * 'Promotes' this instance to a GeoModel of the given class type.
     * @param {class<GeoModel>} clazz a class of a GeoModel that is to be returned.
     * @return {GeoModel} a new instance of type clazz.
     */
    promoteTo(clazz) {
        let promotedObj = this;
        while (promotedObj.constructor.name !== clazz.name) {
            promotedObj = promotedObj.constructor.successor.fromArray([promotedObj.toArray()], promotedObj.epsg);
        }

        return promotedObj;
    }

    /**
     * Returns whether this instance has an attribute that is or that contains the given geoModel.
     * @param {GeoModel} that a GeoModel instance that is searched for.
     */
    contains(that) {
        return _contains(this, that);
    }

    /**
     * Returns whether this and that are considered equal.
     * @param {GeoModel} that the other object that is checked with for equality.
     * @return {boolean} equality between this and that.
     */
    equals(that) {
        return _isEqual(this, that);
    }
}

/**
 * Base class of geometry classes that consist of GeoModels.
 */
class GeoMultiModel extends GeoModel {

    /**
     * Generic constructor for all GeoMultiModel subclasses.
     * @param {[GeoModel]} elements the elements of which this instance consists.
     */
    constructor(elements) {
        super(elements[0].epsg);

        this._elements = elements;
    }

    /**
     * The elements of which this instance consists.
     * @return {[GeoModel]} the elements of which this instance consists.
     */
    get elements() {
        return this._elements;
    }

    /**
     * The number of elements of which this GeoMultiModel instance consists.
     * @return {Number} the number of elements.
     */
    get length() {
        return this.elements.length;
    }

    /**
     * The size of a model, which is the number of single atomic elements.
     * @return {number} the size of this Model.
     */
    get size() {
        return this.elements.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0);
    }

    /**
     * Returns an array of the GeoModels of which this instance consists. Possibly, a multidimensional is returned if
     * the elements of this instance are GeoMultiModels.
     * @return {Array} the GeoModels (as arrays) of which this instance consists.
     */
    toArray() {
        return this.elements.map(geoModel => geoModel.toArray());
    }

    /**
     * Creates a new GeoMultiModel instance from the given array.
     *
     * Example usage:
     *
     *  const newGeoMultiPoint = GeoMultiPoint.fromArray([[1, 2], [3, 4], [5, 6], 4326]);
     *
     * @param {Array} array an array of arrays.
     * @param {int} epsg (optional) the spatial reference identifier of this GeoModel.
     * @return {GeoMultiModel} a new GeoMultiModel instance.
     */
    static fromArray(array, epsg=0) {
        const clazz = _getClass(this);
        const elements = array.map(subArray => clazz.predecessor.fromArray(subArray, epsg));

        return new clazz(elements);
    }

    /**
     * Maps the GeoModels of which this GeoMultiModels consists and creates a new instance with the mapped elements.
     *
     * Example usage:
     *
     *   const newGeoMultiPoint = geoMultiPoint
     *      .mapElements(geoPoint => new GeoPoint(geoPoint.x + 1, geoPoint.y + 1, geoPoint.epsg));
     *
     * @param {Function} mapperFunction a mapper function that accepts an instance of the corresponding GeoModel.
     * @return {GeoMultiModel} a new GeoMultiModel instance of the same type as this instance.
     */
    mapElements(mapperFunction) {
        return new this.constructor(this.elements.map(mapperFunction));
    }

    /**
     * Maps the GeoModels that are nested within this GeoMultiModel instance. The given class determines the type of
     * instances that are passed to the given mapperFunction.
     *
     * Example usage:
     *
     *   const newGeoMultiPolygon = geoMultiPolygon
     *      .mapSubElements(GeoPoint, geoPoint => new GeoPoint(geoPoint.x + 1, geoPoint.y + 1, geoPoint.epsg));
     *
     * @param {class<GeoModel>} clazz the class of the GeoModel that is to be mapped.
     * @param {Function} mapperFunction a mapper function that accepts an instance of the corresponding GeoModel.
     * @return {GeoMultiModel} a new GeoMultiModel instance of the same type as this instance.
     */
    mapSubElements(clazz, mapperFunction) {
        const recursiveMapperFunction = element => element.mapSubElements(clazz, mapperFunction);
        const currentMapperFunction = clazz == this.constructor.predecessor ? mapperFunction : recursiveMapperFunction;

        return this.mapElements(currentMapperFunction);
    }

    /**
     * Returns the first element of this GeoMultiModel instance as a new instance.
     * @return {GeoModel} a new GeoModel instance.
     */
    flatten() {
        return this.constructor.predecessor.fromArray(this.elements[0].toArray(), this.epsg);
    }
}

/**
 * This class represents a Point.
 */
class GeoPoint extends GeoModel {

    /**
     * Constructor.
     * @param {int} x the first coordinate of this GeoPoint (e.g. latitude).
     * @param {int} y the second coordinate of this GeoPoint (e.g. longitude).
     * @param {int} epsg (optional) the well-known id of this GeoPoint.
     */
    constructor(x, y, epsg=0) {
        super(epsg);

        this.x = x;
        this.y = y;
    }

    /**
     * Overrides GeoModel.toArray().
     * @return {[float]} an array where index 0 holds x and index 1 holds y.
     */
    toArray() {
        return [this.x, this.y];
    }

    /**
     * Returns a new GeoPoint from the given array of floats.
     *
     * Example usage:
     *
     *  const geoPoint = GeoPoint.fromArray([1, 2], 4326);
     *
     * @param {[float]} pointArray the coordinates where index 0 holds x and index 1 holds y.
     * @param epsg (optional) the spatial reference identifier of this GeoModel.
     * @return {GeoPoint} a new instance of GeoPoint.
     */
    static fromArray(pointArray, epsg=0) {
        return new GeoPoint(pointArray[0], pointArray[1], epsg);
    }

    /**
     * Returns the GeoModel class which instances are contained by instances of this class.
     * @return {class<GeoPoint>} a class.
     */
    static get predecessor() {
        return GeoPoint;
    }

    /**
     * Return the GeoMultiModel class of which the instances may contain instances of this class.
     * @return {class<GeoMultiPoint>} a class.
     */
    static get successor() {
        return GeoMultiPoint;
    }
}

class GeoMultiPoint extends GeoMultiModel {

    /**
     * * Returns the GeoModel class which instances are contained by instances of this class.
     * @return {class<GeoPoint>} a class.
     */
    static get predecessor() {
        return GeoPoint;
    }

    /**
     * Return the GeoMultiModel class of which the instances may contain instances of this class.
     * @return {class<GeoPolygon>} a class.
     */
    static get successor() {
        return GeoPolygon;
    }
}

class GeoPolygon extends GeoMultiModel {

    /**
     * * Returns the GeoModel class which instances are contained by instances of this class.
     * @return {class<GeoMultiPoint>} a class.
     */
    static get predecessor() {
        return GeoMultiPoint;
    }

    /**
     * Return the GeoMultiModel class of which the instances may contain instances of this class.
     * @return {class<GeoMultiPolygon>} a class.
     */
    static get successor() {
        return GeoMultiPolygon;
    }
}

class GeoMultiPolygon extends GeoMultiModel {

    /**
     * * Returns the GeoModel class which instances are contained by instances of this class.
     * @return {class<GeoPolygon>} a class.
     */
    static get predecessor() {
        return GeoPolygon;
    }

    /**
     * Return the GeoMultiModel class of which the instances may contain instances of this class.
     * @return {class<GeoMultiPolygon>} a class.
     */
    static get successor() {
        return GeoMultiPolygon;
    }
}

/**
 * An array that contains all GeoModels that are defined in this module.
 * @type {[GeoModel]}
 */
const models = [GeoPoint, GeoMultiPoint, GeoPolygon, GeoMultiPolygon];

function _isIterable(obj) {
    return obj && typeof obj[Symbol.iterator] === 'function';
}

function _isEqual(obj1, obj2) {
    function isIterableEqual(arr1, arr2) {
        let allValuesAreEqual = _isIterable(arr1) && _isIterable(arr2) && arr1.length === arr2.length;
        for (let i = 0; i < arr1.length && allValuesAreEqual; i++) {
            const valueArr1 = arr1[i];
            const valueArr2 = arr2[i];

            allValuesAreEqual = _isEqual(valueArr1, valueArr2);

            if (!allValuesAreEqual) {
                allValuesAreEqual = isIterableEqual(valueArr1, valueArr2);
            }
        }

        return allValuesAreEqual;
    }

    if (obj1 !== Object(obj1)) {
        return obj1 === obj2; // obj1 is a primitive.
    }

    // First, check if they are identical.
    if (obj1 === obj2) {
        return true;
    }

    const typesAreEqual = typeof obj1 === typeof obj2;
    const namesAreEqual = obj1.constructor && obj2.constructor && obj1.constructor.name === obj2.constructor.name;

    // Then, check if obj1 and obj2 are of the same type.
    if (!typesAreEqual || !namesAreEqual) {
        return false;
    }

    // Then, check if obj1 and obj2 are iterables and if each element is equal.
    if (isIterableEqual(obj1, obj2)) {
        return true;
    }

    const obj1AttributeValues = Object.keys(obj1).map(key => obj1[key]);
    const obj2AttributeValues = Object.keys(obj2).map(key => obj2[key]);

    // Finally, check if obj1 and obj2 have attributes that are equal.
    return isIterableEqual(obj1AttributeValues, obj2AttributeValues);
}

function _contains(obj1, obj2) {
    function filterInArrayDeep(arr, obj) {
        if (!_isIterable(arr)) {
            return [];
        }

        return arr.filter((item) => _isEqual(item, obj) || _contains(item, obj));
    }

    const attributeValues = Object.keys(obj1).map(attribute => obj1[attribute]);

    return filterInArrayDeep(attributeValues, obj2).length;
}

function _getClass(object) {
    const className = object.toString().split('(' || /s+/)[0].split(' ' || /s+/)[1];
    const clazz = eval(className);
    return clazz;
}

module.exports = {
    GeoPoint,
    GeoMultiPoint,
    GeoPolygon,
    GeoMultiPolygon,
    GeoModel,
    GeoMultiModel,
    models
};
