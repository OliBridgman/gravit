(function (_) {

    /**
     * A path shape
     * @class GPath
     * @extends GPathBase
     * @constructor
     */
    function GPath(closed, evenOdd, anchorPoints) {
        GPathBase.call(this, evenOdd, anchorPoints);
        this._setDefaultProperties(GPath.GeometryProperties);
        if (closed) {
            this.setProperty('closed', closed);
        }
    }

    GNode.inherit("path", GPath, GPathBase);

    /**
     * The geometry properties of a path with their default values
     */
    GPath.GeometryProperties = {
        /** Closed or not */
        closed: false
    };

    /**
     * Return the anchor points of the path
     * @returns {GPathBase.AnchorPoints}
     */
    GPath.prototype.getAnchorPoints = function () {
        return this._getAnchorPoints();
    };

    /** @override */
    GPath.prototype.clone = function () {
        var clone = GPathBase.prototype.clone.call(this);

        // Transfer selected anchor points as flags are not cloned
        var selectedAnchorPoints = this.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            var anchorPointIndex = this.getAnchorPoints().getIndexOfChild(selectedAnchorPoints[i]);
            var cloneAnchorPoint = clone.getAnchorPoints().getChildByIndex(anchorPointIndex);
            if (cloneAnchorPoint) {
                cloneAnchorPoint.setFlag(GNode.Flag.Selected);
            }
        }

        return clone;
    };

    /** @override */
    GPath.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GLayer || parent instanceof GScene || parent instanceof GGroup ||
            parent instanceof GShape || parent instanceof GCompoundPath.Paths;
    };

    /**
     * Hit-tests the path for the location. Corner styles are not applied.
     * @param {GPoint} location
     * @param {GTransform} transform - a transformation to be applied to the path before hit-testing in addition to
     * path internal transformation, if any
     * @param {Boolean} area - indicates if path inside should be tested
     * @param {Boolean} [tolerance] optional hit test tolerance, defaults to zero
     * @returns {GElement.HitResultInfo} if hit, or null otherwise; hit result contains all data
     * in the path native anchor points coordinates
     */
    GPath.prototype.pathHitTest = function (location, transform, area, tolerance) {
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
        var vertices = new GVertexContainer();
        this._getAnchorPoints()._generateVertices(vertices, this.$trf, false);

        var hitResult = new GVertexInfo.HitResult();
        var elemHitRes = null;
        var outlineWidth = scaleFactor * tolerance * 2;

        if (ifVertexInfo.hitTest(locationInvTransformed.getX(), locationInvTransformed.getY(),
            vertices, outlineWidth, this.$closed ? area : false, hitResult)) {
            elemHitRes = new GElement.HitResultInfo(this, hitResult);
        }

        if (origTransform) {
            this.$trf = origTransform;
        }

        return elemHitRes;
    };

    /**
     * Creates and inserts a new point into the path. The point location is specified in the result of hit-test
     * @param {GVertexInfo.HitResult} hitResult
     * @returns {GPathBase.AnchorPoint} a newly inserted anchor point, or null if no new point was inserted
     */
    GPath.prototype.insertHitPoint = function (hitResult) {
        if (!hitResult || !hitResult.slope ||
            GMath.isEqualEps(hitResult.slope, 0) || GMath.isEqualEps(hitResult.slope, 1)) {

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
            if (tpaPrev == GPathBase.AnchorPoint.Type.Connector ||
                tpaPrev == GPathBase.AnchorPoint.Type.Symmetric ||
                tpaPrev == GPathBase.AnchorPoint.Type.Mirror ||
                tpaNext == GPathBase.AnchorPoint.Type.Connector ||
                tpaNext == GPathBase.AnchorPoint.Type.Symmetric ||
                tpaNext == GPathBase.AnchorPoint.Type.Mirror ||
                (tpaPrev == GPathBase.AnchorPoint.Type.Asymmetric &&
                    tpaNext == GPathBase.AnchorPoint.Type.Asymmetric)) {

                // One of near points is smooth or both have no styled corners
                tpaNew = GPathBase.AnchorPoint.Type.Asymmetric;
            } else if (tpaPrev != GPathBase.AnchorPoint.Type.Symmetric &&
                tpaPrev != GPathBase.AnchorPoint.Type.Mirror &&
                tpaPrev != GPathBase.AnchorPoint.Type.Connector &&
                tpaPrev != GPathBase.AnchorPoint.Type.Asymmetric) {

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

            var zeroC1 = c1x == null || c1y == null || GMath.isEqualEps(c1x, p1x) && GMath.isEqualEps(c1y, p1y);
            var zeroC2 = c2x == null || c2y == null || GMath.isEqualEps(c2x, p2x) && GMath.isEqualEps(c2y, p2y);

            // If line
            if (zeroC1 && zeroC2) {
                newAPt = new GPath.AnchorPoint();
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
                GMath.divideQuadraticCurve(p1x, cx, p2x, slope, ctrls1X, ctrls2X);
                GMath.divideQuadraticCurve(p1y, cy, p2y, slope, ctrls1Y, ctrls2Y);

                newAPt = new GPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[2], ctrls1Y[2], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);

                if (zeroC1) {
                    if (GMath.isEqualEps(ctrls1X[1], ctrls1X[2]) && GMath.isEqualEps(ctrls1Y[1], ctrls1Y[2])) {
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
                    if (GMath.isEqualEps(c1x, ctrls2X[0]) && GMath.isEqualEps(c1y, ctrls2Y[0])) {
                        newAPt.setProperties(['hrx', 'hry'], [null, null]);
                    } else {
                        newAPt.setProperties(['hrx', 'hry'], [c1x, c1y]);
                    }

                    if (GMath.isEqualEps(c2x, ctrls2X[2]) && GMath.isEqualEps(c2y, ctrls2Y[2])) {
                        aNext.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        aNext.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }
                } else { // zeroC2
                    if (GMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && GMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
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
                    if (GMath.isEqualEps(c2x, ctrls1X[2]) && GMath.isEqualEps(c2y, ctrls1Y[2])) {
                        newAPt.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        newAPt.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }

                    if (GMath.isEqualEps(c1x, ctrls1X[0]) && GMath.isEqualEps(c1y, ctrls1Y[0])) {
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

                GMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 1, ctrls1X);
                GMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 1, ctrls1Y);
                GMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 2, ctrls2X);
                GMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 2, ctrls2Y);

                if (GMath.isEqualEps(ctrls1X[1], p1x) && GMath.isEqualEps(ctrls1Y[1], p1y)) {
                    aPrev.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    aPrev.setProperties(['hrx', 'hry'], [ctrls1X[1], ctrls1Y[1]]);
                }

                newAPt = new GPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[3], ctrls1Y[3], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);
                if (GMath.isEqualEps(ctrls1X[2], ctrls1X[3]) && GMath.isEqualEps(ctrls1Y[2], ctrls1Y[3])) {
                    newAPt.setProperties(['hlx', 'hly'], [null, null]);
                } else {
                    newAPt.setProperties(['hlx', 'hly'], [ctrls1X[2], ctrls1Y[2]]);
                }
                if (GMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && GMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
                    newAPt.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    newAPt.setProperties(['hrx', 'hry'], [ctrls2X[1], ctrls2Y[1]]);
                }

                if (GMath.isEqualEps(ctrls2X[2], ctrls2X[3]) && GMath.isEqualEps(ctrls2Y[2], ctrls2Y[3])) {
                    aNext.setProperties(['hlx', 'hly'], [null, null]);
                } else {
                    aNext.setProperties(['hlx', 'hly'], [ctrls2X[2], ctrls2Y[2]]);
                }
            }
            this.endUpdate();
            return newAPt;
        }
    };

    /**
     * Reverse the order of anchor points in path
     */
    GPath.prototype.reverseOrder = function () {
        this.beginUpdate();
        var ap;
        var firstAp = this.getAnchorPoints().getFirstChild();
        for (ap = this.getAnchorPoints().getLastChild(); ap !== firstAp; ap = this.getAnchorPoints().getLastChild()) {
            ap.flip();
            this.getAnchorPoints().removeChild(ap);
            this.getAnchorPoints().insertChild(ap, firstAp);
        }
        firstAp.flip();
        this.endUpdate();
    };

    /**
     * If a path is actually a closed path with duplicated first/last point
     * then remove the extra point and set the 'closed' attribute if is not set yet
     */
    GPath.prototype.correctClosedAttribute = function () {
        var firstAp = this.getAnchorPoints().getFirstChild();
        var lastAp = this.getAnchorPoints().getLastChild();
        if (firstAp != lastAp &&
            GMath.isEqualEps(firstAp.getProperty('x'), lastAp.getProperty('x')) &&
            GMath.isEqualEps(firstAp.getProperty('y'), lastAp.getProperty('y')) &&
            firstAp.getProperty('tp') === lastAp.getProperty('tp') &&
            (firstAp.getProperty('hlx') === null || firstAp.getProperty('hly') === null) &&
            (lastAp.getProperty('hrx') === null || lastAp.getProperty('hry') === null)) {

            // The path is closed, remove duplicating points
            this.beginUpdate();
            firstAp.setProperties(['hlx', 'hly'], [lastAp.getProperty('hlx'), lastAp.getProperty('hly')]);
            this.getAnchorPoints().removeChild(lastAp);
            if (!this.$closed) {
                this.setProperty('closed', true);
            }
            this.endUpdate();
        }
    };

    /** @override */
    GPath.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GPath.GeometryProperties);
            args.pts = this.getAnchorPoints().serialize();
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GPath.GeometryProperties);
            if (args.hasOwnProperty('pts')) {
                this.getAnchorPoints().deserialize(args.pts);
            }
        }

        GPathBase.prototype._handleChange.call(this, change, args);

        this._handleGeometryChangeForProperties(change, args, GPath.GeometryProperties);
        this._handleGeometryChangeForProperties(change, args, GPathBase.GeometryProperties);
    };

    /** @override */
    GPath.prototype._requireMiterLimitApproximation = function () {
        return true;
    };

    /** @override */
    GPath.prototype.toString = function () {
        return "[GPath]";
    };

    _.GPath = GPath;
})(this);