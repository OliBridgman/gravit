(function (_) {

    /**
     * A path shape
     * @class GXPath
     * @extends GXPathBase
     * @constructor
     */
    function GXPath(closed, evenOdd, anchorPoints) {
        GXPathBase.call(this, closed, evenOdd, anchorPoints);
        this._setDefaultProperties(GXPath.GeometryProperties);
    }

    GXNode.inherit("path", GXPath, GXPathBase);

    /**
     * The geometry properties of a path with their default values
     */
    GXPath.GeometryProperties = {
        /** Closed or not */
        closed: false
    };

    /**
     * Return the anchor points of the path
     * @returns {GXPathBase.AnchorPoints}
     */
    GXPath.prototype.getAnchorPoints = function () {
        return this._getAnchorPoints();
    };

    /** @override */
    GXPath.prototype.store = function (blob) {
        if (GXPathBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPath.GeometryProperties);

            // Store our anchor points
            blob.pts = this.getAnchorPoints().serialize();
            return true;
        }
        return false;
    };

    /** @override */
    GXPath.prototype.restore = function (blob) {
        if (GXPathBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPath.GeometryProperties);

            // Restore our anchor points
            if (blob.hasOwnProperty('pts')) {
                this.getAnchorPoints().deserialize(blob.pts);
            }
            return true;
        }
        return false;
    };

    /** @override */
    GXPath.prototype.clone = function () {
        var clone = GXPathBase.prototype.clone.call(this);

        // Transfer selected anchor points as flags are not cloned
        var selectedAnchorPoints = this.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            var anchorPointIndex = this.getAnchorPoints().getIndexOfChild(selectedAnchorPoints[i]);
            var cloneAnchorPoint = clone.getAnchorPoints().getChildByIndex(anchorPointIndex);
            if (cloneAnchorPoint) {
                cloneAnchorPoint.setFlag(GXNode.Flag.Selected);
            }
        }

        return clone;
    };

    /**
     * Hit-tests the path for the location. Corner styles are not applied.
     * @param {GPoint} location
     * @param {GTransform} transform - a transformation to be applied to the path before hit-testing in addition to
     * path internal transformation, if any
     * @param {Boolean} area - indicates if path inside should be tested
     * @param {Boolean} [tolerance] optional hit test tolerance, defaults to zero
     * @returns {GXElement.HitResult} if hit, or null otherwise; hit result contains all data
     * in the path native anchor points coordinates
     */
    GXPath.prototype.pathHitTest = function (location, transform, area, tolerance) {
        tolerance = tolerance || 0;
        var locationInvTransformed = location;
        var scaleFactor = 1;

        if (transform) {
            var invTransform = transform.inverted();
            locationInvTransformed = invTransform.mapPoint(location);
            scaleFactor = scaleFactor * invTransform.getScaleFactor();
        }

        var origTransform = null;
        if (this.$trf) {
            origTransform = this.$trf;
            this.$trf = null;
            var invTransform = origTransform.inverted();
            locationInvTransformed = invTransform.mapPoint(locationInvTransformed);
            scaleFactor = scaleFactor * invTransform.getScaleFactor();
        }

        // Generate unstyled vertices
        // TODO : Cache this???
        var vertices = new GXVertexContainer();
        this._getAnchorPoints()._generateVertices(vertices, this.$trf, false);

        var hitResult = new GXVertexInfo.HitResult();
        var elemHitRes = null;
        var outlineWidth = scaleFactor + tolerance * 2;

        if (gVertexInfo.hitTest(locationInvTransformed.getX(), locationInvTransformed.getY(),
            vertices, outlineWidth, this.$closed ? area : false, hitResult)) {
            elemHitRes = new GXElement.HitResult(this, hitResult);
        }

        if (origTransform) {
            this.$trf = origTransform;
        }

        return elemHitRes;
    };

    /**
     * Creates and inserts a new point into the path. The point location is specified in the result of hit-test
     * @param {GXVertexInfo.HitResult} hitResult
     * @returns {GXPathBase.AnchorPoint} a newly inserted anchor point, or null if no new point was inserted
     */
    GXPath.prototype.insertHitPoint = function (hitResult) {
        if (!hitResult || !hitResult.slope ||
            gMath.isEqualEps(hitResult.slope, 0) || gMath.isEqualEps(hitResult.slope, 1)) {

            return null;
        }
        var slope = hitResult.slope;

        var idx = 1;
        var aPt = this.getAnchorPoints().getFirstChild();
        while (aPt != null && idx < hitResult.segment) {
            aPt = aPt.getNext();
            idx++;
        }

        var aPrev = aPt;
        var aNext = aPrev ? this.getAnchorPoints().getNextPoint(aPrev) : null;
        if (!aPrev || !aNext) {
            return null;
        } else {
            this.beginUpdate();
            aPrev.setProperty('ah', false);
            aNext.setProperty('ah', false);

            var tpaPrev = aPrev.getProperty('tp');
            var tpaNext = aNext.getProperty('tp');
            var tpaNew;
            if (tpaPrev == GXPathBase.AnchorPoint.Type.Connector ||
                tpaPrev == GXPathBase.AnchorPoint.Type.Symmetric ||
                tpaPrev == GXPathBase.AnchorPoint.Type.Mirror ||
                tpaNext == GXPathBase.AnchorPoint.Type.Connector ||
                tpaNext == GXPathBase.AnchorPoint.Type.Symmetric ||
                tpaNext == GXPathBase.AnchorPoint.Type.Mirror ||
                (tpaPrev == GXPathBase.AnchorPoint.Type.Asymmetric &&
                    tpaNext == GXPathBase.AnchorPoint.Type.Asymmetric)) {

                // One of near points is smooth or both have no styled corners
                tpaNew = GXPathBase.AnchorPoint.Type.Asymmetric;
            } else if (tpaPrev != GXPathBase.AnchorPoint.Type.Symmetric &&
                tpaPrev != GXPathBase.AnchorPoint.Type.Mirror &&
                tpaPrev != GXPathBase.AnchorPoint.Type.Connector &&
                tpaPrev != GXPathBase.AnchorPoint.Type.Asymmetric) {

                // aPrev has styled corner
                tpaNew = tpaPrev;
            } else {
                // aNext has styled corner
                tpaNew = tpaNext;
            }

            var newAPt = null;
            var p1x, c1x, c2x, p2x, p1y, c1y, c2y, p2y;

            p1x = aPrev.getProperty('x');
            p1y = aPrev.getProperty('y');
            c1x = aPrev.getProperty('hrx');
            c1y = aPrev.getProperty('hry');
            p2x = aNext.getProperty('x');
            p2y = aNext.getProperty('y');
            c2x = aNext.getProperty('hlx');
            c2y = aNext.getProperty('hly');

            var zeroC1 = c1x == null || c1y == null || gMath.isEqualEps(c1x, p1x) && gMath.isEqualEps(c1y, p1y);
            var zeroC2 = c2x == null || c2y == null || gMath.isEqualEps(c2x, p2x) && gMath.isEqualEps(c2y, p2y);

            // If line
            if (zeroC1 && zeroC2) {
                newAPt = new GXPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'],
                    [p1x + slope * (p2x - p1x), p1y + slope * (p2y - p1y), tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);
            } else if (zeroC1 || zeroC2) { // quadratic bezier curve
                var cx = zeroC1 ? c2x : c1x;
                var cy = zeroC1 ? c2y : c1y;
                var ctrls1X = new Float64Array(3);
                var ctrls1Y = new Float64Array(3);
                var ctrls2X = new Float64Array(3);
                var ctrls2Y = new Float64Array(3);
                gMath.divideQuadraticCurve(p1x, cx, p2x, slope, ctrls1X, ctrls2X);
                gMath.divideQuadraticCurve(p1y, cy, p2y, slope, ctrls1Y, ctrls2Y);

                newAPt = new GXPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[2], ctrls1Y[2], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);

                if (zeroC1) {
                    if (gMath.isEqualEps(ctrls1X[1], ctrls1X[2]) && gMath.isEqualEps(ctrls1Y[1], ctrls1Y[2])) {
                        newAPt.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        newAPt.setProperties(['hlx', 'hly'], [ctrls1X[1], ctrls1Y[1]]);
                    }
                    // Handle of the next point was not zero, so convert the second part into cubic curve
                    // to assign handles to both points
                    c1x = ctrls2X[0] + 2 / 3 * (ctrls2X[1] - ctrls2X[0]);
                    c1y = ctrls2Y[0] + 2 / 3 * (ctrls2Y[1] - ctrls2Y[0]);
                    c2x = ctrls2X[2] + 2 / 3 * (ctrls2X[1] - ctrls2X[2]);
                    c2y = ctrls2Y[2] + 2 / 3 * (ctrls2Y[1] - ctrls2Y[2]);
                    if (gMath.isEqualEps(c1x, ctrls2X[0]) && gMath.isEqualEps(c1y, ctrls2Y[0])) {
                        newAPt.setProperties(['hrx', 'hry'], [null, null]);
                    } else {
                        newAPt.setProperties(['hrx', 'hry'], [c1x, c1y]);
                    }

                    if (gMath.isEqualEps(c2x, ctrls2X[2]) && gMath.isEqualEps(c2y, ctrls2Y[2])) {
                        aNext.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        aNext.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }
                } else { // zeroC2
                    if (gMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && gMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
                        newAPt.setProperties(['hrx', 'hry'], [null, null]);
                    } else {
                        newAPt.setProperties(['hrx', 'hry'], [ctrls2X[1], ctrls2Y[1]]);
                    }
                    // Handle of the previous point was not zero, so convert the first part into cubic curve
                    // to assign handles to both points
                    c1x = ctrls1X[0] + 2 / 3 * (ctrls1X[1] - ctrls1X[0]);
                    c1y = ctrls1Y[0] + 2 / 3 * (ctrls1Y[1] - ctrls1Y[0]);
                    c2x = ctrls1X[2] + 2 / 3 * (ctrls1X[1] - ctrls1X[2]);
                    c2y = ctrls1Y[2] + 2 / 3 * (ctrls1Y[1] - ctrls1Y[2]);
                    if (gMath.isEqualEps(c2x, ctrls1X[2]) && gMath.isEqualEps(c2y, ctrls1Y[2])) {
                        newAPt.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        newAPt.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }

                    if (gMath.isEqualEps(c1x, ctrls1X[0]) && gMath.isEqualEps(c1y, ctrls1Y[0])) {
                        aPrev.setProperties(['hrx', 'hry'], [null, null]);
                    } else {
                        aPrev.setProperties(['hrx', 'hry'], [c1x, c1y]);
                    }
                }
            } else { // cubic bezier curve
                var ctrls1X = new Float64Array(4);
                var ctrls1Y = new Float64Array(4);
                var ctrls2X = new Float64Array(4);
                var ctrls2Y = new Float64Array(4);

                gMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 1, ctrls1X);
                gMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 1, ctrls1Y);
                gMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 2, ctrls2X);
                gMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 2, ctrls2Y);

                if (gMath.isEqualEps(ctrls1X[1], p1x) && gMath.isEqualEps(ctrls1Y[1], p1y)) {
                    aPrev.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    aPrev.setProperties(['hrx', 'hry'], [ctrls1X[1], ctrls1Y[1]]);
                }

                newAPt = new GXPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[3], ctrls1Y[3], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);
                if (gMath.isEqualEps(ctrls1X[2], ctrls1X[3]) && gMath.isEqualEps(ctrls1Y[2], ctrls1Y[3])) {
                    newAPt.setProperties(['hlx', 'hly'], [null, null]);
                } else {
                    newAPt.setProperties(['hlx', 'hly'], [ctrls1X[2], ctrls1Y[2]]);
                }
                if (gMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && gMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
                    newAPt.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    newAPt.setProperties(['hrx', 'hry'], [ctrls2X[1], ctrls2Y[1]]);
                }

                if (gMath.isEqualEps(ctrls2X[2], ctrls2X[3]) && gMath.isEqualEps(ctrls2Y[2], ctrls2Y[3])) {
                    aNext.setProperties(['hlx', 'hly'], [null, null]);
                } else {
                    aNext.setProperties(['hlx', 'hly'], [ctrls2X[2], ctrls2Y[2]]);
                }
            }
            this.endUpdate();
            return newAPt;
        }
    };

    /** @override */
    GXPath.prototype._handleChange = function (change, args) {
        GXPathBase.prototype._handleChange.call(this, change, args);
        this._handleGeometryChangeForProperties(change, args, GXPath.GeometryProperties);
        this._handleGeometryChangeForProperties(change, args, GXPathBase.GeometryProperties);
    };

    /** @override */
    GXPath.prototype.toString = function () {
        return "[GXPath]";
    };

    _.GXPath = GXPath;
})(this);