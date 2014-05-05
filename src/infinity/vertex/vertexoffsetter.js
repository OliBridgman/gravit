(function (_) {
    /**
     * @class GXVertexOffsetter
     * @extends GXVertexSource
     * @param {GXVertexSource} source the underyling vertex source to work on
     * @param {Number} offset
     * @param {Boolean} inset
     * @param {Boolean} outset
     * @version 1.0
     * @constructor
     */
    function GXVertexOffsetter(source, offset, inset, outset) {
        this._source = source;
        this._polyline = new GXVertexOffsetter.PolySegmentContainer();
        this.generatePolyLine();
        this.generatePolyOffset(offset, inset, outset);
        this.generateOffset(inset, outset);
    }

    GObject.inherit(GXVertexOffsetter, GXVertexSource);

    /**
     *
     * @param {GPoint} point
     * @param {Number} bulge
     * @param {GPoint} center
     * @param {Number} radius
     * @constructor
     */
    GXVertexOffsetter.PolySegment = function (point, bulge, center, radius) {
        if (point) {
            this.point = point;
        }
        if (bulge != null) {
            this.bulge = bulge;
        }
        if (center) {
            this.center = center;
        }
        if (radius) {
            this.radius = radius;
        }
    };

    GXVertexOffsetter.PolySegment.prototype.point = null;

    GXVertexOffsetter.PolySegment.prototype.bulge = null;

    GXVertexOffsetter.PolySegment.prototype.center = null;

    GXVertexOffsetter.PolySegment.prototype.radius = null;

    GXVertexOffsetter.PolySegment.prototype.next = null;

    GXVertexOffsetter.PolySegment.prototype.previous = null;

    GXVertexOffsetter.PolyOffsetSegment = function (basepoint, point1, point2, bulge, center, radius) {
        GXVertexOffsetter.PolySegment.call(this, point1, bulge, center, radius);
        this.basepoint = basepoint;
        if (point2) {
            this.point2 = point2;
        }
    };
    GObject.inherit(GXVertexOffsetter.PolyOffsetSegment, GXVertexOffsetter.PolySegment);

    GXVertexOffsetter.PolyOffsetSegment.prototype.basepoint = null;

    GXVertexOffsetter.PolyOffsetSegment.prototype.point2 = null;

    GXVertexOffsetter.IntersectionType = function () {
    };

    /**
     * If intersection point is a True Intersection Point
     * @type {boolean}
     */
    GXVertexOffsetter.IntersectionType.prototype.TIP = false;

    /**
     * If intersection point is a False Intersection Point
     * @type {boolean}
     */
    GXVertexOffsetter.IntersectionType.prototype.FIP = false;

    /**
     * If intersection point is a Positive False Intersection Point
     * Otherwise if point FIP and not PFIP, it is considered NFIP (Negative False Intersection Point)
     * @type {boolean}
     */
    GXVertexOffsetter.IntersectionType.prototype.PFIP = false;

    GXVertexOffsetter.IntersectionResult = function () {
        this.intTypes = [new GXVertexOffsetter.IntersectionType(), new GXVertexOffsetter.IntersectionType()];
    };

    /**
     * Intersection point
     * @type {GPoint}
     */
    GXVertexOffsetter.IntersectionResult.prototype.point = null;

    /**
     * Intersection types (GXVertexOffsetter.IntersectionType) of both segments
     * @type {Array}
     */
    GXVertexOffsetter.IntersectionResult.prototype.intTypes = null;

    GXVertexOffsetter.IntersectionResult.prototype.clear = function () {
        this.point = null;
        this.intTypes[0].TIP = false;
        this.intTypes[0].FIP = false;
        this.intTypes[0].PFIP = false;
        this.intTypes[1].TIP = false;
        this.intTypes[1].FIP = false;
        this.intTypes[1].PFIP = false;
    };

    GXVertexOffsetter.PolySegmentContainer = function () {
        this.count = 0;
    };

    GXVertexOffsetter.PolySegmentContainer.prototype.head = null;

    GXVertexOffsetter.PolySegmentContainer.prototype.end = null;

    GXVertexOffsetter.PolySegmentContainer.prototype.closed = null;

    GXVertexOffsetter.PolySegmentContainer.prototype.count = 0;

    GXVertexOffsetter.PolySegmentContainer.prototype.insertSegment = function (polySegment, next) {
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

    GXVertexOffsetter.PolySegmentContainer.prototype.deleteSegment = function (polySegment) {
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
            this.end = polySegment.end;
        }
        --this.count;
    };

    /**
     * @type {GXVertexSource}
     * @private
     */
    GXVertexOffsetter.prototype._source = null;

    GXVertexOffsetter.prototype._polyline = null;

    GXVertexOffsetter.prototype._polyinset = null;

    GXVertexOffsetter.prototype._polyoutset = null;

    GXVertexOffsetter.prototype._inset = null;

    GXVertexOffsetter.prototype._outset = null;

    /** @override */
    GXVertexOffsetter.prototype.rewindVertices = function (index) {
        if (index != 0) {
            return false;
        }
        if (this._inset) {
            this._inset.rewindVertices(0);
        }
        if (this._outset) {
            this._outset.rewindVertices(0);
        }
        return this._source.rewindVertices(0);
    };

    /** override */
    GXVertexOffsetter.prototype.readVertex = function (vertex) {

    };

    /**
     *
     * @param {GPoint} B0 - a start point of Quadratic Bezier curve
     * @param {GPoint} B1 - a control point of Quadratic Bezier curve
     * @param {GPoint} B2 - an end point of Quadratic Bezier curve
     * @param {Number} tolerance
     */
    GXVertexOffsetter.prototype.addCurveToPolyline = function (B0, B1, B2, tolerance) {
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
            var segm = new GXVertexOffsetter.PolySegment(B0, 0);
            this._polyline.insertSegment(segm);
            return;
        }

        // 1. approximate curve by bi-arc
        var curves = [];
        var arcs = {};
        var a = gMath.ptDist(B0.getX(), B0.getY(), B1.getX(), B1.getY());
        var b = gMath.ptDist(B1.getX(), B1.getY(), B2.getX(), B2.getY());
        var d = gMath.ptDist(B0.getX(), B0.getY(), B2.getX(), B2.getY());
        // TODO: check for zeros
        var T0 = new GPoint((B1.getX() - B0.getX()) / a, (B1.getY() - B0.getY()) / a);
        var T1 = new GPoint((B2.getX() - B1.getX()) / b, (B2.getY() - B1.getY()) / b);
        var T = new GPoint((B2.getX() - B0.getX()) / d, (B2.getY() - B0.getY()) / d);
        var cosEtha = gMath.vDotProduct(T0.getX(), T0.getY(), T1.getX(), T1.getY());

        // D(u) = a*(T1 - T0*cosEtha) + ((a*cosEtha - b)T0 + (b*cosEtha - a)T1)*u
        // N(u) = D(u) / ||D(u)||
        var D0 = new GPoint(a * (T1.getX() - T0.getX() * cosEtha), a * (T1.getY() - T0.getY() * cosEtha));
        var tmp1 = a * cosEtha - b;
        var tmp2 = b * cosEtha - a;
        var D1 = new GPoint(
            D0.getX() + tmp1 * T0.getX() + tmp2 * T1.getX(), D0.getY() + tmp1 * T0.getY() + tmp2 * T1.getY());

        tmp1 = Math.sqrt(gMath.vDotProduct(D0.getX(), D0.getY(), D0.getX(), D0.getY()));
        tmp2 = Math.sqrt(gMath.vDotProduct(D1.getX(), D1.getY(), D1.getX(), D1.getY()));
        // TODO: check for zeros
        var N0 = new GPoint(D0.getX() / tmp1, D0.getY() / tmp1);
        var N1 = new GPoint(D1.getX() / tmp2, D1.getY() / tmp2);

        // f(s) = a1*s^2 + b1*s + c1
        // f(s) = (1 - cosEtha)s^2 + (T1N0 * TT0 / TN0 + T0N1 * TT1 / TN1)s - 0.5 * (T1N0 * T0N1) / (TN0 * TN1)
        // f(s) = 0
        // lambda*T0N1 = s*d*TN1
        // myu*T1N0 = s*d*TN0
        var a1 = 1 - cosEtha;
        var T1N0 = gMath.vDotProduct(T1.getX(), T1.getY(), N0.getX(), N0.getY());
        var TT0 = gMath.vDotProduct(T.getX(), T.getY(), T0.getX(), T0.getY());
        var TN0 = gMath.vDotProduct(T.getX(), T.getY(), N0.getX(), N0.getY());
        var T0N1 = gMath.vDotProduct(T0.getX(), T0.getY(), N1.getX(), N1.getY());
        var TT1 = gMath.vDotProduct(T.getX(), T.getY(), T1.getX(), T1.getY());
        var TN1 = gMath.vDotProduct(T.getX(), T.getY(), N1.getX(), N1.getY());
        var b1 = T1N0 * TT0 / TN0 + T0N1 * TT1 / TN1;
        var c1 = -(T1N0 * T0N1) / (TN0 * TN1 * 2);
        var roots = [];
        gMath.getQuadraticRoots(a1, b1, c1, roots);
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
        var tgGamma = Math.sqrt((1 - TT0) / (1 + TT0));
        var Rb0 = lambda / tgGamma;
        var tgPsi = Math.sqrt((1 - TT1) / (1 + TT1));
        var Rb2 = myu / tgPsi;
        var C0 = new GPoint(B0.getX() + Rb0 * N0.getX(), B0.getY() + Rb0 * N0.getY());
        var C1 = new GPoint(B2.getX() + Rb2 * N1.getX(), B2.getY() + Rb2 * N1.getY());

        // 2. measure dist
        // By Theorem 2: sigma from (0,1): g(u) = (d - 2a*cos(phi))u^2 + 2a*cos(phi)u - lambda*(1 + cos(phi)) = 0
        tmp1 = 2 * a * TT0;
        roots = [];
        gMath.getQuadraticRoots(d - tmp1, tmp1, lambda * (1 + TT0), roots);
        var sigma = null;
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
        gMath.getQuadraticRoots(tmp1, 3 * (abcosEtha - aSqr), 2 * aSqr - Rb0 * b * sinEtha, roots);
        if (roots[0] != null && roots[0] < sigma && roots[0] > 0) {
            var Qt01 = new GPoint(gMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[0]),
                gMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[0]));
            var pho01 = Math.abs(Rb0 - gMath.ptDist(Qt01.getX(), Qt01.getY(), C0.getX(), C0.getY()));
            if (delta < pho01) {
                delta = pho01;
                tMax = roots[0];
            }
        }
        if (roots[1] != null && roots[1] < sigma && roots[1] > 0) {
            var Qt02 = new GPoint(gMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[1]),
                gMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[1]));
            var pho02 = Math.abs(Rb0 - gMath.ptDist(Qt02.getX(), Qt02.getY(), C0.getX(), C0.getY()));
            if (delta < pho02) {
                delta = pho02;
                tMax = roots[1];
            }
        }

        roots = [];
        gMath.getQuadraticRoots(tmp1, -2 * aSqr + bSqr + abcosEtha, aSqr + abcosEtha - Rb2 * a * sinEtha, roots);
        if (roots[0] != null && roots[0] < 1 && roots[0] > sigma) {
            var Qt11 = new GPoint(gMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[0]),
                gMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[0]));
            var pho11 = Math.abs(Rb2 - gMath.ptDist(Qt11.getX(), Qt11.getY(), C1.getX(), C1.getY()));
            if (delta < pho11) {
                delta = pho11;
                tMax = roots[0];
            }
        }
        if (roots[1] != null && roots[1] < 1 && roots[1] > sigma) {
            var Qt12 = new GPoint(gMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), roots[1]),
                gMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), roots[1]));
            var pho12 = Math.abs(Rb2 - gMath.ptDist(Qt12.getX(), Qt12.getY(), C1.getX(), C1.getY()));
            if (delta < pho12) {
                delta = pho12;
                tMax = roots[1];
            }
        }

        // 3. if delta > tolerance => divide && repeat;
        // else => add bi-arc to polyline
        if (delta > tolerance) {
            var ctrs1X = Float64Array(3);
            var ctrs1Y = Float64Array(3);
            var ctrs2X = Float64Array(3);
            var ctrs2Y = Float64Array(3);
            gMath.divideQuadraticCurve(B0.getX(), B1.getX(), B2.getX(), tMax, ctrls1X, ctrls2X);
            gMath.divideQuadraticCurve(B0.getY(), B1.getY(), B2.getY(), tMax, ctrls1Y, ctrls2Y);
            this.addCurveToPolyline(B0, new GPoint(ctrls1X[1], ctrls1Y[1]), new GPoint(ctrls1X[2], ctrls1Y[2]), tolerance);
            this.addCurveToPolyline(new GPoint(ctrls2X[0], ctrls2Y[0]), new GPoint(ctrls2X[1], ctrls2Y[1]), B2, tolerance);
        } else {
            // V = B0 + lambda*T0
            // G = V + lambda*T
            var G = new GPoint(B0.getX() + lambda * (T0.getX() + T.getX()), B0.getY() + lambda * (T0.getY() + T.getY()));

            // Define curve orientation
            // We can check arc center location against B0G
            if (gMath.segmentSide(B0.getX(), B0.getY(), G.getX(), G.getY(), C0.getX(), C0.getY()) > 0) {
                tgGamma = -tgGamma;
            }
            var segm = new GXVertexOffsetter.PolySegment(B0, tgGamma, C0, Rb0);
            this._polyline.insertSegment(segm);
            if (tgGamma < 0) {
                tgPsi = -tgPsi;
            }
            segm = new GXVertexOffsetter.PolySegment(G, tgPsi, C1, Rb2);
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
    GXVertexOffsetter.prototype.addCubicCurveToPolyline = function (B0, B1, B2, B3, tolerance) {
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
        var nPoints = gMath.getCubicCurveSplits(ax, bx, cx, ay, by, cy, sPts);

        // 2. Based on splitPoints iterate through intervals,
        // and for each interval perform the curve approximation with a biArc:
        var t1, t2;
        var ctrlsx = new Float64Array(4);
        var ctrlsy = new Float64Array(4);
        for (var i = 0; i < nPoints - 1; ++i) {
            t1 = sPts[i];
            t2 = sPts[i + 1];
            gMath.getCtrlPts(B0.getX(), B3.getX(), B1.getX(), B2.getX(), t1, t2, ctrlsx);
            gMath.getCtrlPts(B0.getY(), B3.getY(), B1.getY(), B2.getY(), t1, t2, ctrlsy);
            this._addCubicSegmToPolyline(ctrlsx, ctrlsy, tolerance);
        }
    };

    GXVertexOffsetter.prototype._isQudraticCurveFlat = function (B0, B1, B2, tolerance) {
        var xB = gMath.getCurveAtT(B0.getX(), B2.getX(), B1.getX(), 0.5);
        var yB = gMath.getCurveAtT(B0.getY(), B2.getY(), B1.getY(), 0.5);
        var dst = gMath.ptSqrDist(xB, yB, (B0.getX() + B2.getX()) / 2, (B0.getY() + B2.getY()) / 2);
        return (dst <= tolerance * tolerance);
    };

    GXVertexOffsetter.prototype._isCubicCurveFlat = function (ctrlsx, ctrlsy, tolerance) {
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
     */
    GXVertexOffsetter.prototype._addCubicSegmToPolyline = function (ctrlsx, ctrlsy, tolerance) {
        // 1. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012
        var xA = ctrlsx[0];
        var yA = ctrlsy[0];
        var xB = ctrlsx[3];
        var yB = ctrlsy[3];

        // 0. try line approximation
        if (this._isCubicCurveFlat(ctrlsx, ctrlsy, tolerance)) {
            var segm = new GXVertexOffsetter.PolySegment(new GPoint(xA, yA), 0);
            this._polyline.insertSegment(segm);
            return;
        }

        // 1. Construct approximating arc
        var result = [];
        var C = gMath.getIntersectionPoint(xA, yA, ctrlsx[1], ctrlsy[1], ctrlsx[2], ctrlsy[2], xB, yB, result);
        var ab = gMath.ptDist(xA, yA, xB, yB);
        var ac = gMath.ptDist(xA, yA, C.getX(), C.getY());
        var bc = gMath.ptDist(xB, yB, C.getX(), C.getY());
        var p = ab + ac + bc;
        var xG = (xA * bc + xB * ac + C.getX() * ab) / p;
        var yG = (yA * bc + yB * ac + C.getY() * ab) / p;
        if (gMath.isEqualEps(xA, xG) || gMath.isEqualEps(yA, yG) ||
            gMath.isEqualEps(xB, xG) || gMath.isEqualEps(yB, yG)) {
            // Might be some error, as the original cubic curve has been split to not contain parts,
            // where tangent line is parallel to X axis or Y axis.
            var segm = new GXVertexOffsetter.PolySegment(new GPoint(xA, yA), 0);
            this._polyline.insertSegment(segm);
        } else {
            var mA = (yA - yG) / (xA - xG);
            var mB = (yB - yG) / (xB - xG);
            var xO = (mA * mB * (yA - yB) + mB * (xA + xG) - mA * (xG + xB)) / 2 / (mB - mA);
            var yO = -1 / mA * (xO - (xA + xG) / 2) + (yA + yG) / 2;
            var R = gMath.ptDist(xA, yA, xO, yO);

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
            gMath.getCoeffPolyDeriv(coeffF, 6, coeffFDeriv);
            // Coeffitients of the second and third derivative polynomials
            var coeffFDeriv2 = new Float64Array(5);
            gMath.getCoeffPolyDeriv(coeffFDeriv, 5, coeffFDeriv2);
            var coeffFDeriv3 = new Float64Array(4);
            gMath.getCoeffPolyDeriv(coeffFDeriv2, 4, coeffFDeriv3);

            // Coefficients of 5 degree polynomial, calculated from derivative polynomial and interval transformation
            var coeffInversed = new Float64Array(6);
            gMath.inversePolyUnaryInterval(coeffFDeriv, 5, coeffInversed);
            var nRoots = gMath.estimPositiveRootsDescartes(coeffInversed, 5);
            var maxDst = 0;
            var sqrR = R * R;
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
                v51 = gMath.evalPoly(coeffFDeriv, 5, t1);
                if (gMath.isEqualEps(v51, 0)) {
                    t1 += 0.005;
                    v51 = gMath.evalPoly(coeffFDeriv, 5, t1);
                }
                v52 = gMath.evalPoly(coeffFDeriv, 5, t2);
                if (gMath.isEqualEps(v52, 0)) {
                    t2 -= 0.005;
                    v52 = gMath.evalPoly(coeffFDeriv, 5, t2);
                }

                if (nRoots > 1) {
                    gMath.getSturmPRS(coeffFDeriv, 5, coeffFDeriv2, sturmSeq);
                    nSignVars = [];
                    fVals = [v51, v52];
                    nRoots = gMath.countRootsNSturm(coeffFDeriv, 5, coeffFDeriv2, A1, A2,
                        sturmSeq, nSignVars, fVals);
                }
            }
            if (nRoots == 0) {
                // Might be some error, return the arc
            } else if (nRoots == 1) {
                var r1 = gMath.locateByNewton(t1, t2, v51, v52, coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005);
                if (r1 == null) {
                    r1 = (t1 + t2) / 2;
                }
                var r1x = gMath.evalCubic(a1x, b1x, c1x, xA, r1);
                var r1y = gMath.evalCubic(a1y, b1y, c1y, yA, r1);
                maxDst = math.abs(gMath.ptSqrDist(r1x, r1y, xO, yO) - sqrR);
            } else {
                var rIntervals = [];
                gMath.locRootsSturm(coeffFDeriv, 5, coeffFDeriv2, A1, A2, sturmSeq, nRootsNew,
                    nSignVars, fVals, rIntervals);

                for (var s = 0; s < rIntervals.length; ++s) {
                    r1 = gMath.locateByNewton(rIntervals[s][0], rIntervals[s][1],
                        rIntervals[s][2], rIntervals[s][3], coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005,
                        sturmSeq);
                    if (r1 == null) {
                        r1 = (rIntervals[s][0] + rIntervals[s][1]) / 2;
                    }
                    r1x = gMath.evalCubic(ax, b1x, c1x, px1, r1);
                    r1y = gMath.evalCubic(ay, b1y, c1y, py1, r1);
                    var dst = math.abs(gMath.ptSqrDist(r1x, r1y, xO, yO) - sqrR);
                    if (dst > maxDst) {
                        maxDst = dst;
                    }
                }
            }

            // 3. if distance > tolerance => divide && repeat;
            // else => add arc to polyline
            if (maxDst > tolerance * tolerance) {
                var ctrlsNew1X = Float64Array(4);
                var ctrlsNew1Y = Float64Array(4);
                var ctrlsNew2X = Float64Array(4);
                var ctrlsNew2Y = Float64Array(4);
                gMath.getCtrlPtsCasteljau(ctrlsx[0], ctrlsx[1], ctrlsx[2], ctrlsx[3], 0.5, null, ctrlsNew1X, ctrlsNew2X);
                gMath.getCtrlPtsCasteljau(ctrlsy[0], ctrlsy[1], ctrlsy[2], ctrlsy[3], 0.5, null, ctrlsNew1Y, ctrlsNew2Y);
                this._addCubicSegmToPolyline(ctrlsNew1X, ctrlsNew1Y, tolerance);
                this._addCubicSegmToPolyline(ctrlsNew2X, ctrlsNew2Y, tolerance);
            } else {
                var sinGamma = ab / 2 / R;
                // As gamma <= 45 degrees, we are save with the following formmula:
                var tgGamma = sinGamma / Math.sqrt(1 - sinGamma * sinGamma);
                // Define curve orientation
                // We can check arc center location against AB
                if (gMath.segmentSide(xA, yA, xB, yB, xO, yO) > 0) {
                    tgGamma = -tgGamma;
                }
                var arc = new GXVertexOffsetter.PolySegment(new GPoint(xA, yA), tgGamma, new GPoint(xO, yO), R);
                this._polyline.insertSegment(arc);
            }
        }
    };

    GXVertexOffsetter.prototype.generatePolyLine = function () {
        if (!this._source.rewindVertices(0)) {
            return;
        }

        var tolerance = 0.0001; // TODO: update here

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
        var vertex1;
        var vertex2 = new GXVertex();
        var polySegm;

        while (this._source.readVertex(vertex2)) {
            switch (vertex2.command) {
                case GXVertex.Command.Move:
                    vertex1 = vertex2;
                    vertex2 = new GXVertex();
                    break;
                case GXVertex.Command.Line:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                    } else {
                        polySegm = new GXVertexOffsetter.PolySegment(new GPoint(vertex1.x, vertex1.y), 0);
                        this._polyline.insertSegment(polySegm);
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                    }
                    break;

                case GXVertex.Command.Curve:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                    } else {
                        var B0 = new GPoint(vertex1.x, vertex1.y);
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                        if (this._source.readVertex(vertex2)) {
                            this.addCurveToPolyline(B0, new GPoint(vertex2.x, vertex2.y),
                                new GPoint(vertex1.x, vertex1.y), tolerance);

                            vertex2 = new GXVertex();
                        }
                    }
                    break;

                case GXVertex.Command.Curve2:
                    if (!vertex1) {
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                    } else {
                        var B0 = new GPoint(vertex1.x, vertex1.y);
                        var B3 = new GPoint(vertex2.x, vertex2.y);
                        vertex1 = vertex2;
                        vertex2 = new GXVertex();
                        var vertex3 = new GXVertex();
                        if (this._source.readVertex(vertex2) && this._source.readVertex(vertex3)) {
                            this.addCubicCurveToPolyline(B0, new GPoint(vertex2.x, vertex2.y),
                                new GPoint(vertex3.x, vertex3.y), B3, tolerance);

                            vertex2 = new GXVertex();
                        }
                    }
                    break;

                case GXVertex.Command.Close:
                    if (this._polyline) {
                        this._polyline.closed = true;
                    }
                    break;

                default:
                    throw new Error("Unknown vertex command: " + vertex.command.toString());
            }
        }
    };

    GXVertexOffsetter.prototype.generatePolyOffset = function (offset, inset, outset) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

        // 1. for each polySegment, generate polyOffsetSegment
        var polyOffsetOut = null;
        var polyOffsetIn = null;
        if (outset) {
            polyOffsetOut = new GXVertexOffsetter.PolySegmentContainer();
        }
        if (inset) {
            polyOffsetIn = new GXVertexOffsetter.PolySegmentContainer();
        }
        var offsSegm;
        for (var i = 0, curSegm = this._polyline.head; i < this._polyline.count; ++i) {
            if (outset) {
                offsSegm = this._offsetPolySegment(curSegm, offset);
                if (offsSegm) {
                    polyOffsetOut.insertSegment(offsSegm);
                }
            }
            if (inset) {
                offsSegm = this._offsetPolySegment(curSegm, -offset);
                if (offsSegm) {
                    polyOffsetIn.insertSegment(offsSegm);
                }
            }
            curSegm = curSegm.next;
        }
        if (!this._polyline.closed) {
            curSegm = this._polyline.head;
            if (outset) {
                var firstSegm = polyOffsetOut.head;
                polyOffsetOut.insertSegment(
                    new GXVertexOffsetter.PolyOffsetSegment(curSegm.point, firstSegm.point, null, 0));
            }
            if (inset) {
                var firstSegm = polyOffsetIn.head;
                polyOffsetIn.insertSegment(
                    new GXVertexOffsetter.PolyOffsetSegment(curSegm.point, firstSegm.point, null, 0));
            }
        }

        // 2. intersect untrimmed
        var polyOutNew = new GXVertexOffsetter.PolySegmentContainer();
        var polyInNew = new GXVertexOffsetter.PolySegmentContainer();
        if (outset) {
            this._trimOffsetPoly(polyOffsetOut, offset, polyOutNew);
        }
        if (inset) {
            this._trimOffsetPoly(polyOffsetOut, -offset, polyInNew);
        }

        // 3. clipping algorithm
        // TODO
    };

    GXVertexOffsetter.prototype.generateOffset = function (inset, outset) {
        // Approximation of circular arcs and offset curves by Bezier curves of high degree
        // Young Joon Ahn, Yeon soo Kim, Youngsuk Shin, 2004
        // ...
    };

    /**
     *
     * @param segm
     * @param {Number} offset: positive - to the right along the path, negative - to the left
     * @returns {null}
     * @private
     */
    GXVertexOffsetter.prototype._offsetPolySegment = function(segm, offset) {
        var newSegm = null;
        var absOffs = Math.abs(offset);
        if (!segm.bulge) {
            if(segm.next || this._polyline.closed) {
                // x(y2 - y1) + y(x1 - x2) + x2y1 - x1y2 = 0
                var x1 = segm.point.getX();
                var y1 = segm.point.getY();
                var x2, y2;
                if (segm.next) {
                    x2 = segm.next.point.getX();
                    y2 = segm.next.point.getY();
                } else { // closed
                    x2 = this._polyline.head.point.getX();
                    y2 = this._polyline.head.point.getY();
                }
                var dist = gMath.ptDist(x1, y1, x2, y2);
                if (!gMath.isEqualEps(dist, 0)) {
                    var delta = new GPoint(offset * (y2 - y1) / dist, offset * (x1 - x2) / dist);
                    var newPt1 = new GPoint(x1 + delta.getX(), y1 + delta.getY());
                    var newPt2 = new GPoint(x1 + delta.getX(), y1 + delta.getY());
                    newSegm = new GXVertexOffsetter.PolyOffsetSegment(segm.point, newPt1, newPt2, 0);
                } // else do nothing
            } // else do nothing
        } else if (segm.radius) {
            var radius = null;
            var k = null;
            // TODO: pass tolerance here
            var tolerance = 0.00001;
            if (offset * segm.bulge > 0) {
                radius += absOffs;
                k = radius / segm.radius;
            } else if (!gMath.isEqualEps(segm.radius, absOffs, tolerance)) {
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
                var newPt1 = new GPoint(xO + k * (x1 - xO), yO + k * (y1 - yO));
                var newPt2 = new GPoint(xO + k * (x2 - xO), yO + k * (y2 - yO));
                newSegm = new GXVertexOffsetter.PolyOffsetSegment(
                    segm.point, newPt1, newPt2, segm.bulge, segm.center, radius);
            }
        }
        return newSegm;
    };

    /**
     *
     * @param {GXVertexOffsetter.PolyOffsetSegment} psegm1
     * @param {GXVertexOffsetter.PolyOffsetSegment} psegm2
     * @param {GXVertexOffsetter.IntersectionResult} intResult
     * @private
     */
    GXVertexOffsetter.prototype._insersectOffsetSegments = function (psegm1, psegm2, intResult) {
        if (psegm1.bulge == 0 && psegm2.bulge == 0) { // line segments
            var res = [null, null];
            var pt = gMath.getIntersectionPoint(
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
                gMath.circleLineIntersection(xL, yL, dxL, dyL,
                    psegm2.centre.getX(), psegm2.centre.getY(), psegm2.radius, res);

                if (res[0] != null) {
                    x = xL + dxL * res[0];
                    y = yL + dyL * res[0];
                    t = res[0];
                }
                if (res[0] != null && res[1] != null) {
                    var x2 = xL + dxL * res[1];
                    var y2 = yL + dyL * res[1];
                    var sDst1 = gMath.ptSqrDist(x, y, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    var sDst2 = gMath.ptSqrDist(x2, y2, psegm2.basepoint.getX(), psegm2.basepoint.getY());
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
                gMath.circleLineIntersection(xL, yL, dxL, dyL,
                    psegm1.centre.getX(), psegm1.centre.getY(), psegm1.radius, res);

                if (res[0] != null) {
                    x = xL + dxL * res[0];
                    y = yL + dyL * res[0];
                    t = res[0];
                }
                if (res[0] != null && res[1] != null) {
                    var x2 = xL + dxL * res[1];
                    var y2 = yL + dyL * res[1];
                    var sDst1 = gMath.ptSqrDist(x, y, psegm2.basepoint.getX(), psegm2.basepoint.getY());
                    var sDst2 = gMath.ptSqrDist(x2, y2, psegm2.basepoint.getX(), psegm2.basepoint.getY());
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
            gMath.circleCircleIntersection(psegm1.centre.getX(), psegm1.centre.getY(), psegm1.radius,
                psegm2.centre.getX(), psegm2.centre.getY(), psegm2.radius, res);

            var ptIdx = null;
            if (res[0] != null) {
                ptIdx = 0;
            }
            if (res[0] != null && res[1] != null) {
                var sDst1 = gMath.ptSqrDist(res[0].getX(), res[0].getY(),
                    psegm2.basepoint.getX(), psegm2.basepoint.getY());

                var sDst2 = gMath.ptSqrDist(res[0].getX(), res[0].getY(),
                    psegm2.basepoint.getX(), psegm2.basepoint.getY());

                if (sDst2 < sDst1) {
                    ptIdx = 1;
                }
            }

            if (ptIdx !== null) {
                this._fillArcIntType(psegm1, res[ptIdx].getX(), res[ptIdx].getY(), intResult.intTypes[0]);
                this._fillArcIntType(psegm2, res[ptIdx].getX(), res[ptIdx].getY(), intResult.intTypes[1]);
            }
        }
    };

    /**
     * Fills arc intersection type based on the arc segment parameters and intersection point's coordinates
     * @param {GXVertexOffsetter.PolyOffsetSegment} psegm
     * @param {Number} x
     * @param {Number} y
     * @param {GXVertexOffsetter.IntersectionType} intType
     * @private
     */
    GXVertexOffsetter.prototype._fillArcIntType = function (psegm, x, y, intType) {
        // For an arc, if a point not on the arc, let's find arc's central point on the circle, and consider
        // an opposite circle point as a measure for defining a PFIP or NFIP
        var sp1x = psegm.point.getX();
        var sp1y = psegm.point.getY();
        var sp2x = psegm.point2.getX();
        var sp2y = psegm.point2.getY();
        var cX = psegm.centre.getX();
        var cY = psegm.centre.getY();
        if (gMath.segmentSide(sp1x, sp1x, sp2x, sp2y, x, y) !=
            gMath.segmentSide(sp1x, sp1x, sp2x, sp2y, cX, cY)) {

            var pMx = (sp1x + sp2x) / 2;
            var pMy = (sp1y + sp2y) / 2;
            var tmp = psegm.radius / gMath.ptDist(pMx, pMy, cX, cY);
            var pOppX = cX + (cX - pMx) * tmp;
            var pOppY = cY + (cY - pMy) * tmp;
            if (gMath.segmentSide(sp1x, sp1x, pOppX, pOppY, x, y) ==
                gMath.segmentSide(sp1x, sp1x, sp2x, sp2y, cX, cY)) {
                intType.FIP = true;
                intType.PFIP = true;
            } else {
                intType.FIP = true;
            }
        } else { // point is on the arc
            intType.TIP = true;
        }
    };

    GXVertexOffsetter.prototype._fillLineIntType = function (param, intType) {
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
     * @param {GXVertexOffsetter.PolySegmentContainer} polyOffset
     * @param {Number} offset
     * @private
     */
    GXVertexOffsetter.prototype._trimOffsetPoly = function (polyOffset, offset, polyONew) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

        var segm1 = null;
        var segm2 = polyOffset.head;
        if (segm2) {
            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(
                segm2.point, segm2.bulge, segm2.center, segm2.radius));

            var iRes = new GXVertexOffsetter.IntersectionResult();
            for (var i = 0; i < polyOffset.count - 2; ++i) {
                segm1 = segm2;
                segm2 = segm1.next;
                iRes.clear();
                this._insersectOffsetSegments(segm1, segm2, iRes);

                if (segm1.bulge == 0 && segm2.bulge == 0) { // Two line segments: use Algorithm 1
                    if (!iRes.point) { // case 1
                        polyONew.insertSegment(new GXVertexOffsetter.PolySegment(segm1.point2, 0));
                    } else if (iRes.intTypes[0].TIP && iRes.intTypes[1].TIP || // case 2a
                            iRes.intTypes[0].FIP && iRes.intTypes[1].FIP && iRes.intTypes[0].PFIP) { // case 2b part1
                        polyONew.insertSegment(new GXVertexOffsetter.PolySegment(iRes.point, 0));
                    } else { // case 2b part2 || case 2c
                        polyONew.insertSegment(new GXVertexOffsetter.PolySegment(segm1.point2, 0));
                        polyONew.insertSegment(new GXVertexOffsetter.PolySegment(segm2.point, 0));
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
                            var bulge = Math.sqrt(gMath.ptSqrDist(ptMx, ptMy, iRes.point.getX(), iRes.point.getY()) /
                                gMath.ptSqrDist(ptMx, ptMy, segm2.centre.getX(), segm2.centre.getY()));

                            if (segm2.bulge < 0) {
                                bulge = -bulge;
                            }
                            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(iRes.point, bulge,
                                segm2.centre, segm2.radius));
                        } else if (iRes.intTypes[0].FIP && iRes.intTypes[1].FIP) { // case 1b
                            // TODO: construct arc segment from segm1.point2 to segm2.point with center at segm2.basepoint

                            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(
                                segm2.point, segm2.bulge, segm2.centre, segm2.radius));
                        } else { //iRes.intTypes[0].FIP && !iRes.intTypes[0].PFIP && iRes.intTypes[1].TIP ||  case 1c
                            // iRes.intTypes[0].TIP && iRes.intTypes[1].PFIP)  case 1d

                            // construct new line segment
                            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(segm1.point2, 0));

                            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(
                                segm2.point, segm2.bulge, segm2.centre, segm2.radius));
                        }
                    } else { // case 2, construct arc
                        // TODO: construct arc segment from segm1.point2 to segm2.point with center at segm2.basepoint

                        polyONew.insertSegment(new GXVertexOffsetter.PolySegment(
                            segm2.point, segm2.bulge, segm2.centre, segm2.radius));
                    }
                } else if (segm1.bulge != 0 && segm2.bulge == 0) { // Arc segment and line segment: use Algorithm 3
                    // TODO
                } else { // two arc segments: use Algorithm 4
                    // TODO
                }
            }
            polyONew.insertSegment(new GXVertexOffsetter.PolySegment(segm2.point2, 0)); //case 3 // TODO: process closed
        }
    };

    /** @override */
    GXVertexOffsetter.prototype.toString = function () {
        return "[Object GXVertexOffsetter]";
    };

    _.GXVertexOffsetter = GXVertexOffsetter;
})(this);