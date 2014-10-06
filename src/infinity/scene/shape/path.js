(function (_) {

    /**
     * A path shape
     * @class IFPath
     * @extends IFPathBase
     * @constructor
     */
    function IFPath(closed, evenOdd, anchorPoints) {
        IFPathBase.call(this, evenOdd, anchorPoints);
        this._setDefaultProperties(IFPath.GeometryProperties);
        if (closed) {
            this.setProperty('closed', closed);
        }
    }

    IFNode.inherit("path", IFPath, IFPathBase);

    /**
     * The geometry properties of a path with their default values
     */
    IFPath.GeometryProperties = {
        /** Closed or not */
        closed: false
    };

    /**
     * Return the anchor points of the path
     * @returns {IFPathBase.AnchorPoints}
     */
    IFPath.prototype.getAnchorPoints = function () {
        return this._getAnchorPoints();
    };

    /** @override */
    IFPath.prototype.clone = function () {
        var clone = IFPathBase.prototype.clone.call(this);

        // Transfer selected anchor points as flags are not cloned
        var selectedAnchorPoints = this.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            var anchorPointIndex = this.getAnchorPoints().getIndexOfChild(selectedAnchorPoints[i]);
            var cloneAnchorPoint = clone.getAnchorPoints().getChildByIndex(anchorPointIndex);
            if (cloneAnchorPoint) {
                cloneAnchorPoint.setFlag(IFNode.Flag.Selected);
            }
        }

        return clone;
    };

    /** @override */
    IFPath.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFShapeSet || parent instanceof IFShape || parent instanceof IFMegaPath.AnchorPaths;
    };

    /** @override */
    IFPath.prototype.validateSelectionChange = function () {
        if (this.getParent() && this.getParent() instanceof IFMegaPath.AnchorPaths) {
            return false;
        }
        return true;
    };

    /**
     * Hit-tests the path for the location. Corner styles are not applied.
     * @param {IFPoint} location
     * @param {IFTransform} transform - a transformation to be applied to the path before hit-testing in addition to
     * path internal transformation, if any
     * @param {Boolean} area - indicates if path inside should be tested
     * @param {Boolean} [tolerance] optional hit test tolerance, defaults to zero
     * @returns {IFElement.HitResultInfo} if hit, or null otherwise; hit result contains all data
     * in the path native anchor points coordinates
     */
    IFPath.prototype.pathHitTest = function (location, transform, area, tolerance) {
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
        var vertices = new IFVertexContainer();
        this._getAnchorPoints()._generateVertices(vertices, this.$trf, false);

        var hitResult = new IFVertexInfo.HitResult();
        var elemHitRes = null;
        var outlineWidth = scaleFactor * tolerance * 2;

        if (ifVertexInfo.hitTest(locationInvTransformed.getX(), locationInvTransformed.getY(),
            vertices, outlineWidth, this.$closed ? area : false, hitResult)) {
            elemHitRes = new IFElement.HitResultInfo(this, hitResult);
        }

        if (origTransform) {
            this.$trf = origTransform;
        }

        return elemHitRes;
    };

    /**
     * Creates and inserts a new point into the path. The point location is specified in the result of hit-test
     * @param {IFVertexInfo.HitResult} hitResult
     * @returns {IFPathBase.AnchorPoint} a newly inserted anchor point, or null if no new point was inserted
     */
    IFPath.prototype.insertHitPoint = function (hitResult) {
        if (!hitResult || !hitResult.slope ||
            IFMath.isEqualEps(hitResult.slope, 0) || IFMath.isEqualEps(hitResult.slope, 1)) {

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
            if (tpaPrev == IFPathBase.AnchorPoint.Type.Connector ||
                tpaPrev == IFPathBase.AnchorPoint.Type.Symmetric ||
                tpaPrev == IFPathBase.AnchorPoint.Type.Mirror ||
                tpaNext == IFPathBase.AnchorPoint.Type.Connector ||
                tpaNext == IFPathBase.AnchorPoint.Type.Symmetric ||
                tpaNext == IFPathBase.AnchorPoint.Type.Mirror ||
                (tpaPrev == IFPathBase.AnchorPoint.Type.Asymmetric &&
                    tpaNext == IFPathBase.AnchorPoint.Type.Asymmetric)) {

                // One of near points is smooth or both have no styled corners
                tpaNew = IFPathBase.AnchorPoint.Type.Asymmetric;
            } else if (tpaPrev != IFPathBase.AnchorPoint.Type.Symmetric &&
                tpaPrev != IFPathBase.AnchorPoint.Type.Mirror &&
                tpaPrev != IFPathBase.AnchorPoint.Type.Connector &&
                tpaPrev != IFPathBase.AnchorPoint.Type.Asymmetric) {

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

            var zeroC1 = c1x == null || c1y == null || IFMath.isEqualEps(c1x, p1x) && IFMath.isEqualEps(c1y, p1y);
            var zeroC2 = c2x == null || c2y == null || IFMath.isEqualEps(c2x, p2x) && IFMath.isEqualEps(c2y, p2y);

            // If line
            if (zeroC1 && zeroC2) {
                newAPt = new IFPath.AnchorPoint();
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
                IFMath.divideQuadraticCurve(p1x, cx, p2x, slope, ctrls1X, ctrls2X);
                IFMath.divideQuadraticCurve(p1y, cy, p2y, slope, ctrls1Y, ctrls2Y);

                newAPt = new IFPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[2], ctrls1Y[2], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);

                if (zeroC1) {
                    if (IFMath.isEqualEps(ctrls1X[1], ctrls1X[2]) && IFMath.isEqualEps(ctrls1Y[1], ctrls1Y[2])) {
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
                    if (IFMath.isEqualEps(c1x, ctrls2X[0]) && IFMath.isEqualEps(c1y, ctrls2Y[0])) {
                        newAPt.setProperties(['hrx', 'hry'], [null, null]);
                    } else {
                        newAPt.setProperties(['hrx', 'hry'], [c1x, c1y]);
                    }

                    if (IFMath.isEqualEps(c2x, ctrls2X[2]) && IFMath.isEqualEps(c2y, ctrls2Y[2])) {
                        aNext.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        aNext.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }
                } else { // zeroC2
                    if (IFMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && IFMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
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
                    if (IFMath.isEqualEps(c2x, ctrls1X[2]) && IFMath.isEqualEps(c2y, ctrls1Y[2])) {
                        newAPt.setProperties(['hlx', 'hly'], [null, null]);
                    } else {
                        newAPt.setProperties(['hlx', 'hly'], [c2x, c2y]);
                    }

                    if (IFMath.isEqualEps(c1x, ctrls1X[0]) && IFMath.isEqualEps(c1y, ctrls1Y[0])) {
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

                IFMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 1, ctrls1X);
                IFMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 1, ctrls1Y);
                IFMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 2, ctrls2X);
                IFMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 2, ctrls2Y);

                if (IFMath.isEqualEps(ctrls1X[1], p1x) && IFMath.isEqualEps(ctrls1Y[1], p1y)) {
                    aPrev.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    aPrev.setProperties(['hrx', 'hry'], [ctrls1X[1], ctrls1Y[1]]);
                }

                newAPt = new IFPath.AnchorPoint();
                newAPt.setProperties(['x', 'y', 'tp'], [ctrls1X[3], ctrls1Y[3], tpaNew]);
                this.getAnchorPoints().insertChild(newAPt, aNext);
                if (IFMath.isEqualEps(ctrls1X[2], ctrls1X[3]) && IFMath.isEqualEps(ctrls1Y[2], ctrls1Y[3])) {
                    newAPt.setProperties(['hlx', 'hly'], [null, null]);
                } else {
                    newAPt.setProperties(['hlx', 'hly'], [ctrls1X[2], ctrls1Y[2]]);
                }
                if (IFMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && IFMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
                    newAPt.setProperties(['hrx', 'hry'], [null, null]);
                } else {
                    newAPt.setProperties(['hrx', 'hry'], [ctrls2X[1], ctrls2Y[1]]);
                }

                if (IFMath.isEqualEps(ctrls2X[2], ctrls2X[3]) && IFMath.isEqualEps(ctrls2Y[2], ctrls2Y[3])) {
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
    IFPath.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFPath.GeometryProperties);
            args.pts = this.getAnchorPoints().serialize();
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFPath.GeometryProperties);
            if (args.hasOwnProperty('pts')) {
                this.getAnchorPoints().deserialize(args.pts);
            }
        }

        IFPathBase.prototype._handleChange.call(this, change, args);

        this._handleGeometryChangeForProperties(change, args, IFPath.GeometryProperties);
        this._handleGeometryChangeForProperties(change, args, IFPathBase.GeometryProperties);
    };

    /** @override */
    IFPath.prototype._requireMiterLimitApproximation = function () {
        return true;
    };

    /** @override */
    IFPath.prototype.toString = function () {
        return "[IFPath]";
    };

    _.IFPath = IFPath;
})(this);