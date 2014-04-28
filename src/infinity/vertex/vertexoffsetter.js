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
        this.generatePolyLine();
        this.generatePolyOffset(inset, outset);
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

    GXVertexOffsetter.PolySegmentContainer = function () {
    };

    GXVertexOffsetter.PolySegmentContainer.prototype.head = null;

    GXVertexOffsetter.PolySegmentContainer.prototype.end = null;

    GXVertexOffsetter.PolySegmentContainer.prototype.closed = null;

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
        //
        // 0. Try segment approximation
        // TODO: implement
        //
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

        // 0. Try segment approximation
        // TODO: implement

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
            var segm = new GXVertexOffsetter.PolySegment(B0, tgGamma, C0, Rb0);
            this._polyline.insertSegment(segm);
            // V = B0 + lambda*T0
            // G = V + lambda*T
            var G = new GPoint(B0.getX() + lambda * (T0.getX() + T.getX()), B0.getY() + lambda * (T0.getY() + T.getY()));
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
        // 2. An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006
        //
        // 3. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012

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

        this._polyline = new GXVertexOffsetter.PolySegmentContainer();

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

    GXVertexOffsetter.prototype.generatePolyOffset = function (inset, outset) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

        // 1. for each segm, generate polySegm
        // 2. intersect untrimmed

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
        if (!segm.bulge) {
            if(!segm.next) {
                if (this._processed && this._processed == segm.previous && this_delta) {
                    var newPt = new GPoint(segm.point.getX() + this._delta.getX(), segm.point.getY() + this._delta.getY());
                    newSegm = new GXVertexOffsetter.PolySegment(newPt, segm.bulge);
                } else {
                    newSegm = new GXVertexOffsetter.PolySegment(segm.point, segm.bulge);
                }
                this._delta = null;
            } else {
                // x(y2 - y1) + y(x1 - x2) + x2y1 - x1y2 = 0
                var x1 = segm.point.getX();
                var y1 = segm.point.getY();
                var x2 = segm.next.point.getX();
                var y2 = segm.next.point.getY();
                var dist = gMath.ptDist(x1, y1, x2, y2);
                if (gMath.isEqualEps(dist, 0)) {
                    this._delta = null;
                    newSegm = new GXVertexOffsetter.PolySegment(segm.point, segm.bulge);
                } else {
                    this._delta = new GPoint(offset * (y2 - y1) / dist, offset * (x1 - x2) / dist);
                    var newPt = new GPoint(x1 + this._delta.getX(), y1 + this._delta.getY());
                    newSegm = new GXVertexOffsetter.PolySegment(newPt, segm.bulge);
                }
            }
        } else if (segm.radius && (segm.radius < Math.abs(offset) || offset * segm.bulge > 0)){

        }
        this._processed = segm;
        return newSegm;
    };

    /** @override */
    GXVertexOffsetter.prototype.toString = function () {
        return "[Object GXVertexOffsetter]";
    };

    _.GXVertexOffsetter = GXVertexOffsetter;
})(this);