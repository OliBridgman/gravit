(function (_) {
    /**
     * @class IFVertexOffsetter
     * @extends IFVertexSource
     * @param {IFVertexSource} source the underyling vertex source to work on
     * @param {Number} offset - the distance at which offset should be calculated
     * @param {Boolean} inset - indicates if an inset is required
     * @param {Boolean} outset - indicates if an outset is required
     * @param {Number} tol - offset approximation tolerance value (preciseness)
     * @constructor
     */
    function IFVertexOffsetter(source, offset, inset, outset, tol) {
        this._tolerance = tol ? tol / 3 : 0.03;
        this._source = source;
        this._offset = offset;
        this._makeInset = inset;
        this._makeOutset = outset;
        this._startVertex = null;
    }

    IFObject.inherit(IFVertexOffsetter, IFVertexSource);

    IFVertexOffsetter.MAX_RECURS = 100;

    /**
     *
     * @param {GPoint} point
     * @param {Number} bulge
     * @param {GPoint} center
     * @param {Number} radius
     * @constructor
     */
    IFVertexOffsetter.PolySegment = function (point, bulge, center, radius) {
        this.point = point;

        if (bulge != null) {
            this.bulge = bulge;
            if (bulge) {
                if (!center || !radius || radius < 0) {
                    return;
                }
                this.center = center;
                this.radius = radius;
            }
        }
    };

    IFVertexOffsetter.PolySegment.prototype.point = null;

    IFVertexOffsetter.PolySegment.prototype.bulge = null;

    IFVertexOffsetter.PolySegment.prototype.center = null;

    IFVertexOffsetter.PolySegment.prototype.radius = null;

    IFVertexOffsetter.PolySegment.prototype.next = null;

    IFVertexOffsetter.PolySegment.prototype.previous = null;

    IFVertexOffsetter.PolyOffsetSegment = function (basepoint, point1, point2, bulge, center, radius) {
        IFVertexOffsetter.PolySegment.call(this, point1, bulge, center, radius);
        this.basepoint = basepoint;
        if (point2) {
            this.point2 = point2;
        }
    };
    IFObject.inherit(IFVertexOffsetter.PolyOffsetSegment, IFVertexOffsetter.PolySegment);

    IFVertexOffsetter.PolyOffsetSegment.prototype.basepoint = null;

    IFVertexOffsetter.PolyOffsetSegment.prototype.point2 = null;

    IFVertexOffsetter.IntersectionType = function () {
    };

    /**
     * If intersection point is a True Intersection Point
     * @type {boolean}
     */
    IFVertexOffsetter.IntersectionType.prototype.TIP = false;

    /**
     * If intersection point is a False Intersection Point
     * @type {boolean}
     */
    IFVertexOffsetter.IntersectionType.prototype.FIP = false;

    /**
     * If intersection point is a Positive False Intersection Point
     * Otherwise if point FIP and not PFIP, it is considered NFIP (Negative False Intersection Point)
     * @type {boolean}
     */
    IFVertexOffsetter.IntersectionType.prototype.PFIP = false;

    IFVertexOffsetter.IntersectionResult = function () {
        this.intTypes = [new IFVertexOffsetter.IntersectionType(), new IFVertexOffsetter.IntersectionType()];
    };

    /**
     * Intersection point
     * @type {GPoint}
     */
    IFVertexOffsetter.IntersectionResult.prototype.point = null;

    /**
     * Intersection types (IFVertexOffsetter.IntersectionType) of both segments
     * @type {Array}
     */
    IFVertexOffsetter.IntersectionResult.prototype.intTypes = null;

    IFVertexOffsetter.IntersectionResult.prototype.clear = function () {
        this.point = null;
        this.intTypes[0].TIP = false;
        this.intTypes[0].FIP = false;
        this.intTypes[0].PFIP = false;
        this.intTypes[1].TIP = false;
        this.intTypes[1].FIP = false;
        this.intTypes[1].PFIP = false;
    };

    IFVertexOffsetter.PolySegmentContainer = function () {
        this.count = 0;
    };

    IFVertexOffsetter.PolySegmentContainer.prototype.head = null;

    IFVertexOffsetter.PolySegmentContainer.prototype.end = null;

    IFVertexOffsetter.PolySegmentContainer.prototype.closed = null;

    IFVertexOffsetter.PolySegmentContainer.prototype.count = 0;

    IFVertexOffsetter.PolySegmentContainer.prototype.insertSegment = function (polySegment, next) {
        polySegment.next = null;
        polySegment.previous = null;
        if (!this.head) {
            this.head = polySegment;
            this.end = polySegment;
        } else if (next) {
            if (this.head == next) {
                this.head = polySegment;
            } else {
                polySegment.previous = next.previous;
                next.previous.next = polySegment;
            }
            polySegment.next = next;
            next.previous = polySegment;
        } else {
            this.end.next = polySegment;
            polySegment.previous = this.end;
            this.end = polySegment;
        }
        ++this.count;
    };

    IFVertexOffsetter.PolySegmentContainer.prototype.deleteSegment = function (polySegment) {
        if (polySegment.previous) {
            polySegment.previous.next = polySegment.next;
        }
        if (polySegment.next) {
            polySegment.next.previous = polySegment.previous;
        }
        if (this.head == polySegment) {
            this.head = polySegment.next;
        }
        if (this.end == polySegment) {
            this.end = polySegment.previous;
        }
        --this.count;
    };

    IFVertexOffsetter.IntersectionPt = function (x, y, slope, segment, idx) {
        this.x = x;
        this.y = y;
        this.slope = slope;
        this.segm = segment;
        this.segmIdx = idx;
    };

    IFVertexOffsetter.IntersectionPt.prototype.x = null;
    IFVertexOffsetter.IntersectionPt.prototype.y = null;
    IFVertexOffsetter.IntersectionPt.prototype.slope = null;
    IFVertexOffsetter.IntersectionPt.prototype.segm = null;
    IFVertexOffsetter.IntersectionPt.prototype.segmIdx = null;

    /**
     * @type {IFVertexSource}
     * @private
     */
    IFVertexOffsetter.prototype._source = null;

    /**
     * @type {Number}
     * @private
     */
    IFVertexOffsetter.prototype._offset = null;

    /**
     * @type {Boolean}
     * @private
     */
    IFVertexOffsetter.prototype._makeInset = false;

    /**
     * @type {Boolean}
     * @private
     */
    IFVertexOffsetter.prototype._makeOutset = false;

    /**
     * @type {Number}
     * @private
     */
    IFVertexOffsetter.prototype._tolerance = null;

    /**
     *
     * @type {IFVertexOffsetter.PolySegmentContainer}
     * @private
     */
    IFVertexOffsetter.prototype._polyline = null;

    IFVertexOffsetter.prototype._polyinset = null;

    IFVertexOffsetter.prototype._polyoutset = null;

    IFVertexOffsetter.prototype._inset = null;

    IFVertexOffsetter.prototype._insetIdx = 0;

    IFVertexOffsetter.prototype._outset = null;

    IFVertexOffsetter.prototype._outsetIdx = 0;

    /**
     * Stores the new path start position when 'Close' or 'Move' is used in the middle of vertex sequence
     * @type {IFVertex}
     * @private
     */
    IFVertexOffsetter.prototype._startVertex = null;

    /** @override */
    IFVertexOffsetter.prototype.rewindVertices = function (index) {
        if (index != 0) {
            return false;
        }
        this._inset = null;
        this._insetIdx = 0;
        this._outset = null;
        this._outsetIdx = 0;
        this._startVertex = null;

        return this._source.rewindVertices(0);
    };

    /** override */
    IFVertexOffsetter.prototype.readVertex = function (vertex) {
        if (this._outset && this._outset.length && this._readVertex(vertex, true)) {
            return true;
        }
        if (this._inset && this._inset.length && this._readVertex(vertex, false)) {
            return true;
        }

        this._polyline = new IFVertexOffsetter.PolySegmentContainer();
        this._polyoutset = [];
        this._polyinset = [];
        this._outset = [];
        this._inset = [];
        this._insetIdx = 0;
        this._outsetIdx = 0;
        this._startVertex = this.generatePolyLine(this._tolerance, this._startVertex);

        if (this._polyline.count) {
            this.generatePolyOffset(Math.abs(this._offset), this._makeInset, this._makeOutset, this._tolerance);
            this.generateOffset(this._makeInset, this._makeOutset, this._tolerance);
            if (this._inset.length) {
                this._rewindVertices(false);
                this._insetIdx = 0;
            }
            if (this._outset.length) {
                this._rewindVertices(true);
                this._outsetIdx = 0;
            }
            if (this._outset.length && this._readVertex(vertex, true)) {
                return true;
            }
            if (this._inset.length && this._readVertex(vertex, false)) {
                return true;
            }
        }

        return false;
    };

    /**
     *
     * @param {GPoint} B0 - a start point of Quadratic Bezier curve
     * @param {GPoint} B1 - a control point of Quadratic Bezier curve
     * @param {GPoint} B2 - an end point of Quadratic Bezier curve
     * @param {Number} tolerance
     * @param {Number} counter
     */
    IFVertexOffsetter.prototype.addCurveToPolyline = function (B0, B1, B2, tolerance, counter) {
        ++counter;

        // 1. Approximation of quadratic Bezier curves by arc splines
        // D.J. Walton, D.S. Meek, 1992
        //
        // 2. An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006
        //
        // 3. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012

        // 0. Try segment approximation
        if (this._isQudraticCurveFlat(B0, B1, B2, tolerance)) {
            var segm = new IFVertexOffsetter.PolySegment(B0, 0);
            this._polyline.insertSegment(segm);
            return;
        }

        // 1. approximate curve by bi-arc
        var a = ifMath.ptDist(B0.getX(), B0.getY(), B1.getX(), B1.getY());
        var b = ifMath.ptDist(B1.getX(), B1.getY(), B2.getX(), B2.getY());
        var d = ifMath.ptDist(B0.getX(), B0.getY(), B2.getX(), B2.getY());
        // TODO: check for zeros
        var T0 = new GPoint((B1.getX() - B0.getX()) / a, (B1.getY() - B0.getY()) / a);
        var T1 = new GPoint((B2.getX() - B1.getX()) / b, (B2.getY() - B1.getY()) / b);
        var T = new GPoint((B2.getX() - B0.getX()) / d, (B2.getY() - B0.getY()) / d);
        var cosEtha = ifMath.vDotProduct(T0.getX(), T0.getY(), T1.getX(), T1.getY());

        // D(u) = a*(T1 - T0*cosEtha) + ((a*cosEtha - b)T0 + (b*cosEtha - a)T1)*u
        // N(u) = D(u) / ||D(u)||
        var D0 = new GPoint(a * (T1.getX() - T0.getX() * cosEtha), a * (T1.getY() - T0.getY() * cosEtha));
        var tmp1 = a * cosEtha - b;
        var tmp2 = b * cosEtha - a;
        var D1 = new GPoint(
            D0.getX() + tmp1 * T0.getX() + tmp2 * T1.getX(), D0.getY() + tmp1 * T0.getY() + tmp2 * T1.getY());

        tmp1 = Math.sqrt(ifMath.vDotProduct(D0.getX(), D0.getY(), D0.getX(), D0.getY()));
        tmp2 = Math.sqrt(ifMath.vDotProduct(D1.getX(), D1.getY(), D1.getX(), D1.getY()));
        // TODO: check for zeros
        var N0 = new GPoint(D0.getX() / tmp1, D0.getY() / tmp1);
        var N1 = new GPoint(D1.getX() / tmp2, D1.getY() / tmp2);

        // f(s) = a1*s^2 + b1*s + c1
        // f(s) = (1 - cosEtha)s^2 + (T1N0 * TT0 / TN0 + T0N1 * TT1 / TN1)s - 0.5 * (T1N0 * T0N1) / (TN0 * TN1)
        // f(s) = 0
        // lambda*T0N1 = s*d*TN1
        // myu*T1N0 = s*d*TN0
        var a1 = 1 - cosEtha;
        var T1N0 = ifMath.vDotProduct(T1.getX(), T1.getY(), N0.getX(), N0.getY());
        var TT0 = ifMath.vDotProduct(T.getX(), T.getY(), T0.getX(), T0.getY());
        var TN0 = ifMath.vDotProduct(T.getX(), T.getY(), N0.getX(), N0.getY());
        var T0N1 = ifMath.vDotProduct(T0.getX(), T0.getY(), N1.getX(), N1.getY());
        var TT1 = ifMath.vDotProduct(T.getX(), T.getY(), T1.getX(), T1.getY());
        var TN1 = ifMath.vDotProduct(T.getX(), T.getY(), N1.getX(), N1.getY());
        var b1 = T1N0 * TT0 / TN0 + T0N1 * TT1 / TN1;
        var c1 = -(T1N0 * T0N1) / (TN0 * TN1 * 2);
        var roots = [];
        ifMath.getQuadraticRoots(a1, b1, c1, roots);
        var s = null;
        if (roots[0] != null && roots[0] < 1 && roots[0] > 0) {
            s = roots[0];
        } else if (roots[1] != null && roots[1] < 1 && roots[1] > 0) {
            s = roots[1];
        } else {
            // TODO: go away
        }

        // TODO: check for zeros
        var lambda = s*d*TN1 / T0N1;
        var myu = s*d*TN0 / T1N0;

        // V = B0 + lambda*T0
        // G = V + lambda*T
        // W = B2 - myu*T1
        // G is incentre of B0B1B2 =>
        // gamma = phi/2, cos(phi) = TT0, sin(gamma) = sqrt((1 - cos(phi)) / 2),
        // cos(gamma) = sqrt((1 + cos(phi)) / 2), Rb0 = lambda * cos(gamma) / sin(gamma),
        // psi = theta/2, cos(theta) = TT1, sin(gamma) = sqrt((1 - cos(theta)) / 2),
        // cos(gamma) = sqrt((1 + cos(theta)) / 2), Rb2 = myu * cos(psi) / sin(psi),
        var sinGamma = Math.sqrt((1 - TT0) / 2);
        var cosGamma = Math.sqrt((1 + TT0) / 2);
        var Rb0 = lambda * cosGamma / sinGamma;
        var sinPsi = Math.sqrt((1 - TT1) / 2);
        var cosPsi = Math.sqrt((1 + TT1) / 2);
        var Rb2 = myu * cosPsi / sinPsi;
        var C0 = new GPoint(B0.getX() + Rb0 * N0.getX(), B0.getY() + Rb0 * N0.getY());
        var C1 = new GPoint(B2.getX() + Rb2 * N1.getX(), B2.getY() + Rb2 * N1.getY());

        // 2. measure dist
        // By Theorem 2: sigma from (0,1): g(u) = (d - 2a*cos(phi))u^2 + 2a*cos(phi)u - lambda*(1 + cos(phi)) = 0
        tmp1 = 2 * a * TT0;
        roots = [];
        ifMath.getQuadraticRoots(d - tmp1, tmp1, -lambda * (1 + TT0), roots);
        var sigma = 0.5;
        if (roots[0] != null && roots[0] < 1 && roots[0] > 0) {
            sigma = roots[0];
        } else if (roots[1] != null && roots[1] < 1 && roots[1] > 0) {
            sigma = roots[1];
        } else {
            // TODO: go away
        }
        var sinPhi = Math.sqrt(1 - TT0 * TT0);
        var kSigma = Math.abs((2*a*sigma*(1 - sigma) - lambda) * sinPhi);

        // By Theorem 3:
        // t01, t02:
        // z0(u) = (a^2 + b^2 - a*b*cos(etha))*u^2 + 3a(b*cos(etha) - a)u + 2a^2 - Rb0*b*sin(etha) = 0
        // t11, t12:
        // z1(u) = (a^2 + b^2 - a*b*cos(etha))*u^2 + (-2a^2 + b^2 +ab*cos(etha))u + a^2 + ab*cos(etha) - Rb2*a*sin(etha) = 0
        // rho0(u) = abs(Rb0 - ||Q(u) - C0||)
        // rho1(u) = abs(Rb2 - ||Q(u) - C1||)
        // delta = max(kSigma, rho0(t01), rho0(t02), rho(t11), rho(t12))
        var aSqr = a * a;
        var bSqr = b * b;
        var abcosEtha = a * b * cosEtha;
        tmp1 = aSqr + bSqr - abcosEtha;
        var sinEtha = Math.sqrt(1 - cosEtha * cosEtha);
        var delta = kSigma;
        var tMax = sigma;
        roots = [];
        ifMath.getQuadraticRoots(tmp1, 3 * (abcosEtha - aSqr), 2 * aSqr - Rb0 * b * sinEtha, roots);
        if (roots[0] != null && roots[0] < sigma && roots[0] > 0) {
            var Qt01 = new GPoint(ifMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[0]),
                ifMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[0]));
            var pho01 = Math.abs(Rb0 - ifMath.ptDist(Qt01.getX(), Qt01.getY(), C0.getX(), C0.getY()));
            if (delta < pho01) {
                delta = pho01;
                tMax = roots[0];
            }
        }
        if (roots[1] != null && roots[1] < sigma && roots[1] > 0) {
            var Qt02 = new GPoint(ifMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[1]),
                ifMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[1]));
            var pho02 = Math.abs(Rb0 - ifMath.ptDist(Qt02.getX(), Qt02.getY(), C0.getX(), C0.getY()));
            if (delta < pho02) {
                delta = pho02;
                tMax = roots[1];
            }
        }

        roots = [];
        ifMath.getQuadraticRoots(tmp1, -2 * aSqr + bSqr + abcosEtha, aSqr + abcosEtha - Rb2 * a * sinEtha, roots);
        if (roots[0] != null && roots[0] < 1 && roots[0] > sigma) {
            var Qt11 = new GPoint(ifMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[0]),
                ifMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[0]));
            var pho11 = Math.abs(Rb2 - ifMath.ptDist(Qt11.getX(), Qt11.getY(), C1.getX(), C1.getY()));
            if (delta < pho11) {
                delta = pho11;
                tMax = roots[0];
            }
        }
        if (roots[1] != null && roots[1] < 1 && roots[1] > sigma) {
            var Qt12 = new GPoint(ifMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[1]),
                ifMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[1]));
            var pho12 = Math.abs(Rb2 - ifMath.ptDist(Qt12.getX(), Qt12.getY(), C1.getX(), C1.getY()));
            if (delta < pho12) {
                delta = pho12;
                tMax = roots[1];
            }
        }

        // 3. if delta > tolerance => divide && repeat;
        // else => add bi-arc to polyline
        if (delta > tolerance && counter < IFVertexOffsetter.MAX_RECURS) {
            var ctrls1X = new Float64Array(3);
            var ctrls1Y = new Float64Array(3);
            var ctrls2X = new Float64Array(3);
            var ctrls2Y = new Float64Array(3);
            ifMath.divideQuadraticCurve(B0.getX(), B1.getX(), B2.getX(), tMax, ctrls1X, ctrls2X);
            ifMath.divideQuadraticCurve(B0.getY(), B1.getY(), B2.getY(), tMax, ctrls1Y, ctrls2Y);
            this.addCurveToPolyline(B0, new GPoint(ctrls1X[1], ctrls1Y[1]), new GPoint(ctrls1X[2], ctrls1Y[2]), tolerance, counter);
            this.addCurveToPolyline(new GPoint(ctrls2X[0], ctrls2Y[0]), new GPoint(ctrls2X[1], ctrls2Y[1]), B2, tolerance, counter);
        } else {
            // V = B0 + lambda*T0
            // G = V + lambda*T
            var G = new GPoint(B0.getX() + lambda * (T0.getX() + T.getX()), B0.getY() + lambda * (T0.getY() + T.getY()));

            // Define curve orientation
            // We can check arc center location against B0G
            var tgHalfGamma = sinGamma / (cosGamma + 1);
            if (ifMath.segmentSide(B0.getX(), B0.getY(), G.getX(), G.getY(), C0.getX(), C0.getY()) > 0) {
                tgHalfGamma = -tgHalfGamma;
            }
            var segm = new IFVertexOffsetter.PolySegment(B0, tgHalfGamma, C0, Rb0);
            this._polyline.insertSegment(segm);
            var tgHalfPsi = sinPsi / (cosPsi + 1);
            if (tgHalfGamma < 0) {
                tgHalfPsi = -tgHalfPsi;
            }
            segm = new IFVertexOffsetter.PolySegment(G, tgHalfPsi, C1, Rb2);
            this._polyline.insertSegment(segm);
        }
    };

    /**
     *
     * @param {GPoint} B0 - a start point of cubic Bezier curve
     * @param {GPoint} B1 - the first control point of cubic Bezier curve
     * @param {GPoint} B2 - the second control point of cubic Bezier curve
     * @param {GPoint} B3 - an end point of cubic Bezier curve
     * @param {Number} tolerance
     */
    IFVertexOffsetter.prototype.addCubicCurveToPolyline = function (B0, B1, B2, B3, tolerance) {
        // 1. Approximation of a planar cubic Bezier spiral by circular arcs
        // D.J. Walton, D.S. Meek, 1996
        //
        // 2. APPROXIMATION OF A CUBIC BEZIER CURVE BY CIRCULAR ARCS AND VICE VERSA
        // A. Riškus, 2006
        //
        // 3. An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006
        //
        // 4. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012
        //
        // For dividing a cubic Bezier curve the approach A1 && S1 from the document 2 will be used, while the
        // whole algorithm will be taken from the document 4.

        // 1. Find initial interval (curve) splitPoints at [0, 1],
        // which are curve inflate points, or such points,
        // that P'x = 0 or P'y = 0
        var cx = B1.getX() - B0.getX();
        var cy = B1.getY() - B0.getY();
        var bx = 2 * (B2.getX() - B1.getX() - cx);
        var by = 2 * (B2.getY() - B1.getY() - cy);
        var ax = B3.getX() - B2.getX() - cx - bx;
        var ay = B3.getY() - B2.getY() - cy - by;
        var sPts = [];
        var nPoints = ifMath.getCubicCurveSplits(ax, bx, cx, ay, by, cy, sPts);

        // 2. Based on splitPoints iterate through intervals,
        // and for each interval perform the curve approximation with a biArc:
        var t1, t2;
        var ctrlsx = new Float64Array(4);
        var ctrlsy = new Float64Array(4);
        for (var i = 0; i < nPoints - 1; ++i) {
            t1 = sPts[i];
            t2 = sPts[i + 1];
            ifMath.getCtrlPts(B0.getX(), B3.getX(), B1.getX(), B2.getX(), t1, t2, ctrlsx);
            ifMath.getCtrlPts(B0.getY(), B3.getY(), B1.getY(), B2.getY(), t1, t2, ctrlsy);
            var counter = 0;
            this._addCubicSegmToPolyline(ctrlsx, ctrlsy, tolerance, counter);
        }
    };

    IFVertexOffsetter.prototype._isQudraticCurveFlat = function (B0, B1, B2, tolerance) {
        var xB = ifMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), 0.5);
        var yB = ifMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), 0.5);
        var dst = ifMath.ptSqrDist(xB, yB, (B0.getX() + B2.getX()) / 2, (B0.getY() + B2.getY()) / 2);
        return (dst <= tolerance * tolerance);
    };

    IFVertexOffsetter.prototype._isCubicCurveFlat = function (ctrlsx, ctrlsy, tolerance) {
        // Piecewise Linear Approximation of Bezier Curves
        // Kaspar Fischer, 2000
        // (approved for publication part of algorithm with copyright by Roger Willcocks)
        var ux = 3.0 * ctrlsx[1] - 2.0 * ctrlsx[0] - ctrlsx[3];
        ux *= ux;
        var uy = 3.0 * ctrlsy[1] - 2.0 * ctrlsy[0] - ctrlsy[3];
        uy *= uy;
        var vx = 3.0 * ctrlsx[2] - 2.0 * ctrlsx[3] - ctrlsx[0];
        vx *= vx;
        var vy = 3.0 * ctrlsy[2] - 2.0 * ctrlsy[3] - ctrlsy[0];
        vy *= vy;
        if (ux < vx) {
            ux = vx;
        }
        if (uy < vy) {
            uy = vy;
        }
        return (ux + uy <= 16 * tolerance * tolerance);
    };
    
    /**
     *
     * @param {Float64Array(4)} ctrlsx - array of X coordinates of the control points
     * @param {Float64Array(4)} ctrlsy - array of Y coordinates of the control points
     * @param {Number} tolerance
     * @param {Number} counter
     */
    IFVertexOffsetter.prototype._addCubicSegmToPolyline = function (ctrlsx, ctrlsy, tolerance, counter) {
        ++counter;

        // 1. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012
        var xA = ctrlsx[0];
        var yA = ctrlsy[0];
        var xB = ctrlsx[3];
        var yB = ctrlsy[3];

        // 0. try line approximation
        if (this._isCubicCurveFlat(ctrlsx, ctrlsy, tolerance)) {
            var segm = new IFVertexOffsetter.PolySegment(new GPoint(xA, yA), 0);
            this._polyline.insertSegment(segm);
            return;
        }

        // 1. Construct approximating arc
        var C;
        var hndl1 = !ifMath.isEqualEps(xA, ctrlsx[1]) || !ifMath.isEqualEps(yA, ctrlsy[1]);
        var hndl2 = !ifMath.isEqualEps(xB, ctrlsx[2]) || !ifMath.isEqualEps(yB, ctrlsy[2]);
        if (hndl1 && hndl2) {
            var result = [];
            C = ifMath.getIntersectionPoint(xA, yA, ctrlsx[1], ctrlsy[1], ctrlsx[2], ctrlsy[2], xB, yB, result);
        } else if (hndl1) {
            C = new GPoint(ctrlsx[1], ctrlsy[1]);
        } else if (hndl2) {
            C = new GPoint(ctrlsx[2], ctrlsy[2]);
        } else {
            this._polyline.insertSegment(new IFVertexOffsetter.PolySegment(new GPoint(xA, yA), 0));
            return;
        }
        var ab = ifMath.ptDist(xA, yA, xB, yB);
        var ac = ifMath.ptDist(xA, yA, C.getX(), C.getY());
        var bc = ifMath.ptDist(xB, yB, C.getX(), C.getY());
        var p = ab + ac + bc;
        var xG = (xA * bc + xB * ac + C.getX() * ab) / p;
        var yG = (yA * bc + yB * ac + C.getY() * ab) / p;
        if (ifMath.isEqualEps(xA, xG) || ifMath.isEqualEps(yA, yG) ||
            ifMath.isEqualEps(xB, xG) || ifMath.isEqualEps(yB, yG)) {
            // Might be some error, as the original cubic curve has been split to not contain parts,
            // where tangent line is parallel to X axis or Y axis.
            var segm = new IFVertexOffsetter.PolySegment(new GPoint(xA, yA), 0);
            this._polyline.insertSegment(segm);
        } else {
            var mA = (yA - yG) / (xA - xG);
            var mB = (yB - yG) / (xB - xG);
            var xO = (mA * mB * (yA - yB) + mB * (xA + xG) - mA * (xG + xB)) / 2 / (mB - mA);
            var yO = -1 / mA * (xO - (xA + xG) / 2) + (yA + yG) / 2;
            var R = ifMath.ptDist(xA, yA, xO, yO);

            // 2. Evaluate error by measuring minimal and maximal distance from curve to point O
            // P(t) = P1 + 3t(C1 - P1) + 3t^2*(C2 - 2C1 + P1) + t^3*(P2 - 3C2 + 3C1 - P1)
            // P(t) = a1t^3 + b1t^2 + c1t + d1
            // d1 = A

            var cx = ctrlsx[1] - xA;
            var c1x = 3 * cx;
            var cy = ctrlsy[1] - yA;
            var c1y = 3 * cy;
            var tmp = ctrlsx[2] - ctrlsx[1] - cx;
            var b1x = 3 * tmp;
            var bx = 2 * tmp;
            tmp = ctrlsy[2] - ctrlsy[1] - cy;
            var b1y = 3 * tmp;
            var by = 2 * tmp;
            var a1x = xB - ctrlsx[2] - cx - bx;
            var a1y = yB - ctrlsy[2] - cy - by;

            // P(t)^2 = a1^2*t^6 + b1^2*t^4 + c1^2*t^2 + d1^2 + 2*a1b1*t^5 + 2a1c1*t^4 +
            //        + 2(a1d1 + b1c1)t^3 + 2b1d1*t^2 + 2c1d1*t
            //
            // d1 = d1 - x, d2 = d2 - y
            //
            // Pdist(t) = (a1^2 + a2^2)*t^6 + 2*(a1b1 + a2b2)*t^5 + (b1^2 + 2a1c1 + b2^2 + 2a2c2)*t^4 +
            //         + 2(a1(d1 - x) + b1c1 + a2(d2 - y) + b2c2)*t^3 + (c1^2 + 2b1(d1 - x) + c2^2 + 2b2(d2 -y))*t^2 +
            //         + 2(c1(d1 - x) + c2(d2 - y))*t + (d1 - x)^2 + (d2 - y)^2
            var d1 = xA - xO;
            var d2 = yA - yO;
            // Coefficients of 6 degree polynomial - distance from cubic Bezier curve segment to arc center O
            var coeffF = new Float64Array(7);
            coeffF[0] = a1x * a1x + a1y * a1y;
            coeffF[1] = 2 * (a1x * b1x + a1y * b1y);
            coeffF[2] = b1x * b1x + b1y * b1y + 2 * (a1x * c1x + a1y * c1y);
            coeffF[3] = (a1x * d1 + b1x * c1x + a1y * d2 + b1y * c1y) * 2;
            coeffF[4] = c1x * c1x + c1y * c1y + (b1x * d1 + b1y * d2) * 2;
            coeffF[5] = (c1x * d1 + c1y * d2) * 2;
            coeffF[6] = d1 * d1 + d2 * d2;

            // Coefficients of 5 degree derivative polynomial
            var coeffFDeriv = new Float64Array(6);
            ifMath.getCoeffPolyDeriv(coeffF, 6, coeffFDeriv);
            // Coeffitients of the second and third derivative polynomials
            var coeffFDeriv2 = new Float64Array(5);
            ifMath.getCoeffPolyDeriv(coeffFDeriv, 5, coeffFDeriv2);
            var coeffFDeriv3 = new Float64Array(4);
            ifMath.getCoeffPolyDeriv(coeffFDeriv2, 4, coeffFDeriv3);

            // Coefficients of 5 degree polynomial, calculated from derivative polynomial and interval transformation
            var coeffInversed = new Float64Array(6);
            ifMath.inversePolyUnaryInterval(coeffFDeriv, 5, coeffInversed);
            var nRoots = ifMath.estimPositiveRootsDescartes(coeffInversed, 5);
            var maxDst = 0;
            var v51, v52;
            // generalized Sturm sequence (array of polynomial coefficients arrays)
            var sturmSeq = [];
            // Number of Sturm sequence sign variations at roots location interval ends
            var nSignVars;
            // Derivative polynomial values at roots location interval ends
            var fVals;
            if (nRoots > 0) {
                var t1 = 0.0;
                var t2 = 1.0;
                v51 = ifMath.evalPoly(coeffFDeriv, 5, t1);
                if (ifMath.isEqualEps(v51, 0)) {
                    t1 += 0.005;
                    v51 = ifMath.evalPoly(coeffFDeriv, 5, t1);
                }
                v52 = ifMath.evalPoly(coeffFDeriv, 5, t2);
                if (ifMath.isEqualEps(v52, 0)) {
                    t2 -= 0.005;
                    v52 = ifMath.evalPoly(coeffFDeriv, 5, t2);
                }

                if (nRoots > 1) {
                    ifMath.getSturmPRS(coeffFDeriv, 5, coeffFDeriv2, sturmSeq);
                    nSignVars = [];
                    fVals = [v51, v52];
                    nRoots = ifMath.countRootsNSturm(coeffFDeriv, 5, coeffFDeriv2, t1, t2,
                        sturmSeq, nSignVars, fVals);
                }
            }
            if (nRoots == 0) {
                // Might be some error, return the arc
            } else if (nRoots == 1) {
                var r1 = ifMath.locateByNewton(t1, t2, v51, v52, coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005);
                if (r1 == null) {
                    r1 = (t1 + t2) / 2;
                }
                var r1x = ifMath.evalCubic(a1x, b1x, c1x, xA, r1);
                var r1y = ifMath.evalCubic(a1y, b1y, c1y, yA, r1);
                maxDst = Math.abs(ifMath.ptDist(r1x, r1y, xO, yO) - R);
            } else {
                var rIntervals = [];
                ifMath.locRootsSturm(coeffFDeriv, 5, coeffFDeriv2, t1, t2, sturmSeq, nRoots,
                    nSignVars, fVals, rIntervals);

                for (var s = 0; s < rIntervals.length; ++s) {
                    r1 = ifMath.locateByNewton(rIntervals[s][0], rIntervals[s][1],
                        rIntervals[s][2], rIntervals[s][3], coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005,
                        sturmSeq);
                    if (r1 == null) {
                        r1 = (rIntervals[s][0] + rIntervals[s][1]) / 2;
                    }
                    r1x = ifMath.evalCubic(a1x, b1x, c1x, xA, r1);
                    r1y = ifMath.evalCubic(a1y, b1y, c1y, yA, r1);
                    var dst = Math.abs(ifMath.ptDist(r1x, r1y, xO, yO) - R);
                    if (dst > maxDst) {
                        maxDst = dst;
                    }
                }
            }

            // 3. if distance > tolerance => divide && repeat;
            // else => add arc to polyline
            if (maxDst > tolerance && counter < IFVertexOffsetter.MAX_RECURS) {
                var ctrlsNew1X = new Float64Array(4);
                var ctrlsNew1Y = new Float64Array(4);
                var ctrlsNew2X = new Float64Array(4);
                var ctrlsNew2Y = new Float64Array(4);
                ifMath.getCtrlPtsCasteljau(ctrlsx[0], ctrlsx[1], ctrlsx[2], ctrlsx[3], 0.5, null, ctrlsNew1X, ctrlsNew2X);
                ifMath.getCtrlPtsCasteljau(ctrlsy[0], ctrlsy[1], ctrlsy[2], ctrlsy[3], 0.5, null, ctrlsNew1Y, ctrlsNew2Y);
                this._addCubicSegmToPolyline(ctrlsNew1X, ctrlsNew1Y, tolerance, counter);
                this._addCubicSegmToPolyline(ctrlsNew2X, ctrlsNew2Y, tolerance, counter);
            } else {
                var sinGamma = ab / 2 / R;
                // As gamma <= 45 degrees, we are save with the following formmula:
                var tgHalfGamma = sinGamma / (Math.sqrt(1 - sinGamma * sinGamma) + 1);
                // Define curve orientation
                // We can check arc center location against AB
                if (ifMath.segmentSide(xA, yA, xB, yB, xO, yO) > 0) {
                    tgHalfGamma = -tgHalfGamma;
                }
                //tgHalfGamma = this._calculateBulge(xA, yA, xB, yB, xO, yO);
                var arc = new IFVertexOffsetter.PolySegment(new GPoint(xA, yA), tgHalfGamma, new GPoint(xO, yO), R);
                this._polyline.insertSegment(arc);
            }
        }
    };

    IFVertexOffsetter.prototype.generatePolyLine = function (tolerance, startVertex) {
        // The following documents will be used to approximate a bezier curve with polyline
        // (a combination of linear segments and circular arcs):
        //
        // 1. Fast, precise flattening of cubic Be´zier path and offset curves
        // Thomas F. Hain,Athar L. Ahmad, Sri Venkat R. Racherla, David D. Langan, 2005

        //
        // 3. Generalization of Approximation of Planar Spiral Segments by Arc Splines
        // Lan Chen, 1998
        //
        // 4. APPROXIMATION OF A CUBIC BEZIER CURVE BY CIRCULAR ARCS AND VICE VERSA
        // A. Riškus, 2006
        //
        // 5. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012
        var newStartVertex = null;
        var origStartVertex = startVertex;
        var vertex1 = origStartVertex;
        var vertex2 = new IFVertex();
        var polySegm;
        var proceed = true;

        while (proceed && this._source.readVertex(vertex2)) {
            switch (vertex2.command) {
                case IFVertex.Command.Move:
                    if (!origStartVertex || !this._polyline.count) {
                        vertex1 = vertex2;
                        origStartVertex = vertex1;
                        vertex2 = new IFVertex();
                    } else {
                        newStartVertex = vertex2;
                        proceed = false;
                    }
                    break;
                case IFVertex.Command.Line:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                    } else {
                        polySegm = new IFVertexOffsetter.PolySegment(new GPoint(vertex1.x, vertex1.y), 0);
                        this._polyline.insertSegment(polySegm);
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                    }
                    break;

                case IFVertex.Command.Curve:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                    } else {
                        var B0 = new GPoint(vertex1.x, vertex1.y);
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                        if (this._source.readVertex(vertex2)) {
                            var counter = 0;
                            this.addCurveToPolyline(B0, new GPoint(vertex2.x, vertex2.y),
                                new GPoint(vertex1.x, vertex1.y), tolerance, counter);

                            vertex2 = new IFVertex();
                        }
                    }
                    break;

                case IFVertex.Command.Curve2:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                    } else {
                        var B0 = new GPoint(vertex1.x, vertex1.y);
                        var B3 = new GPoint(vertex2.x, vertex2.y);
                        vertex1 = vertex2;
                        vertex2 = new IFVertex();
                        var vertex3 = new IFVertex();
                        if (this._source.readVertex(vertex2) && this._source.readVertex(vertex3)) {
                            this.addCubicCurveToPolyline(B0, new GPoint(vertex2.x, vertex2.y),
                                new GPoint(vertex3.x, vertex3.y), B3, tolerance);

                            vertex2 = new IFVertex();
                        }
                    }
                    break;

                case IFVertex.Command.Close:
                    if (this._polyline) {
                        if (vertex1) {
                            polySegm = new IFVertexOffsetter.PolySegment(new GPoint(vertex1.x, vertex1.y), 0);
                            this._polyline.insertSegment(polySegm);
                            vertex1 = null;
                        }
                        this._polyline.closed = true;
                        polySegm = new IFVertexOffsetter.PolySegment(this._polyline.head.point, 0);
                        this._polyline.insertSegment(polySegm);
                        newStartVertex = new IFVertex();
                        newStartVertex.command = IFVertex.Command.Move;
                        newStartVertex.x = this._polyline.head.point.getX();
                        newStartVertex.y = this._polyline.head.point.getY();
                        proceed = false;
                    }
                    break;

                default:
                    throw new Error("Unknown vertex command: " + vertex.command.toString());
            }
        }
        if (vertex1 && this._polyline.count) {
            polySegm = new IFVertexOffsetter.PolySegment(new GPoint(vertex1.x, vertex1.y), 0);
            this._polyline.insertSegment(polySegm);
            if (ifMath.isEqualEps(vertex1.x, this._polyline.head.point.getX()) &&
                    ifMath.isEqualEps(vertex1.y, this._polyline.head.point.getY())) {

                this._polyline.closed = true;
            }
        }
        return newStartVertex;
    };

    IFVertexOffsetter.prototype.generatePolyOffset = function (offset, inset, outset, tolerance) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

        // 1. for each polySegment, generate polyOffsetSegment
        var polyOffsetOut = null;
        var polyOffsetIn = null;
        if (outset) {
            polyOffsetOut = new IFVertexOffsetter.PolySegmentContainer();
        }
        if (inset) {
            polyOffsetIn = new IFVertexOffsetter.PolySegmentContainer();
        }
        var offsSegm;
        for (var i = 0, curSegm = this._polyline.head; i < this._polyline.count; ++i) {
            if (outset) {
                offsSegm = this._offsetPolySegment(curSegm, -offset, tolerance);
                if (offsSegm) {
                    polyOffsetOut.insertSegment(offsSegm);
                }
            }
            if (inset) {
                offsSegm = this._offsetPolySegment(curSegm, offset, tolerance);
                if (offsSegm) {
                    polyOffsetIn.insertSegment(offsSegm);
                }
            }
            curSegm = curSegm.next;
        }

        // 2. intersect untrimmed
        var polyOutNew = new IFVertexOffsetter.PolySegmentContainer();
        var polyInNew = new IFVertexOffsetter.PolySegmentContainer();
        if (outset) {
            this._trimOffsetPoly(polyOffsetOut, -offset, polyOutNew);
        }
        if (inset) {
            this._trimOffsetPoly(polyOffsetIn, offset, polyInNew);
        }

        // 3. clipping algorithm
        // Step 1. Dual clipping
        var intPtsOut = [];
        var intPtsIn = [];
        if (inset && outset) {
            this._calcIntersectionPoints(polyOutNew, polyInNew, intPtsOut, intPtsIn);
        }
        if (outset) {
            this._calcSelfIntersectionPoints(polyOutNew, intPtsOut);
        }
        if (inset) {
            this._calcSelfIntersectionPoints(polyInNew, intPtsIn);
        }

        if (intPtsOut.length > 0) {
            this._sortInsertsectionPoints(intPtsOut);
        }
        if (intPtsIn.length > 0) {
            this._sortInsertsectionPoints(intPtsIn);
        }

        var tmpArray1Out = [];
        var tmpArray1In = [];
        var outSplit = [];
        var inSplit = [];
        if (outset) {
            if (intPtsOut.length > 0) {
                outSplit = this._splitForClipping(polyOutNew, intPtsOut);
                for (var i = 0; i < outSplit.length; ++i) {
                    var intPts = [];
                    var intPtsMain = [];
                    this._calcIntersectionPoints(outSplit[i], this._polyline, intPts, intPtsMain);
                    if (intPts.length == 0) {
                        tmpArray1Out.push(outSplit[i]);
                    } else if (!this._polyline.closed){
                        var endSegm = false;
                        for (var j = 0; j < intPtsMain.length; ++j) {
                            if (intPtsMain[j].segmIdx == 0 || intPtsMain[j].segmIdx == this._polyline.count - 1) {
                                endSegm = true;
                                break;
                            }
                        }
                        if (endSegm) {
                            this._excludeCircleInside(outSplit[i], intPts, intPtsMain, offset, tmpArray1Out);
                        }
                    }
                }
            } else {
                tmpArray1Out[0] = polyOutNew;
            }
        }
        if (inset) {
            if (intPtsIn.length > 0) {
                inSplit = this._splitForClipping(polyInNew, intPtsIn);
                for (var i = 0; i < inSplit.length; ++i) {
                    var intPts = [];
                    var intPtsMain = [];
                    this._calcIntersectionPoints(inSplit[i], this._polyline, intPts, intPtsMain);
                    if (intPts.length == 0) {
                        tmpArray1In.push(inSplit[i]);
                    } else if (!this._polyline.closed) {
                        var endSegm = false;
                        for (var j = 0; j < intPtsMain.count; ++j) {
                            if (intPtsMain[j].segmIdx == 0 || intPtsMain[j].segmIdx == this._polyline.count - 1) {
                                endSegm = true;
                                break;
                            }
                        }
                        if (endSegm) {
                            this._excludeCircleInside(inSplit[i], intPts, intPtsMain, offset, tmpArray1In);
                        }
                    }
                }
            } else {
                tmpArray1In[0] = polyInNew;
            }
        }

        if (!(inset && outset)) {
            // Step 2. General closest point pair (GCPP) clipping
            this._gcppClipping(tmpArray1Out, this._polyline, offset, this._polyoutset);
            this._gcppClipping(tmpArray1In, this._polyline, offset, this._polyinset);
        } else {
            // For each part from tmpArray if we have a point closer to main polyline than offset, discard the whole
            // part
            // TODO: change 3 with permanent coefficient
            this._gcppFilter(tmpArray1Out, this._polyline, offset, tolerance * 3, this._polyoutset);
            this._gcppFilter(tmpArray1In, this._polyline, offset, tolerance * 3, this._polyinset);
        }
    };

    IFVertexOffsetter.prototype.generateOffset = function (inset, outset, tolerance) {
        // 1. Drawing an elliptical arc using polylines, quadratic or cubic Bezier curves
        // L. Maisonobe, 2003

        if (outset && inset && !this._polyline.closed) {
            // TODO: this._genArc(this._polyoutset[0].head.point,
            //      this._polyinset[0].head.point, this._polyline.head.point, offset, this._outset);
            this._genCurves(this._polyoutset, this._outset, tolerance);
            // TODO: this._genArc(this._polyoutset[this._polyoutset.count].end.point,
            //      this._polyinset[this._polyinset.count].end.point, this._polyline.end.point, offset, this._outset);
            this._genCurves(this._polyinset, this._outset, tolerance);
        } else {
            if (outset) {
                this._genCurves(this._polyoutset, this._outset, tolerance);
            }
            if (inset) {
                this._genCurves(this._polyinset, this._inset, tolerance);
            }
        }

    };

    /**
     *
     * @param segm
     * @param {Number} offset: positive - to the right along the path, negative - to the left
     * @returns {null}
     * @private
     */
    IFVertexOffsetter.prototype._offsetPolySegment = function(segm, offset, tolerance) {
        var newSegm = null;
        var absOffs = Math.abs(offset);
        var x1 = segm.point.getX();
        var y1 = segm.point.getY();
        if (!segm.bulge) {
            if(segm.next || this._polyline.closed) {
                // x(y2 - y1) + y(x1 - x2) + x2y1 - x1y2 = 0
                var x2, y2;
                if (segm.next) {
                    x2 = segm.next.point.getX();
                    y2 = segm.next.point.getY();
                } else { // closed
                    x2 = this._polyline.head.point.getX();
                    y2 = this._polyline.head.point.getY();
                }
                var dist = ifMath.ptDist(x1, y1, x2, y2);
                if (!ifMath.isEqualEps(dist, 0)) {
                    var delta = new GPoint(-offset * (y2 - y1) / dist, -offset * (x1 - x2) / dist);
                    var newPt1 = new GPoint(x1 + delta.getX(), y1 + delta.getY());
                    var newPt2 = new GPoint(x2 + delta.getX(), y2 + delta.getY());
                    newSegm = new IFVertexOffsetter.PolyOffsetSegment(segm.point, newPt1, newPt2, 0);
                } // else do nothing
            } // else do nothing
        } else if (segm.radius) {
            var radius = segm.radius;
            var k = null;
            if (offset * segm.bulge > 0) {
                radius += absOffs;
                k = radius / segm.radius;
            } else if (!ifMath.isEqualEps(segm.radius, absOffs, tolerance)) {
                if (segm.radius > absOffs) {
                    radius -= absOffs;
                    k = radius / segm.radius;
                } else { // segm.radius < absOffs
                    // construct symmetric arc with the same center and radius = absOffs - segm.radius
                    radius = absOffs - segm.radius;
                    k = absOffs / segm.radius;
                }
            }
            if (k != null) {
                var xO = segm.center.getX();
                var yO = segm.center.getY();
                var x2, y2;
                if (segm.next) {
                    x2 = segm.next.point.getX();
                    y2 = segm.next.point.getY();
                } else { // error
                    x2 = this._polyline.head.point.getX();
                    y2 = this._polyline.head.point.getY();
                }
                var newPt1 = new GPoint(xO + k * (x1 - xO), yO + k * (y1 - yO));
                var newPt2 = new GPoint(xO + k * (x2 - xO), yO + k * (y2 - yO));
                newSegm = new IFVertexOffsetter.PolyOffsetSegment(
                    segm.point, newPt1, newPt2, segm.bulge, segm.center, radius);
            }
        }
        return newSegm;
    };

    /**
     *
     * @param {IFVertexOffsetter.PolyOffsetSegment} psegm1
     * @param {IFVertexOffsetter.PolyOffsetSegment} psegm2
     * @param {IFVertexOffsetter.IntersectionResult} intResult
     * @private
     */
    IFVertexOffsetter.prototype._insersectOffsetSegments = function (psegm1, psegm2, intResult) {
        if (psegm1.bulge == 0 && psegm2.bulge == 0) { // line segments
            var res = [null, null];
            var pt = ifMath.getIntersectionPoint(
                psegm1.point.getX(), psegm1.point.getY(), psegm1.point2.getX(), psegm1.point2.getY(),
                psegm2.point.getX(), psegm2.point.getY(), psegm2.point2.getX(), psegm2.point2.getY(), res);

            intResult.point = pt;
            if (pt) {
                this._fillLineIntType(res[0], intResult.intTypes[0]);
                this._fillLineIntType(res[1], intResult.intTypes[1]);
            }
        } else if (psegm1.bulge != 0 && psegm2.bulge == 0 || psegm1.bulge == 0 && psegm2.bulge != 0) { // arc and line
            var res = [null, null];
            var x = null;
            var y = null;
            var t = null;

            if (psegm1.bulge == 0) {
                var xL = psegm1.point.getX();
                var yL = psegm1.point.getY();
                var dxL = psegm1.point2.getX() - psegm1.point.getX();
                var dyL = psegm1.point2.getY() - psegm1.point.getY();
                ifMath.circleLineIntersection(xL, yL, dxL, dyL,
                    psegm2.center.getX(), psegm2.center.getY(), psegm2.radius, res);

                if (res[0] != null) {
                    x = xL + dxL * res[0];
                    y = yL + dyL * res[0];
                    t = res[0];
                }
                if (res[0] != null && res[1] != null) {
                    var x2 = xL + dxL * res[1];
                    var y2 = yL + dyL * res[1];
                    var sDst1 = ifMath.ptSqrDist(x, y, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    var sDst2 = ifMath.ptSqrDist(x2, y2, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    if (sDst2 < sDst1) {
                        x = x2;
                        y = y2;
                        t = res[1];
                    }
                }
                if (t != null) {
                    intResult.point = new GPoint(x, y);
                    // Define point type
                    this._fillLineIntType(t, intResult.intTypes[0]);
                    this._fillArcIntType(psegm2, x, y, intResult.intTypes[1]);
                }
            } else {
                var xL = psegm2.point.getX();
                var yL = psegm2.point.getY();
                var dxL = psegm2.point2.getX() - psegm2.point.getX();
                var dyL = psegm2.point2.getY() - psegm2.point.getY();
                ifMath.circleLineIntersection(xL, yL, dxL, dyL,
                    psegm1.center.getX(), psegm1.center.getY(), psegm1.radius, res);

                if (res[0] != null) {
                    x = xL + dxL * res[0];
                    y = yL + dyL * res[0];
                    t = res[0];
                }
                if (res[0] != null && res[1] != null) {
                    var x2 = xL + dxL * res[1];
                    var y2 = yL + dyL * res[1];
                    var sDst1 = ifMath.ptSqrDist(x, y, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    var sDst2 = ifMath.ptSqrDist(x2, y2, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    if (sDst2 < sDst1) {
                        x = x2;
                        y = y2;
                        t = res[1];
                    }
                }
                if (t != null) {
                    intResult.point = new GPoint(x, y);
                    // Define point type
                    this._fillLineIntType(t, intResult.intTypes[1]);
                    this._fillArcIntType(psegm1, x, y, intResult.intTypes[0]);
                }
            }
        } else { // two arcs
            var res = [null, null];
            ifMath.circleCircleIntersection(psegm1.center.getX(), psegm1.center.getY(), psegm1.radius,
                psegm2.center.getX(), psegm2.center.getY(), psegm2.radius, res);

            var ptIdx = null;
            if (res[0] != null) {
                ptIdx = 0;
            }
            if (res[0] != null && res[1] != null) {
                var sDst1 = ifMath.ptSqrDist(res[0].getX(), res[0].getY(),
                    psegm2.basepoint.getX(), psegm2.basepoint.getY());

                var sDst2 = ifMath.ptSqrDist(res[1].getX(), res[1].getY(),
                    psegm2.basepoint.getX(), psegm2.basepoint.getY());

                if (sDst2 < sDst1) {
                    ptIdx = 1;
                }
            }

            if (ptIdx !== null) {
                intResult.point = res[ptIdx];
                this._fillArcIntType(psegm1, res[ptIdx].getX(), res[ptIdx].getY(), intResult.intTypes[0]);
                this._fillArcIntType(psegm2, res[ptIdx].getX(), res[ptIdx].getY(), intResult.intTypes[1]);
            }
        }
    };

    /**
     * Fills arc intersection type based on the arc segment parameters and intersection point's coordinates
     * @param {IFVertexOffsetter.PolyOffsetSegment} psegm
     * @param {Number} x
     * @param {Number} y
     * @param {IFVertexOffsetter.IntersectionType} intType
     * @private
     */
    IFVertexOffsetter.prototype._fillArcIntType = function (psegm, x, y, intType) {
        // For an arc, if a point not on the arc, let's find arc's central point on the circle, and consider
        // an opposite circle point as a measure for defining a PFIP or NFIP
        var sp1x = psegm.point.getX();
        var sp1y = psegm.point.getY();
        var sp2x = psegm.point2.getX();
        var sp2y = psegm.point2.getY();
        var cX = psegm.center.getX();
        var cY = psegm.center.getY();
        // TODO: process accurately, when segment side is not evident
        if (ifMath.segmentSide(sp1x, sp1y, sp2x, sp2y, x, y) ==
            ifMath.segmentSide(sp1x, sp1y, sp2x, sp2y, cX, cY)) {

            var pMx = (sp1x + sp2x) / 2;
            var pMy = (sp1y + sp2y) / 2;
            var tmp = psegm.radius / ifMath.ptDist(pMx, pMy, cX, cY);
            var pOppX = cX + (cX - pMx) * tmp;
            var pOppY = cY + (cY - pMy) * tmp;
            if (ifMath.segmentSide(sp1x, sp1y, pOppX, pOppY, x, y) ==
                ifMath.segmentSide(sp1x, sp1y, pOppX, pOppY, cX, cY)) {
                intType.FIP = true;
                intType.PFIP = true;
            } else {
                intType.FIP = true;
            }
        } else { // point is on the arc
            intType.TIP = true;
        }
    };

    IFVertexOffsetter.prototype._fillLineIntType = function (param, intType) {
        if (param < 0.0) {
            intType.FIP = true;
        } else if (param > 1.0) {
            intType.FIP = true;
            intType.PFIP = true;
        } else {
            intType.TIP = true;
        }
    };

    /**
     *
     * @param {IFVertexOffsetter.PolySegmentContainer} polyOffset
     * @param {Number} offset
     * @private
     */
    IFVertexOffsetter.prototype._trimOffsetPoly = function (polyOffset, offset, polyONew) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

        var eps = 0.000001; // eps = 10-7 is already too small, as tangence calculation is not so accurate in our case
        var segm1 = null;
        var segm2 = polyOffset.head;
        if (segm2) {
            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                segm2.point, segm2.bulge, segm2.center, segm2.radius));

            var iRes = new IFVertexOffsetter.IntersectionResult();
            for (var i = 0; i < polyOffset.count - 1; ++i) {
                // it is not necessary to recalculate basepoint here,
                // as segm1.basepoint is not needed for further calculations
                segm1 = new IFVertexOffsetter.PolyOffsetSegment(segm2.basepoint, polyONew.end.point, segm2.point2,
                    polyONew.end.bulge, segm2.center, segm2.radius);
                segm2 = segm2.next;

                if (!ifMath.isEqualEps(segm1.point2.getX(), segm2.point.getX(), eps) ||
                        !ifMath.isEqualEps(segm1.point2.getY(), segm2.point.getY(), eps)) {

                    iRes.clear();
                    this._insersectOffsetSegments(segm1, segm2, iRes);

                    if (segm1.bulge == 0 && segm2.bulge == 0) { // Two line segments: use Algorithm 1
                        if (!iRes.point) { // case 1
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));
                        } else if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP || // case 2a
                            iRes.intTypes[0].FIP && iRes.intTypes[1].FIP && iRes.intTypes[0].PFIP) { // case 2b part1
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));
                        } else { // case 2b part2 || case 2c
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else if (segm1.bulge == 0 && segm2.bulge != 0) { // Line segment and arc segment: use Algorithm 2
                        if (iRes.point) { // case 1
                            if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP || // case 1a
                                // TIP && NFIP || PFIP && TIP -> should not be possible, might be some error,
                                // behave the same as when TIP for both
                                iRes.intTypes[0].TIP && iRes.intTypes[1].FIP && !iRes.intTypes[1].PFIP ||
                                iRes.intTypes[0].PFIP && iRes.intTypes[1].TIP) {

                                var ptMx = (iRes.point.getX() + segm2.point2.getX()) / 2;
                                var ptMy = (iRes.point.getY() + segm2.point2.getY()) / 2;
                                var bulge = this._calculateBulge(iRes.point.getX(), iRes.point.getY(),
                                    segm2.point2.getX(), segm2.point2.getY(), segm2.center.getX(), segm2.center.getY(),
                                    segm2.bulge);

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, bulge,
                                    segm2.center, segm2.radius));
                            } else if (iRes.intTypes[0].PFIP && iRes.intTypes[1].FIP) { // case 1b
                                var arc = this._constructJoinArc(segm1, segm2, true);
                                polyONew.insertSegment(arc);
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                                    segm2.point, segm2.bulge, segm2.center, segm2.radius));
                            } else { //iRes.intTypes[0].FIP && !iRes.intTypes[0].PFIP && iRes.intTypes[1].TIP ||  case 1c
                                // iRes.intTypes[0].TIP && iRes.intTypes[1].PFIP)  case 1d

                                // construct new line segment
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                                    segm2.point, segm2.bulge, segm2.center, segm2.radius));
                            }
                        } else { // case 2, construct arc
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else if (segm1.bulge != 0 && segm2.bulge == 0) { // Arc segment and line segment: use Algorithm 3
                        if (iRes.point) { // case 1
                            if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP) { // case 1a
                                var newBulge = this._calculateBulge(segm1.point.getX(), segm1.point.getY(),
                                    iRes.point.getX(), iRes.point.getY(), segm1.center.getX(), segm1.center.getY(),
                                    segm1.bulge);
                                polyONew.end.bulge = newBulge;
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));
                            } else if (iRes.intTypes[0].FIP &&
                                iRes.intTypes[1].FIP && !iRes.intTypes[1].PFIP) { // case 1b

                                var arc = this._constructJoinArc(segm1, segm2, true);
                                polyONew.insertSegment(arc);
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                                //segm2.point, segm2.bulge, segm2.center, segm2.radius));
                            } else { // case 1c, 1d
                                // construct new line segment
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            }
                        } else {
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else { // two arc segments: use Algorithm 4
                        if (iRes.point) { // case 1
                            if (!(iRes.intTypes[0].FIP && !iRes.intTypes[0].PFIP) &&
                                !iRes.intTypes[1].PFIP) { // case 1a

                                var newBulge = this._calculateBulge(segm1.point.getX(), segm1.point.getY(),
                                    iRes.point.getX(), iRes.point.getY(), segm1.center.getX(), segm1.center.getY(),
                                    segm1.bulge);
                                polyONew.end.bulge = newBulge;

                                newBulge = this._calculateBulge(iRes.point.getX(), iRes.point.getY(),
                                    segm2.point2.getX(), segm2.point2.getY(), segm2.center.getX(), segm2.center.getY(),
                                    segm2.bulge);

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                                    iRes.point, newBulge, segm2.center, segm2.radius));
                            } else { // case 1b, construct arc
                                var arc = this._constructJoinArc(segm1, segm2, false);
                                polyONew.insertSegment(arc);

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                                    segm2.point, segm2.bulge, segm2.center, segm2.radius));
                            }
                        } else { // case 2
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);

                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                                segm2.point, segm2.bulge, segm2.center, segm2.radius));
                        }
                    }
                } else {
                    polyONew.insertSegment(new IFVertexOffsetter.PolySegment(
                        segm2.point, segm2.bulge, segm2.center, segm2.radius));
                }
            }
            if (this._polyline.closed) {
                // it is not necessary to recalculate basepoint here,
                // as segm1.basepoint is not needed for further calculations
                segm1 = new IFVertexOffsetter.PolyOffsetSegment(segm2.basepoint, polyONew.end.point, segm2.point2,
                    polyONew.end.bulge, segm2.center, segm2.radius);

                segm2 = polyOffset.head;
                if (!ifMath.isEqualEps(segm1.point2.getX(), segm2.point.getX(), eps) ||
                        !ifMath.isEqualEps(segm1.point2.getY(), segm2.point.getY(), eps)) {

                    iRes.clear();
                    this._insersectOffsetSegments(segm1, segm2, iRes);

                    if (segm1.bulge == 0 && segm2.bulge == 0) { // Two line segments: use Algorithm 1
                        if (!iRes.point) { // case 1
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));
                        } else if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP || // case 2a
                            iRes.intTypes[0].FIP && iRes.intTypes[1].FIP && iRes.intTypes[0].PFIP) { // case 2b part1
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));
                            polyONew.head.point = iRes.point;
                        } else { // case 2b part2 || case 2c
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else if (segm1.bulge == 0 && segm2.bulge != 0) { // Line segment and arc segment: use Algorithm 2
                        if (iRes.point) { // case 1
                            if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP || // case 1a
                                    // TIP && NFIP || PFIP && TIP -> should not be possible, might be some error,
                                    // behave the same as when TIP for both
                                    iRes.intTypes[0].TIP && iRes.intTypes[1].FIP && !iRes.intTypes[1].PFIP ||
                                    iRes.intTypes[0].PFIP && iRes.intTypes[1].TIP) {

                                var bulge = this._calculateBulge(iRes.point.getX(), iRes.point.getY(),
                                    segm2.point2.getX(), segm2.point2.getY(), segm2.center.getX(), segm2.center.getY(),
                                    segm2.bulge);

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));

                                polyONew.head.point = iRes.point;
                                polyONew.head.bulge = bulge;
                            } else if (iRes.intTypes[0].PFIP && iRes.intTypes[1].FIP) { // case 1b
                                var arc = this._constructJoinArc(segm1, segm2, true);
                                polyONew.insertSegment(arc);
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            } else { //iRes.intTypes[0].FIP && !iRes.intTypes[0].PFIP && iRes.intTypes[1].TIP ||  case 1c
                                // iRes.intTypes[0].TIP && iRes.intTypes[1].PFIP)  case 1d

                                // construct new line segment
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            }
                        } else { // case 2, construct arc
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else if (segm1.bulge != 0 && segm2.bulge == 0) { // Arc segment and line segment: use Algorithm 3
                        if (iRes.point) { // case 1
                            if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP) { // case 1a
                                var newBulge = this._calculateBulge(segm1.point.getX(), segm1.point.getY(),
                                    iRes.point.getX(), iRes.point.getY(), segm1.center.getX(), segm1.center.getY(),
                                    segm1.bulge);
                                polyONew.end.bulge = newBulge;
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));
                                polyONew.head.point = iRes.point;
                            } else if (iRes.intTypes[0].FIP &&
                                    iRes.intTypes[1].FIP && !iRes.intTypes[1].PFIP) { // case 1b

                                var arc = this._constructJoinArc(segm1, segm2, true);
                                polyONew.insertSegment(arc);
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            } else { // case 1c, 1d
                                // construct new line segment
                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm1.point2, 0));

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            }
                        } else {
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);
                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    } else { // two arc segments: use Algorithm 4
                        if (iRes.point) { // case 1
                            if (!(iRes.intTypes[0].FIP && !iRes.intTypes[0].PFIP) &&
                                !iRes.intTypes[1].PFIP) { // case 1a

                                var newBulge = this._calculateBulge(segm1.point.getX(), segm1.point.getY(),
                                    iRes.point.getX(), iRes.point.getY(), segm1.center.getX(), segm1.center.getY(),
                                    segm1.bulge);
                                polyONew.end.bulge = newBulge;

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(iRes.point, 0));

                                newBulge = this._calculateBulge(iRes.point.getX(), iRes.point.getY(),
                                    segm2.point2.getX(), segm2.point2.getY(), segm2.center.getX(), segm2.center.getY(),
                                    segm2.bulge);

                                polyONew.head.point = iRes.point;
                                polyONew.head.bulge = newBulge;
                            } else { // case 1b, construct arc
                                var arc = this._constructJoinArc(segm1, segm2, false);
                                polyONew.insertSegment(arc);

                                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                            }
                        } else { // case 2
                            var arc = this._constructJoinArc(segm1, segm2, true);
                            polyONew.insertSegment(arc);

                            polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                        }
                    }
                } else {
                    polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point, 0));
                }
            } else {
                polyONew.insertSegment(new IFVertexOffsetter.PolySegment(segm2.point2, 0));
            }
        }
    };

    /**
     * Construct arc segment from segm1.point2 to segm2.point with center at segm2.basepoint
     * @param {IFVertexOffsetter.PolyOffsetSegment} [segm1]
     * @param {IFVertexOffsetter.PolyOffsetSegment} [segm2]
     * @return {IFVertexOffsetter.PolySegment} [arc] - constructed arc segment
     * @private
     */
    IFVertexOffsetter.prototype._constructJoinArc = function (segm1, segm2, collinear) {
        // Define bulge sign
        var sign = 0;
        if (segm1.bulge) {
            var sb = segm1.bulge > 0 ? 1 : -1;
            var dx = (segm1.point2.getY() - segm1.center.getY()) * sb;
            var dy = (segm1.center.getX() - segm1.point2.getX()) * sb;
            /*if (segm1.bulge < 0) {
                dx = -dx;
                dy = -dy;
            }*/
            sign = -ifMath.segmentSide(segm1.point2.getX(), segm1.point2.getY(),
                segm1.point2.getX() + dx, segm1.point2.getY() + dy,
                segm2.point.getX(), segm2.point.getY()); // * segm1.bulge;
        } else {
            sign = -ifMath.segmentSide(segm1.point.getX(), segm1.point.getY(), segm1.point2.getX(), segm1.point2.getY(),
                segm2.point.getX(), segm2.point.getY());
        }

        if (!collinear) {
            sign = -sign;
        }

        var arc = null;
        var bulge = 0;
        if (sign) {
            bulge = this._calculateBulge(segm1.point2.getX(), segm1.point2.getY(),
                segm2.point.getX(), segm2.point.getY(), segm2.basepoint.getX(), segm2.basepoint.getY(), sign);
        }
        if (bulge) {
            arc = new IFVertexOffsetter.PolySegment(segm1.point2, bulge, segm2.basepoint,
                ifMath.ptDist(segm1.point2.getX(), segm1.point2.getY(), segm2.basepoint.getX(), segm2.basepoint.getY()));
        } else {
            arc = new IFVertexOffsetter.PolySegment(segm1.point2, 0);
        }
        return arc;
    };

    IFVertexOffsetter.prototype._calculateBulge = function (p1x, p1y, p2x, p2y, cx, cy, exampBulge) {
        var d1 = ifMath.ptSqrDist(p1x, p1y, cx, cy);
        var d2 = ifMath.ptSqrDist(p2x, p2y, cx, cy);
        var bulge = 0;
        if (ifMath.isEqualEps(d1, d2, 0.00000001)) {
            // bulge = tg(alpha / 4): dividing 4 is necessary here, because angles > 180 degrees are possible
            var a = ifMath.ptSqrDist((p1x + p2x) / 2, (p1y + p2y) / 2, cx, cy);
            if (ifMath.isEqualEps(a, 0, 0.00000001)) {
                bulge = 1;
            } else {
                var cos2alpha = Math.sqrt(a / d1);
                bulge = Math.sqrt((1 - cos2alpha) / (1 + cos2alpha));
            }
            var r = Math.sqrt(d1);
            var sinp1 = (p1y - cy) / r;
            var cosp1 = (p1x - cx) / r;
            var sinp2 = (p2y - cy) / r;
            var cosp2 = (p2x - cx) / r;
            var sinP1SubP2 = sinp1 * cosp2 - cosp1 * sinp2;
            bulge = sinP1SubP2 < 0 ? -bulge : bulge;
            if (exampBulge && (exampBulge < 0 && bulge > 0 || exampBulge > 0 && bulge < 0)) {
                bulge = -1 / bulge; // tg((2Pi - alpha) / 4) = 1 / tg(alpha / 4), change in sign means direction change
            }
        }
        return bulge;
    };

    /**
     *
     * @param {IFVertexOffsetter.PolySegmentContainer} [polyLn1]
     * @param {IFVertexOffsetter.PolySegmentContainer} [polyLn2]
     * @param {Array} [intPts1]
     * @param {Array} [intPts2]
     * @private
     */
    IFVertexOffsetter.prototype._calcIntersectionPoints = function (polyLn1, polyLn2, intPts1, intPts2) {
        var s1 = polyLn1.head;
        var s2;
        for (var i = 0; i < polyLn1.count - 1; ++i) {
            s2 = polyLn2.head;
            for (var j = 0; j < polyLn2.count - 1; ++j) {
                this._calcSegmIntersectionPoints(s1, s2, i, j, intPts1, intPts2);
                s2 = s2.next;
            }
            s1 = s1.next;
        }
    };

    /**
     *
     * @param {IFVertexOffsetter.PolySegmentContainer} [polyLn]
     * @param {Array} [intPts]
     * @private
     */
    IFVertexOffsetter.prototype._calcSelfIntersectionPoints = function (polyLn, intPts) {
        var s1 = polyLn.head;
        var s2;
        for (var i = 0; i < polyLn.count - 2; ++i) {
            s2 = s1.next;
            for (var j = i + 1; j < polyLn.count - 1; ++j) {
                this._calcSegmIntersectionPoints(s1, s2, i, j, intPts, intPts, j == i + 1);
                s2 = s2.next;
            }
            s1 = s1.next;
        }
    };

    IFVertexOffsetter.prototype._calcSegmIntersectionPoints = function (
            s1, s2, idx1, idx2, intPts1, intPts2, ignoreCommonEnd) {

        if (!s1.bulge && !s2.bulge) {
            if (!ignoreCommonEnd) {
                var res = [null, null];
                var iPt = ifMath.getIntersectionPoint(s1.point.getX(), s1.point.getY(),
                    s1.next.point.getX(), s1.next.point.getY(), s2.point.getX(), s2.point.getY(),
                    s2.next.point.getX(), s2.next.point.getY(), res);
                if (iPt && (0 <= res[0]) && (res[0] <= 1) && (0 <= res[1]) && (res[1] <= 1)) {
                    intPts1.push(new IFVertexOffsetter.IntersectionPt(iPt.getX(), iPt.getY(), res[0], s1, idx1));
                    intPts2.push(new IFVertexOffsetter.IntersectionPt(iPt.getX(), iPt.getY(), res[1], s2, idx2));
                }
            }
        } else if (!s1.bulge && s2.bulge) {
            var res = [null, null];
            var dLx = s1.next.point.getX() - s1.point.getX();
            var dLy = s1.next.point.getY() - s1.point.getY();
            ifMath.circleLineIntersection(s1.point.getX(), s1.point.getY(), dLx, dLy,
                s2.center.getX(), s2.center.getY(), s2.radius, res);

            if (res[0] != null && res[0] >= 0 && res[0] <= 1 && (!ignoreCommonEnd || !ifMath.isEqualEps(res[0], 1))) {
                var x = s1.point.getX() + dLx * res[0];
                var y = s1.point.getY() + dLy * res[0];

                var bulge = this._calculateBulge(s2.point.getX(), s2.point.getY(), x, y,
                    s2.center.getX(), s2.center.getY(), s2.bulge);

                if (bulge < 0 && bulge >= s2.bulge || bulge > 0 && bulge <= s2.bulge) {
                    intPts1.push(new IFVertexOffsetter.IntersectionPt(x, y, res[0], s1, idx1));
                    intPts2.push(new IFVertexOffsetter.IntersectionPt(x, y, bulge, s2, idx2));
                }
            }

            if (res[1] != null && res[1] >= 0 && res[1] <= 1 && (!ignoreCommonEnd || !ifMath.isEqualEps(res[1], 1))) {
                var x = s1.point.getX() + dLx * res[1];
                var y = s1.point.getY() + dLy * res[1];

                var bulge = this._calculateBulge(s2.point.getX(), s2.point.getY(), x, y,
                s2.center.getX(), s2.center.getY(), s2.bulge);

                if (bulge < 0 && bulge >= s2.bulge || bulge > 0 && bulge <= s2.bulge) {
                    intPts1.push(new IFVertexOffsetter.IntersectionPt(x, y, res[1], s1, idx1));
                    intPts2.push(new IFVertexOffsetter.IntersectionPt(x, y, bulge, s2, idx2));
                }
            }
        } else if (s1.bulge && !s2.bulge) {
            var res = [null, null];
            var dLx = s2.next.point.getX() - s2.point.getX();
            var dLy = s2.next.point.getY() - s2.point.getY();
            ifMath.circleLineIntersection(s2.point.getX(), s2.point.getY(), dLx, dLy,
                s1.center.getX(), s1.center.getY(), s1.radius, res);

            if (res[0] != null && res[0] >= 0 && res[0] <= 1 && (!ignoreCommonEnd || !ifMath.isEqualEps(res[0], 0))) {
                var x = s2.point.getX() + dLx * res[0];
                var y = s2.point.getY() + dLy * res[0];
                var bulge = this. _calculateBulge(s1.point.getX(), s1.point.getY(), x, y,
                    s1.center.getX(), s1.center.getY(), s1.bulge);

                if (bulge < 0 && bulge >= s1.bulge || bulge > 0 && bulge <= s1.bulge) {
                    intPts1.push(new IFVertexOffsetter.IntersectionPt(x, y, bulge, s1, idx1));
                    intPts2.push(new IFVertexOffsetter.IntersectionPt(x, y, res[0], s2, idx2));
                }
            }

            if (res[1] != null && res[1] >= 0 && res[1] <= 1 && (!ignoreCommonEnd || !ifMath.isEqualEps(res[1], 0))) {
                var x = s2.point.getX() + dLx * res[1];
                var y = s2.point.getY() + dLy * res[1];
                var bulge = this. _calculateBulge(s1.point.getX(), s1.point.getY(), x, y,
                    s1.center.getX(), s1.center.getY(), s1.bulge);

                if (bulge < 0 && bulge >= s1.bulge || bulge > 0 && bulge <= s1.bulge) {
                    intPts1.push(new IFVertexOffsetter.IntersectionPt(x, y, bulge, s1, idx1));
                    intPts2.push(new IFVertexOffsetter.IntersectionPt(x, y, res[1], s2, idx2));
                }
            }
        } else { // s1.bulge && s2.bulge
            var res = [null, null];
            ifMath.circleCircleIntersection(s1.center.getX(), s1.center.getY(), s1.radius,
                s2.center.getX(), s2.center.getY(), s2.radius, res);

            if (res[0] && (!ignoreCommonEnd ||
                    !ifMath.isEqualEps(res[0].getX(), s2.point.getX()) &&
                    !ifMath.isEqualEps(res[0].getY(), s2.point.getY()))) {

                var bulge01 = this. _calculateBulge(s1.point.getX(), s1.point.getY(),
                    res[0].getX(), res[0].getY(), s1.center.getX(), s1.center.getY(), s1.bulge);

                if (bulge01 < 0 && bulge01 >= s1.bulge || bulge01 > 0 && bulge01 <= s1.bulge) {
                    var bulge02 = this. _calculateBulge(s2.point.getX(), s2.point.getY(),
                        res[0].getX(), res[0].getY(), s2.center.getX(), s2.center.getY(), s2.bulge);

                    if (bulge02 < 0 && bulge02 >= s2.bulge || bulge02 > 0 && bulge02 <= s2.bulge) {
                        intPts1.push(new IFVertexOffsetter.IntersectionPt(res[0].getX(), res[0].getY(),
                            bulge01, s1, idx1));

                        intPts2.push(new IFVertexOffsetter.IntersectionPt(res[0].getX(), res[0].getY(),
                            bulge02, s2, idx2));
                    }
                }
            }

            if (res[1] && (!ignoreCommonEnd ||
                    !ifMath.isEqualEps(res[1].getX(), s2.point.getX()) &&
                    !ifMath.isEqualEps(res[1].getY(), s2.point.getY()))) {

                var bulge11 = this. _calculateBulge(s1.point.getX(), s1.point.getY(),
                    res[1].getX(), res[1].getY(), s1.center.getX(), s1.center.getY(), s1.bulge);

                if (bulge11 < 0 && bulge11 >= s1.bulge || bulge11 > 0 && bulge11 <= s1.bulge) {
                    var bulge12 = this. _calculateBulge(s2.point.getX(), s2.point.getY(),
                        res[1].getX(), res[1].getY(), s2.center.getX(), s2.center.getY(), s2.bulge);

                    if (bulge12 < 0 && bulge12 >= s2.bulge || bulge12 > 0 && bulge12 <= s2.bulge) {
                        intPts1.push(new IFVertexOffsetter.IntersectionPt(res[1].getX(), res[1].getY(),
                            bulge11, s1, idx1));

                        intPts2.push(new IFVertexOffsetter.IntersectionPt(res[1].getX(), res[1].getY(),
                            bulge12, s2, idx2));
                    }
                }
            }
        }
    };

    IFVertexOffsetter.prototype._sortInsertsectionPoints = function (intPts) {
        intPts.sort(function (p1, p2) {
            return (p1.segmIdx != p2.segmIdx ? p1.segmIdx - p2.segmIdx :
                (p1.slope > 0) ? p1.slope - p2.slope : p2.slope - p1.slope);
        });
    };

    /**
     *
     * @param {IFVertexOffsetter.PolySegmentContainer} polyLn
     * @param {Array{IFVertexOffsetter.IntersectionPt}} intPts
     * @return {Array} split
     * @private
     */
    IFVertexOffsetter.prototype._splitForClipping = function (polyLn, intPts) {
        var eps = 0.000001;
        var startSegm = polyLn.head;
        var startIdx = 0;
        var segm = startSegm;
        var segmOrig = segm;
        var bulge;
        var split = [];
        for (var i = 0; i < intPts.length; ++i) {
            split[i] = new IFVertexOffsetter.PolySegmentContainer();

            for (var j = startIdx; j < intPts[i].segmIdx; ++j) {
                split[i].insertSegment(new IFVertexOffsetter.PolySegment(
                    segm.point, segm.bulge, segm.center, segm.radius));

                segm = segmOrig.next;
                segmOrig = segm;
            }
            if (!segm.bulge) {
                split[i].insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                if (!ifMath.isEqualEps(intPts[i].x, segm.point.getX(), eps) ||
                        !ifMath.isEqualEps(intPts[i].y, segm.point.getY(), eps)) {

                    segm = new IFVertexOffsetter.PolySegment(new GPoint(intPts[i].x, intPts[i].y), 0);
                    split[i].insertSegment(segm);
                }
            } else {
                if (!ifMath.isEqualEps(intPts[i].x, segm.point.getX(), eps) ||
                    !ifMath.isEqualEps(intPts[i].y, segm.point.getY(), eps)) {

                    if (segm == segmOrig) {
                        split[i].insertSegment(new IFVertexOffsetter.PolySegment(
                            segm.point, intPts[i].slope, segm.center, segm.radius));
                    } else {
                        // TODO: check formula here
                        bulge = (intPts[i].slope - intPts[i-1].slope) / (1 + intPts[i].slope * intPts[i-1].slope);
                        split[i].insertSegment(new IFVertexOffsetter.PolySegment(
                            segm.point, bulge, segm.center, segm.radius));
                    }

                    split[i].insertSegment(new IFVertexOffsetter.PolySegment(new GPoint(intPts[i].x, intPts[i].y), 0));

                    // TODO: check formula here
                    bulge = (segmOrig.bulge - intPts[i].slope) / (1 + segmOrig.bulge * intPts[i].slope);
                    segm = new IFVertexOffsetter.PolySegment(
                        new GPoint(intPts[i].x, intPts[i].y), bulge, segm.center, segm.radius);
                } else {
                    split[i].insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                }
            }
            startIdx = j;
            if (ifMath.isEqualEps(intPts[i].x, segmOrig.next.point.getX(), eps) &&
                    ifMath.isEqualEps(intPts[i].y, segmOrig.next.point.getY(), eps)) {

                ++startIdx;
                segm = segmOrig.next;
                segmOrig = segm;
            }
        }
        var joinends = this._polyline.closed;
        if (startIdx != polyLn.count - 1) {
            split[i] = new IFVertexOffsetter.PolySegmentContainer();
            for (var j = startIdx; j < polyLn.count; ++j) {
                split[i].insertSegment(new IFVertexOffsetter.PolySegment(
                    segm.point, segm.bulge, segm.center, segm.radius));

                segm = segmOrig.next;
                segmOrig = segm;
            }
        } else {
            joinends = false;
        }
        if (split[0].count == 1) {
            split = split.slice(1);
            joinends = false;
        }
        if (joinends) {
            var len = split.length;
            var lastPLn = split[len-1];
            var endPt = lastPLn.end.point;
            var startPt = split[0].head.point;
            if (len > 1 && ifMath.isEqualEps(endPt.getX(), startPt.getX(), eps) &&
                    ifMath.isEqualEps(endPt.getY(), startPt.getY(), eps)) {

                lastPLn.deleteSegment(lastPLn.end);
                segm = split[0].head;
                for (var i = 0; i < split[0].count; ++i) {
                    lastPLn.insertSegment(new IFVertexOffsetter.PolySegment(
                        segm.point, segm.bulge, segm.center, segm.radius));

                    segm = segm.next;
                }
                split = split.slice(1);
            } else {
                split[0].closed = true;
            }
        }
        // TODO: fix here to be more accurate originally !!! instead

        var splitLast = [];
        for (var i = 0; i < split.length; ++i) {
            if (split[i].count != 1) {
                splitLast.push(split[i]);
            }
        }

        return splitLast;
    };

    IFVertexOffsetter.prototype._excludeCircleInside = function (polyLn, intPts, intPtsMain, offset, resArray) {
        // TODO: process cases, when several segments appears inside of the circle
        var segmIdx = 0;
        var segm = new IFVertexOffsetter.PolySegment(polyLn.head.point, polyLn.head.bulge,
            polyLn.head.center, polyLn.head.radius);

        var s = polyLn.head;
        var tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
        for (var i = 0; i < intPts.length; ++i) {
            for (var j = segmIdx; j < intPts[i].segmIdx - 1; ++j) {
                tmpPoly.insertSegment(segm);
                s = s.next;
                segm = new IFVertexOffsetter.PolySegment(s.point, s.bulge, s.center, s.radius);
            }

            if (!segm.bulge) {
                var res = [null, null];
                var dLx = s.next.point.getX() - segm.point.getX();
                var dLy = s.next.point.getY() - segm.point.getY();
                ifMath.circleLineIntersection(segm.point.getX(), segm.point.getY(), dLx, dLy,
                    intPtsMain[i].x, intPtsMain[i].y, offset, res);

                if (res[0] != null) {
                    if (res[0] <= 0) {
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                        resArray.push(tmpPoly);
                    } else if (res[0] > 0 && res[0] < 1) {
                        var x = segm.point.getX() + dLx * res[0];
                        var y = segm.point.getY() + dLy * res[0];
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(new GPoint(x, y), 0));
                        resArray.push(tmpPoly);
                    } else {
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(s.next.point, 0));
                        resArray.push(tmpPoly);
                    }
                }
                if (res[1] != null && res[1] > res[0] && res[1] < 1) {
                    tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
                    x = segm.point.getX() + dLx * res[1];
                    y = segm.point.getY() + dLy * res[1];
                    segm = new IFVertexOffsetter.PolySegment(new GPoint(x, y), 0);
                } else {
                    tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
                }
            } else {
                var res = [null, null];
                ifMath.circleCircleIntersection(s.center.getX(), s.center.getY(), s.radius,
                    intPtsMain[i].x, intPtsMain[i].y, offset, res);

                if (res[0] != null) {
                    var bulge0 = this. _calculateBulge(segm.point.getX(), segm.point.getY(),
                        res[0].getX(), res[0].getY(), s.center.getX(), s.center.getY(), segm.bulge);

                    if (bulge0 < 0 && bulge0 > segm.bulge || bulge0 > 0 && bulge0 < segm.bulge) {
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(segm.point, bulge0, s.center, s.radius));
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(res[0], 0));
                        resArray.push(tmpPoly);
                    } else {
                        tmpPoly.insertSegment(new IFVertexOffsetter.PolySegment(segm.point, 0));
                        resArray.push(tmpPoly);
                    }
                }

                if (res[1] != null) {
                    var bulge1 = this. _calculateBulge(segm.point.getX(), segm.point.getY(),
                        res[1].getX(), res[1].getY(), s.center.getX(), s.center.getY(), segm.bulge);

                    if (bulge1 < 0 && bulge1 > segm.bulge && bulge1 < bulge0 ||
                            bulge1 > 0 && bulge1 < segm.bulge && bulge1 > bulge0) {

                        tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
                        // TODO: check formula here
                        var bulge = (segm.bulge - bulge1) / (1 + segm.bulge * bulge1);
                        segm = new IFVertexOffsetter.PolySegment(new GPoint(x, y), bulge, s.center, s.radius);
                    } else {
                        tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
                    }
                } else {
                    tmpPoly = new IFVertexOffsetter.PolySegmentContainer();
                }
            }
            segmIdx = intPts[i].segmIdx;
        }
        for (var j = segmIdx; j < polyLn.count; ++j) {
            if (segm) {
                tmpPoly.insertSegment(segm);
                s = s.next;
                segm = s ? new IFVertexOffsetter.PolySegment(s.point, s.bulge, s.center, s.radius) : null;
            }
        }
    };

    /**
     *
     * @param {Array{IFVertexOffsetter.PolySegmentContainer}} [polyLns]
     * @param {IFVertexOffsetter.PolySegmentContainer} [basePolyLn]
     * @param {Number} offset
     * @param {Array{IFVertexOffsetter.PolySegmentContainer}} [resPolyLns]
     * @private
     */
    IFVertexOffsetter.prototype._gcppClipping = function (polyLns, basePolyLn, offset, resPolyLns) {
        var poln;
        for (var i = 0; i < polyLns.length; ++i) {
            poln = polyLns[i];

            // Find GCPPs from each segment of basePolyLn to poln
            var s1 = basePolyLn.head;
            for (var j = 0; j < basePolyLn.count - 1; ++j) {
                var s2 = poln.head;
                for (var k = 0; k < poln.count - 1; ++k) {
                    // TODO: implement (not critical for the first version)
                    s2 = s2.next;
                }
                s1 = s1.next;
            }
            resPolyLns.push(poln);
        }
    };

    /**
     *
     * @param {Array{IFVertexOffsetter.PolySegmentContainer}} [polyLns]
     * @param {IFVertexOffsetter.PolySegmentContainer} [basePolyLn]
     * @param {Number} offset
     * @param {Array{IFVertexOffsetter.PolySegmentContainer}} [resPolyLns]
     * @private
     */
    IFVertexOffsetter.prototype._gcppFilter = function (polyLns, basePolyLn, offset, tolerance, resPolyLns) {
        var poln;
        var sqrOffset = (offset - tolerance) * (offset - tolerance);
        var sqrDst;
        var dst;
        var threshold = offset + tolerance;
        var sqrTrsh = threshold * threshold;
        for (var i = 0; i < polyLns.length; ++i) {
            poln = polyLns[i];

            // Find GCPPs from each segment of basePolyLn to poln
            var s1 = basePolyLn.head;
            sqrDst = sqrTrsh;
            for (var j = 0; j < basePolyLn.count - 1 && sqrDst >= sqrOffset; ++j) {
                var s2 = poln.head;
                for (var k = 0; k < poln.count - 1 && sqrDst >= sqrOffset; ++k) {
                    sqrDst = this._getPlSegmSqrDist(s1, s1.next.point, s2, s2.next.point, threshold);
                    s2 = s2.next;
                }
                s1 = s1.next;
            }
            if (sqrDst >= sqrOffset) {
                resPolyLns.push(poln);
            }
        }
    };

    IFVertexOffsetter.prototype._getPlSegmSqrDist = function (s1, pt12, s2, pt22, threshold) {
        var res;
        if (!s1.bulge && !s2.bulge) {
            res = ifMath.getSegmToSegmSqrDist(s1.point, pt12, s2.point, pt22);
        } else if (!s2.bulge) {
            res = this._getSegmToArcSqrDist(s1.point, s1.bulge, s1.center, s1.radius, pt12, s2.point, pt22, threshold * threshold);
        } else if (!s1.bulge) {
            res = this._getSegmToArcSqrDist(s2.point, s2.bulge, s2.center, s2.radius, pt22, s1.point, pt12, threshold * threshold);
        } else {
            res = this._getArcToArcSqrDist(s1, pt12, s2, pt22, threshold);
        }
        return res;
    };

    IFVertexOffsetter.prototype._getSegmToArcSqrDist = function (apt1, bulge, cntr, rd, apt2, spt1, spt2, threshold) {
        if (ifMath.isEqualEps(spt1.getX(), spt2.getX()) && ifMath.isEqualEps(spt1.getY(), spt2.getY())) {
            return this._getPtToArcSqrDist(apt1, bulge, cntr, rd, apt2, spt1);
        }

        var res = threshold;
        var dst;
        var intRes = [null, null];
        var dxL = spt2.getX() - spt1.getX();
        var dyL = spt2.getY() - spt1.getY();
        ifMath.circleLineIntersection(spt1.getX(), spt1.getY(), dxL, dyL, cntr.getX(), cntr.getY(), rd, intRes);
        if (intRes[0] != null && intRes[1] == null) {
            // Check if distance is 0
            var ptBulge = this._calculateBulge(apt1.getX(), apt1.getY(), intRes[0].getX(), intRes[0].getY(),
                cntr.getX(), cntr.getY(), bulge);

            var dxL1 = intRes[1].getX() - spt1.getX();
            var dyL1 = intRes[1].getY() - spt1.getY();
            if ((dxL1 < 0 && dxL <= dxL1 || dxL1 >= 0 && dxL >= dxL1) &&
                    (dyL1 < 0 && dyL <= dyL1 || dyL1 >= 0 && dyL >= dyL1)) {

                // tangential point at segment => min dist 0 or at arc end
                if (ptBulge < 0 && bulge <= ptBulge || ptBulge >= 0 && bulge >= ptBulge) {
                    res = 0;
                } else {
                    res = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                        apt1.getX(), apt1.getY());

                    dst = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                        apt2.getX(), apt2.getY());

                    if (dst < res) {
                        res = dst;
                    }
                }
            } else {
                // min dist at segment end
                res = this._getPtToArcSqrDist(apt1, bulge, cntr, rd, apt2, spt1);
                dst = this._getPtToArcSqrDist(apt1, bulge, cntr, rd, apt2, spt2);
                if (dst < res) {
                    res = dst;
                }
            }
        } else {
            if (intRes[0] == null) {
                // Find a circle point at which tangential line is parallel to segment
                var ptMin = [null];
                dst = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                    cntr.getX(), cntr.getY(), ptMin);

                if (ptMin[0] > 0 && ptMin < 1) {
                    var mptX = spt1.getX() + ptMin[0] * (spt2.getX() - spt1.getX());
                    var mptY = spt1.getY() + ptMin[0] * (spt2.getY() - spt1.getY());
                    var tmp = rd / Math.sqrt(dst);
                    var tptX = cntr.getX() + tmp * (mptX - cntr.getX());
                    var tptY = cntr.getY() + tmp * (mptY - cntr.getY());
                    var tptBulge = this._calculateBulge(apt1.getX(), apt1.getY(), tptX, tptY,
                        cntr.getX(), cntr.getY(), bulge);

                    if (tptBulge < 0 && bulge <= tptBulge || tptBulge >= 0 && bulge >= tptBulge) {
                        res = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                            tptX, tptY);
                    }
                }
            }
            dst = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                apt1.getX(), apt1.getY());

            if (dst < res) {
                res = dst;
            }

            if (res > 0) {
                dst = ifMath.sqrSegmentDist(spt1.getX(), spt1.getY(), spt2.getX(), spt2.getY(),
                    apt2.getX(), apt2.getY());

                if (dst < res) {
                    res = dst;
                }

                if (res > 0) {
                    dst = this._getPtToArcSqrDist(apt1, bulge, cntr, rd, apt2, spt1);
                    if (dst < res) {
                        res = dst;
                    }

                    if (res > 0) {
                        dst = this._getPtToArcSqrDist(apt1, bulge, cntr, rd, apt2, spt2);
                        if (dst < res) {
                            res = dst;
                        }
                    }
                }
            }
        }
        return res;
    };

    IFVertexOffsetter.prototype._getPtToArcSqrDist = function (apt1, bulge, cntr, rd, apt2, pt) {
        var res;
        var sqrDst = ifMath.ptSqrDist(pt.getX(), pt.getY(), cntr.getX(), cntr.getY());
        if (ifMath.isEqualEps(sqrDst, 0)) {
            res = rd * rd;
        } else {
            var tmp = rd / Math.sqrt(sqrDst);
            var tptX = cntr.getX() + tmp * (pt.getX() - cntr.getX());
            var tptY = cntr.getY() + tmp * (pt.getY() - cntr.getY());
            var tptBulge = this._calculateBulge(apt1.getX(), apt1.getY(), tptX, tptY,
                cntr.getX(), cntr.getY(), bulge);

            if (tptBulge < 0 && bulge <= tptBulge || tptBulge >= 0 && bulge >= tptBulge) {
                res = ifMath.ptSqrDist(pt.getX(), pt.getY(), tptX, tptY);
            } else {
                res = ifMath.ptSqrDist(pt.getX(), pt.getY(), apt1.getX(), apt1.getY());
                sqrDst = ifMath.ptSqrDist(pt.getX(), pt.getY(), apt2.getX(), apt2.getY());
                if (sqrDst < res) {
                    res = sqrDst;
                }
            }
        }
        return res;
    };

    IFVertexOffsetter.prototype._getArcToArcSqrDist = function (s1, pt12, s2, pt22, threshold) {
        var c1x = s1.center.getX();
        var c1y = s1.center.getY();
        var c2x = s2.center.getX();
        var c2y = s2.center.getY();
        var tmp = s1.radius + s2.radius + threshold;
        var sqrTrsh = threshold * threshold;

        if (ifMath.ptSqrDist(c1x, c1y, c2x, c2y) > tmp * tmp) {
            return sqrTrsh;
        }

        var res = null;
        var pts1 = [s1.point, pt12];
        var pts2 = [s2.point, pt22];
        var intRes = [null, null];
        ifMath.circleCircleIntersection(c1x, c1y, s1.radius, c2x, c2y, s2.radius, intRes);

        var ptBulge;
        var ata1;
        var ata2;
        for (var i = 0; i < 2 && intRes[i] != null && res === null; ++i) {
            ptBulge = this._calculateBulge(s1.point.getX(), s1.point.getY(), intRes[i].getX(), intRes[i].getY(),
                s1.center.getX(), s1.center.getY(), s1.bulge);

            ata1 = ptBulge < 0 && s1.bulge <= ptBulge || ptBulge >= 0 && s1.bulge >= ptBulge;

            ptBulge = this._calculateBulge(s2.point.getX(), s2.point.getY(), intRes[i].getX(), intRes[i].getY(),
                s2.center.getX(), s2.center.getY(), s2.bulge);

            ata2 = ptBulge < 0 && s2.bulge <= ptBulge || ptBulge >= 0 && s2.bulge >= ptBulge;

            if (ata1 && ata2) {
                res = 0;
            } else if (ata1) {
                pts1.push(intRes[i]);
            } else if (ata2) {
                pts2.push(intRes[i]);
            }
        }
        if (!intRes[0] && (!ifMath.isEqualEps(c1x, c2x) || !ifMath.isEqualEps(c1y, c2y))){
            var dxL = c2x - c1x;
            var dyL = c2y - c1y;
            var intLRes = [null, null];
            ifMath.circleLineIntersection(c1x, c1y, dxL, dyL, c2x, c2y, s2.radius, intLRes);
            var ptx;
            var pty;
            for (var i = 0; i < 2 && intLRes[i] != null; ++i) {
                ptx = c1x + dxL * intLRes[i];
                pty = c1y + dyL * intLRes[i];

                ptBulge = this._calculateBulge(s2.point.getX(), s2.point.getY(), ptx, pty,
                    s2.center.getX(), s2.center.getY(), s2.bulge);

                ata2 = ptBulge < 0 && s2.bulge <= ptBulge || ptBulge >= 0 && s2.bulge >= ptBulge;

                if (ata2) {
                    pts2.push(new GPoint(ptx, pty));
                }
            }
            dxL = -dxL;
            dyL = -dyL;
            intLRes = [null, null];
            ifMath.circleLineIntersection(c2x, c2y, dxL, dyL, c1x, c1y, s1.radius, intLRes);
            for (var i = 0; i < 2 && intLRes[i] != null; ++i) {
                ptx = c2x + dxL * intLRes[i];
                pty = c2y + dyL * intLRes[i];

                ptBulge = this._calculateBulge(s1.point.getX(), s1.point.getY(), ptx, pty,
                    s1.center.getX(), s1.center.getY(), s1.bulge);

                ata1 = ptBulge < 0 && s1.bulge <= ptBulge || ptBulge >= 0 && s1.bulge >= ptBulge;

                if (ata1) {
                    pts1.push(new GPoint(ptx, pty));
                }
            }
        }
        if (res !== 0) {
            res = sqrTrsh;
            var dst;
            for (var i = 0; i < pts1.length && res > 0; ++i) {
                dst = this._getPtToArcSqrDist(s2.point, s2.bulge, s2.center, s2.radius, pt22, pts1[i]);
                if (dst < res) {
                    res = dst;
                }
            }
            for (var i = 0; i < pts2.length && res > 0; ++i) {
                dst = this._getPtToArcSqrDist(s1.point, s1.bulge, s1.center, s1.radius, pt12, pts2[i]);
                if (dst < res) {
                    res = dst;
                }
            }
        }
        return res;
    };

    IFVertexOffsetter.prototype._genCurves = function (polyLns, outset, tolerance) {
        var poln;
        for (var i = 0; i < polyLns.length; ++i) {
            poln = polyLns[i];
            var segm = poln.head;
            var part = new IFVertexContainer();
            part.addVertex(IFVertex.Command.Move, segm.point.getX(), segm.point.getY());
            for (var j = 0; j < poln.count - 1; ++j) {
                if (!segm.bulge) {
                    part.addVertex(IFVertex.Command.Line, segm.next.point.getX(), segm.next.point.getY());
                } else {
                    // Construct Bezier curves
                    this._genBeziers(segm.point, segm.next.point, segm.bulge, segm.center, segm.radius, tolerance, part);
                }
                segm = segm.next;
            }
            outset.push(part);
        }
    };

    IFVertexOffsetter.prototype._genBeziers = function (
            p1, p2, bulge, cntr, radius, tolerance, target) {

        // Drawing an elliptical arc using polylines, quadratic or cubic Bezier curves
        // L. Maisonobe, 2003

        // bulge == tg(angleDelta / 4)
        // 1. count number of cubic Bezier curves to satisfy tolerance
        var alpha = Math.abs(Math.atan(bulge) * 4);
        var n = Math.ceil(alpha * 2 / Math.PI);
        alpha = alpha / n;
        while (n <= 32 && this._getCubicBezierArcError(alpha, radius) > tolerance) {
            alpha = alpha / 2;
            n = n * 2;
        }

        // 2. Divide arc into n sub-arcs, and approximate each arc with the cubic Bezier curve
        if (bulge > 0) {
            alpha = -alpha;
        }
        var cosAlpha = Math.cos(alpha);
        var sinAlpha = Math.sin(alpha);
        //var tgHalfAlpha = sinAlpha / (cosAlpha + 1);
        //var tgHalfAlpha = Math.sqrt((1- cosAlpha) / (1 + cosAlpha));
        //var k = radius * sinAlpha * (Math.sqrt(4 + 3 * tgHalfAlpha * tgHalfAlpha) - 1) / 3;
        var tgHalfAlphaSqr = (1- cosAlpha) / (1 + cosAlpha);
        var k = radius * sinAlpha * (Math.sqrt(4 + 3 * tgHalfAlphaSqr) - 1) / 3;
        var cosPhi2 = (p1.getX() - cntr.getX()) / radius;
        var sinPhi2 = (p1.getY() - cntr.getY()) / radius;
        var cosPhi, sinPhi;
        var x3 = p1.getX();
        var y3 = p1.getY();
        var x0, y0, x1, y1, x2, y2;
        for (var i = 0; i < n; ++i) {
            x0 = x3;
            y0 = y3;
            /*if (i == n - 1) {
                x3 = p2.getX();
                y3 = p2.getY();
            } else {*/
                cosPhi = cosPhi2;
                sinPhi = sinPhi2;
                cosPhi2 = cosPhi * cosAlpha - sinPhi * sinAlpha;
                sinPhi2 = sinPhi * cosAlpha + cosPhi * sinAlpha;
                x3 = cntr.getX() + radius * cosPhi2;
                y3 = cntr.getY() + radius * sinPhi2;
            //}
            x1 = x0 - k * sinPhi;
            y1 = y0 + k * cosPhi;
            x2 = x3 + k * sinPhi2;
            y2 = y3 - k * cosPhi2;

            target.addVertex(IFVertex.Command.Curve2, x3, y3);
            target.addVertex(IFVertex.Command.Curve2, x1, y1);
            target.addVertex(IFVertex.Command.Curve2, x2, y2);
        }
    };

    IFVertexOffsetter.prototype._getCubicBezierArcError = function (alpha, radius) {
        var k = 5.15347174 * radius;
        var cosAlpha = Math.cos(alpha);
        var cosAlphaSqr = cosAlpha * cosAlpha;
        var cos2Alpha = 2 * cosAlphaSqr - 1;
        var cos3Alpha = (4 * cosAlphaSqr - 3) * cosAlpha;
        var c0 = -19.65763511 + 0.00022979 * cosAlpha + 0.00042715 * cos2Alpha + 0.00103256 * cos3Alpha;
        var c1 = 9.92683097 + 0.00045907 * cosAlpha + 0.00174813 * cos2Alpha - 0.00034153 * cos3Alpha;
        return k * Math.exp(c0 + c1 * alpha);
    };

    IFVertexOffsetter.prototype._rewindVertices = function (outset) {
        var polyLns = outset ? this._outset : this._inset;

        for (var i = 0; i < polyLns.length; ++i) {
            polyLns[i].rewindVertices(0);
        }
    };

    IFVertexOffsetter.prototype._readVertex = function (vertex, outset) {
        if (outset) {
            if (this._outset[this._outsetIdx] && this._outset[this._outsetIdx].readVertex(vertex)) {
                return true;
            } else {
                ++this._outsetIdx;
                return (this._outset[this._outsetIdx] && this._outset[this._outsetIdx].readVertex(vertex));
            }
        } else { // inset
            if (this._inset[this._insetIdx] && this._inset[this._insetIdx].readVertex(vertex)) {
                return true;
            } else {
                ++this._insetIdx;
                return (this._inset[this._insetIdx] && this._inset[this._insetIdx].readVertex(vertex));
            }
        }
    };

    /** @override */
    IFVertexOffsetter.prototype.toString = function () {
        return "[Object IFVertexOffsetter]";
    };

    _.IFVertexOffsetter = IFVertexOffsetter;
})(this);