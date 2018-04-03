const assert = require('assert');
const models = require('../dist/backend/geomodels').models;
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

    describe('#GeoModel', () => {
        it('must provide default values for basic methods', async function() {
            const geoModel = new GeoModel();

            assert.equal(geoModel.size, 1);
            assert.equal(geoModel.epsg, 0);
            assert.deepEqual(geoModel.toArray(), []);
        });
    });

    describe('#GeoMultiModel', () => {
        it('must provide default values for basic methods', async function() {
            const geoMultiModel = new GeoMultiModel([]);

            assert.equal(geoMultiModel.size, 0);  // 0 because the size of a GeoMultiModel is determined by its elements.
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
