const assert = require('assert');
const models = require('../dist/backend/geomodels').models;
const Feature = require('../dist/backend/geomodels').Feature;
const FeatureCollection = require('../dist/backend/geomodels').FeatureCollection;
const GeoModel = require('../dist/backend/geomodels').GeoModel;
const GeoMultiModel = require('../dist/backend/geomodels').GeoMultiModel;
const GeoPoint = require('../dist/backend/geomodels').GeoPoint;
const GeoMultiPoint = require('../dist/backend/geomodels').GeoMultiPoint;
const GeoPolygon = require('../dist/backend/geomodels').GeoPolygon;
const GeoMultiPolygon = require('../dist/backend/geomodels').GeoMultiPolygon;

describe('Geomodels', () => {
    describe('#all', () => {
        it('must define a predecessor and a successor', async function() {
            models.forEach(model => {
                assert.ok(model.predecessor);
                assert.ok(model.successor);
            });
        });
    });

    describe('#Feature', () => {
        it('must convert to JSON correctly', async function() {
            const f = new Feature(new GeoPoint(10, 20), {some_prop: 'some value'});
            const j = {
                type: 'feature',
                geometry: {
                    type: 'Point',
                    coordinates: [10, 20]
                },
                properties: {
                    some_prop: 'some value'
                }
            };

            assert.deepEqual(f.toJSON(), j);
        });

        it('must use null values for absent properties and geometry', async function() {
            const f = new Feature();
            const j = {
                type: 'feature',
                geometry: null,
                properties: null
            };

            assert.deepEqual(f.toJSON(), j);
        });

        it('must convert from JSON correctly', async function() {
            const j1 = {
                type: 'feature',
                geometry: {
                    type: 'Point',
                    coordinates: [10, 20]
                },
                properties: {
                    some_prop: 'some value'
                }
            };

            const j2 = {
                type: 'feature',
                properties: {
                    some_prop: 'some value'
                }
            };

            const j2e = {
                type: 'feature',
                geometry: null,
                properties: {
                    some_prop: 'some value'
                }
            };

            const j3 = {
                type: 'feature'
            };

            const j3e = {
                type: 'feature',
                geometry: null,
                properties: null
            };

            const f1 = Feature.fromJSON(j1);
            const f2 = Feature.fromJSON(j2);
            const f3 = Feature.fromJSON(j3);

            assert.deepEqual(f1.toJSON(), j1);
            assert.deepEqual(f2.toJSON(), j2e);
            assert.deepEqual(f3.toJSON(), j3e);
        });
    });

    describe('#FeatureCollection', () => {
        it('must convert to JSON correctly', async function () {
            const f1 = new Feature(new GeoPoint(10, 20), {some_prop: 'some value1'});
            const f2 = new Feature(new GeoPoint(30, 40), {some_prop: 'some value2'});
            const fc = new FeatureCollection([f1, f2]);

            const j = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [10, 20]
                        },
                        properties: {
                            some_prop: 'some value1'
                        }
                    }, {
                        type: 'feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [30, 40]
                        },
                        properties: {
                            some_prop: 'some value2'
                        }
                    }]
            };

            assert.deepEqual(fc.toJSON(), j);
        });

        it('must convert from JSON correctly', async function () {
            const j = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [10, 20]
                        },
                        properties: {
                            some_prop: 'some value1'
                        }
                    }, {
                        type: 'feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [30, 40]
                        },
                        properties: {
                            some_prop: 'some value2'
                        }
                    }]
            };

            const fc = FeatureCollection.fromJSON(j);

            assert.deepEqual(fc.toJSON(), j);
        });
    });

    describe('#GeoModel', () => {
        it('must provide default values for basic methods', async function() {
            const geoModel = new GeoModel();

            assert.equal(geoModel.size, 1);
            assert.equal(geoModel.epsg, 0);
            assert.deepEqual(geoModel.toArray(), []);
        });

        it('must be able to turn any GeoModel into JSON and vice versa', async function() {
            const geoPoint = new GeoPoint(1, 2, 999);
            const geoMultiPoint = GeoMultiPoint.fromArray([[1, 2], [3, 4], [5, 6]], 999);
            const geoPolygon = GeoPolygon.fromArray([[[1, 2], [3, 4]], [[1, 2], [3, 4]]], 999);
            const geoMultiPolygon = GeoMultiPolygon.fromArray([[[[1, 2], [3, 4]], [[1, 2], [3, 4]]], [[[1, 2], [3, 4]], [[1, 2], [3, 4]]]], 999);

            assert.ok(geoPoint.equals(GeoModel.fromJSON(geoPoint.toJSON(), 999)));
            assert.ok(geoMultiPoint.equals(GeoModel.fromJSON(geoMultiPoint.toJSON(), 999)));
            assert.ok(geoPolygon.equals(GeoModel.fromJSON(geoPolygon.toJSON(), 999)));
            assert.ok(geoMultiPolygon.equals(GeoModel.fromJSON(geoMultiPolygon.toJSON(), 999)));
        });
    });

    describe('#GeoMultiModel', () => {
        it('must provide default values for basic methods', async function() {
            const geoMultiModel = new GeoMultiModel([new GeoModel(), new GeoModel()]);

            assert.equal(geoMultiModel.size, 2);  // 2 because the size of a GeoMultiModel is determined by its elements.
        });
    });

    describe('#GeoPoint', () => {
        it('must be possible to convert it to an array', async function() {
            const geoPoint = new GeoPoint(1, 2, 999);
            assert.deepEqual(geoPoint.toArray(), [1, 2]);
        });

        it('must be possible to load one from an array', async function() {
            const geoPoint = GeoPoint.fromArray([1, 2], 999);

            assert.deepEqual(geoPoint.toArray(), [1, 2]);
            assert.equal(geoPoint.epsg, 999);
        });

        it('must be possible to convert it to GeoJson', async function() {
            const geoPoint = GeoPoint.fromArray([1, 2], 999);
            const geoJSON = {
                type: "Point",
                coordinates: [1, 2]
            };

            assert.deepEqual(geoPoint.toJSON(), geoJSON);
        });

        it('can be promoted to any successor GeoModels', async function() {
            const geoPoint = GeoPoint.fromArray([1, 2], 999);
            const geoMultiPoint = geoPoint.promoteTo(GeoMultiPoint);
            const geoPolygon = geoPoint.promoteTo(GeoPolygon);
            const geoMultiPolygon = geoPoint.promoteTo(GeoMultiPolygon);

            assert.deepEqual(geoMultiPoint.toArray(), [[1, 2]]);
            assert.deepEqual(geoPolygon.toArray(), [[[1, 2]]]);
            assert.deepEqual(geoMultiPolygon.toArray(), [[[[1, 2]]]]);
        });
    });

    describe('#GeoMultiPoint', () => {
        it('must be possible to convert it to an array', async function () {
            const p1 = new GeoPoint(1, 2, 999);
            const p2 = new GeoPoint(3, 4, 999);
            const geoMultiPoint = new GeoMultiPoint([p1, p2]);

            assert.deepEqual(geoMultiPoint.toArray(), [[1, 2], [3, 4]]);
        });

        it('must be possible to load one from an array', async function() {
            const geoMultiPoint = GeoMultiPoint.fromArray([[1, 2], [3, 4]], 999);

            assert.deepEqual(geoMultiPoint.toArray(), [[1, 2], [3, 4]]);
        });

        it('must be possible to convert it to GeoJson', async function() {
            const p1 = new GeoPoint(1, 2, 999);
            const p2 = new GeoPoint(3, 4, 999);
            const geoMultiPoint = new GeoMultiPoint([p1, p2]);
            const geoJSON = {
                type: "MultiPoint",
                coordinates: [
                    [1, 2],
                    [3, 4]
                ]
            };

            assert.deepEqual(geoMultiPoint.toJSON(), geoJSON);
        });
    });

    describe('#GeoPolygon', () => {
        it('must be possible to convert it to an array', async function () {
            const p1 = new GeoPoint(1, 2, 999);
            const p2 = new GeoPoint(3, 4, 999);
            const p3 = new GeoPoint(5, 6, 999);
            const p4 = new GeoPoint(7, 8, 999);
            const mp1 = new GeoMultiPoint([p1, p2]);
            const mp2 = new GeoMultiPoint([p3, p4]);
            const geoPolygon = new GeoPolygon([mp1, mp2]);

            assert.deepEqual(geoPolygon.toArray(), [
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ]);
        });

        it('must be possible to load one from an array', async function() {
            const geoPolygon = GeoPolygon.fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ], 999);

            assert.deepEqual(geoPolygon.toArray(), [
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ]);
        });

        it('must return if two GeoPolygons are equal', async function() {
            const gp1 = GeoPolygon.fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ], 999);
            const gp2 = GeoPolygon.fromArray([ // This polygon equals gp1.
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ], 999);
            const gp3 = GeoPolygon.fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]]
            ], 9999); // The epsg differs.
            const gp4 = GeoPolygon.fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 9]] // This point differs.
            ], 999);

            assert.ok(gp1.equals(gp2));
            assert.ok(!gp1.equals(gp3));
            assert.ok(!gp1.equals(gp4));
        });

        it('must return if a GeoPolygon contains a GeoPoint', async function() {
            const gp1 = GeoPolygon.fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]],
                [[9, 10], [11, 12]]
            ], 999);

            const p1 = new GeoPoint(9, 10, 999);
            const p2 = new GeoPoint(9, 100, 999); // This one is not in gp1.
            const p3 = new GeoPoint(9, 10, 9999); // This one is not in gp1.

            assert.ok(gp1.contains(p1));
            assert.ok(!gp1.contains(p2));
            assert.ok(!gp1.contains(p3));
        });

        it('can be flattened to a lower GeoModel', async function() {
            const geoPolygon = GeoPolygon.fromArray([
                [[1, 2], [3, 4]]
            ], 999);
            const geoMultiPoint = GeoMultiPoint.fromArray([[1, 2], [3, 4]], 999);

            assert.ok(geoMultiPoint.equals(geoPolygon.flatten()));
        });
    });

    describe('#GeoMultiPolygon', () => {
        it('must allow mapping its sub-elements', async function() {
            const geoMultiPolygon = GeoMultiPolygon.fromArray([[[[1, 1]]]], 999);
            const newGeoMultiPolygon = geoMultiPolygon.mapSubElements(GeoPoint, geoPoint =>
                new GeoPoint(geoPoint.x + 1, geoPoint.y + 2, geoPoint.epsg));

            assert.ok(newGeoMultiPolygon.equals(GeoMultiPolygon.fromArray([[[[2, 3]]]], 999)));
        });
    });
});
