(function (_) {

    /**
     * @class IFMath
     * @constructor
     * @version 1.0
     */
    function IFMath() {
    };

    /**
     * 2 * Math.PI
     * @type {Number}
     * @version 1.0
     */
    IFMath.prototype.PI2 = 2 * Math.PI;

    /**
     * 0.5 * Math.PI
     * @type {Number}
     * @version 1.0
     */
    IFMath.prototype.PIHALF = 0.5 * Math.PI;

    /**
     * The default epsilon to compare, defaults to 1.0e-14
     */
    IFMath.prototype.defaultEps = 1e-14;

    /**
     * Convert an angle in degrees into radians
     * @param {Number} angle in degrees
     * @return {Number} angle in radians
     * @version 1.0
     */
    IFMath.prototype.toRadians = function (angle) {
        return angle * Math.PI / 180;
    };

    /**
     * Convert an angle in radians to degrees
     * @param {Number} angle in radians
     * @return {Number} angle in degrees
     * @version 1.0
     */
    IFMath.prototype.toDegrees = function (angle) {
        return angle * 180 / Math.PI;
    };

    /**
     * Adjusts a given angle so that it was within 0 .. and 2 * Math.PI
     * @param {Number} angle the angle to adjust in radians
     * @return {Number} an adjusted angle
     */
    IFMath.prototype.normalizeAngleRadians = function (angle) {
        if (angle >= 0) {
            return this.mod(angle, this.PI2);
        } else {
            return angle + this.PI2 * Math.floor(-angle / this.PI2 + 1);
        }
    };

    /**
     * Adjusts a given angle so that it was within 0 .. and 360°
     * @param {Number} angle the angle to adjust in degrees
     * @return {Number} an adjusted angle
     */
    IFMath.prototype.normalizeAngleDegrees = function (angle) {
        if (angle >= 0) {
            return this.mod(angle, 360);
        } else {
            return angle + 360 * Math.floor(-angle / 360 + 1);
        }
    };

    /**
     * Normalize a value to be in a given range
     * @param {Number} value
     * @param {Number} min
     * @param {Number} max
     * @return {Number} min <= value >= max
     */
    IFMath.prototype.normalizeValue = function (value, min, max) {
        return value < min ? min : (value > max ? max : value);
    };

    /**
     * Compare two values for equality using an epsilon value
     * @param {Number} v1 value one
     * @param {Number} v2 value two
     * @param {Number} [epsilon] the epsilon to compare, defaults to IFMath.prototype.defaultEps
     * @return {Boolean} true if v1 == v2 using epsilon, otherwise false
     * @version 1.0
     */
    IFMath.prototype.isEqualEps = function (v1, v2, epsilon) {
        if (!epsilon) epsilon = this.defaultEps;
        return Math.abs(v1 - v2) <= epsilon;
    };

    /**
     * Round a given number with a given precision
     * @param {Number} value the number to round
     * @param {Boolean} [halfDown] If set to true, rounds
     * half down (i.e. 1.5 becomes 1) else rounds half up (default)
     * @param {Number} [precision] the precision of decimal numbers
     * to use. A value of zero (default) rounds to integers
     * @returns {Number}
     */
    IFMath.prototype.round = function (value, halfDown, precision) {
        precision = Math.abs(precision) || 0;
        var coefficient = precision ? Math.pow(10, precision) : 1;
        if (halfDown) {
            return Math.ceil(value * coefficient - 0.5) / coefficient;
        } else {
            return Math.round(value * coefficient) / coefficient;
        }
    };

    /**
     * @return {Number} x mod y
     * @version 1.0
     */
    IFMath.prototype.mod = function (x, y) {
        if (x < 0) {
            return -this.mod(-x, y);
        } else {
            return x - Math.floor(x / y) * y;
        }
    };

    /**
     * @return {Number} x div y
     * @version 1.0
     */
    IFMath.prototype.div = function (x, y) {
        if (x < 0) {
            return -Math.floor(-x / y);
        } else {
            return Math.floor(x / y);
        }
    };

    /**
     * Finds an intersection point of two segments,
     * returns true if found
     * @param {Number} a1x, a1y, a2x, a2y coordinates of the end points of the first segment
     * @param {Number} b1x, b1y, b2x, b2y coordinates of the end points of the second segment
     * @param {Array} [result] - if passed, intersection point between lines is calculated  even if segments don't
     * intersect and parameter values for both segments are written into this array
     * @return {IFPoint} an intersection point if the segments intersect, null otherwise
     */
    IFMath.prototype.getIntersectionPoint = function (a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y, result) {
        // segments intersect when the system below has the only one solution (ta, tb):
        // a1x + ta (a2x - a1x) = a1x + tb (b2x - b1x)
        // a1y + ta (a2y - a1y) = a1y + tb (b2y - b1y)
        // and 0 <= ta <= 1, 0 <=tb <= 1
        var d = (a1x - a2x) * (b2y - b1y) - (a1y - a2y) * (b2x - b1x);
        var da = (a1x - b1x) * (b2y - b1y) - (a1y - b1y) * (b2x - b1x);
        var db = (a1x - a2x) * (a1y - b1y) - (a1y - a2y) * (a1x - b1x);

        if (Math.abs(d) < this.defaultEps) {
            // segments are parallel
            return null;
        } else {
            var ta = da / d;
            var tb = db / d;
            if (!result && (0 <= ta) && (ta <= 1) && (0 <= tb) && (tb <= 1) || result) {
                if (result) {
                    result[0] = ta;
                    result[1] = tb;
                }
                // segments intersect, find an intersection point
                return new IFPoint(a1x + ta * (a2x - a1x), a1y + ta * (a2y - a1y));
            }
        }

        // segments are on lines which intersection, but the intersection point is outside of the segments,
        // and we don't need this point as !result
        return null;
    };

    /**
     * Calculates intersection points of circle and line
     * @param {Number} xL - line start point X coordinate
     * @param {Number} yL - line start point Y coordinate
     * @param {Number} dxL - line X slope
     * @param {Number} dyL - line Y slope
     * @param {Number} xC - circle center X coordinate
     * @param {Number} yC - circle center Y coordinate
     * @param {Number} rC - circle radius
     * @param {Array{Number}} result - array of 0 - 2 line parameter values
     */
    IFMath.prototype.circleLineIntersection = function (xL, yL, dxL, dyL, xC, yC, rC, result) {
        // (x - xC)^2 + (y - yC)^2 - rC^2 = 0
        // x = xL + dxL * t
        // y = yL + dyL * t
        // From the quadratic equation for t, we get discriminant:
        var rSqr = rC * rC;
        var dxLSqr = dxL * dxL;
        var dyLSqr = dyL * dyL;
        var dev = dxLSqr + dyLSqr;
        if (this.isEqualEps(dev, 0)) {
            return;
        }

        var tmp = dxL * (yC - yL) - dyL * (xC - xL);
        var discr = rSqr * dev - (tmp * tmp);

        if (this.isEqualEps(discr, 0)) { // line is tangent to circle
            result[0] = (dxL * (xC - xL) + dyL * (yC - yL)) / dev;
        } else if (discr > 0) { // line intersects circle in two points
            tmp = dxL * (xC - xL) + dyL * (yC - yL);
            result[0] = (tmp - Math.sqrt(discr)) / dev;
            result[1] = (tmp + Math.sqrt(discr)) / dev;
        }
    };

    /**
     * Calculates intersection points of two circles
     * @param {Number} xC1 - the first circle center X coordinate
     * @param {Number} yC1 - the first circle center Y coordinate
     * @param {Number} rC1 - the first circle radius
     * @param {Number} xC2 - the second circle center X coordinate
     * @param {Number} yC2 - the second circle center Y coordinate
     * @param {Number} rC2 - the second circle radius
     * @param {Array{IFPoint}} result
     */
    IFMath.prototype.circleCircleIntersection = function (xC1, yC1, rC1, xC2, yC2, rC2, result) {
        // To find intersection points, the formulas from here are used:
        // http://www.sonoma.edu/users/w/wilsonst/papers/Geometry/circles/default.html
        var dSqr = this.ptSqrDist(xC1, yC1, xC2, yC2);
        var resid = Math.abs(rC1 - rC2);
        var rSqr = resid * resid;
        var rSum = rC1 + rC2;
        var rSumSqr = rSum * rSum;
        if (!this.isEqualEps(dSqr, 0)) {
            var tmp = (rC1 * rC1 - rC2 * rC2) / (2 * dSqr);
            var x = (xC1 + xC2) / 2 + (xC2 - xC1) * tmp;
            var y = (yC1 + yC2) / 2 + (yC2 - yC1) * tmp;
            if (this.isEqualEps(dSqr, rSumSqr) || !this.isEqualEps(dSqr, 0) && this.isEqualEps(dSqr, rSqr)) {
                result[0] = new IFPoint(x, y);
            } else if (rSqr < dSqr && dSqr < rSumSqr ) {
                tmp = Math.sqrt((rSumSqr - dSqr) * (dSqr - rSqr)) / (2 * dSqr);
                var xTmp = (yC2 - yC1) * tmp;
                var yTmp = (xC1 - xC2) * tmp;
                result[0] = new IFPoint(x + xTmp, y + yTmp);
                result[1] = new IFPoint(x - xTmp, y - yTmp);
            }
        }
    };

    /**
     * Returns intersection point of 2 lines, or null if they are parallel
     * Lines are given as: a1*x + b1*y +c1 = 0 and a2*x + b2*y +c2 = 0
     * @param {Number} a1, b1, c1 - coefficients of the first line
     * @param {Number} a2, b2, c2 - coefficients of the second line
     * @return {IFPoint} an intersection point if the lines intersection, null otherwise
     * @version 1.0
     */
    IFMath.prototype.getLinesIntersection = function (a1, b1, c1, a2, b2, c2) {
        var d = a1 * b2 - a2 * b1;
        if (this.isEqualEps(d, 0)) {
            return null;
        }
        return new IFPoint((b1 * c2 - b2 * c1) / d, (c1 * a2 - c2 * a1) / d);
    };

    /**
     * Finds and returns coordinates of the center of circumcircle of the triangle
     * null is returned if some points are equal
     * @param {Number} x1 - coordinate of the first triangle vertex
     * @param {Number} y1 - coordinate of the first triangle vertex
     * @param {Number} x2 - coordinate of the second triangle vertex
     * @param {Number} y2 - coordinate of the second triangle vertex
     * @param {Number} x3 - coordinate of the third triangle vertex
     * @param {Number} y3 - coordinate of the third triangle vertex
     * @returns {IFPoint} - center coordinates
     * @version 1.0
     */
    IFMath.prototype.getCircumcircleCenter = function (x1, y1, x2, y2, x3, y3) {
        // Center of circumcircle of the triangle is an intersection point of perpendicular bisectors
        // Perpendicular bisector (x1,x2)(y1,y2): (x1 - x2)*(x - (x1+x2)/2) + (y1 - y2)*(y - (y1*y2)/2) = 0
        var dx1 = x1 - x2;
        var dy1 = y1 - y2;
        var dx2 = x2 - x3;
        var dy2 = y2 - y3;

        return this.getLinesIntersection(dx1, dy1, -dx1 * (x1 + x2) / 2 - dy1 * (y1 + y2) / 2,
            dx2, dy2, -dx2 * (x2 + x3) / 2 - dy2 * (y2 + y3) / 2);
    };

    /**
     * Finds a point at some offset from a segment start,
     * @param {Number} x1, y1, x2, y2 coordinates of a segment end points
     * @param {Number} [offs] offset from a segment start point (x1, y1)
     * @return {IFPoint} a point at offset from the segment start, if offset appears between segment end points,
     *  or the nearest to offset end-point otherwise
     * @version 1.0
     */
    IFMath.prototype.getPointAtLength = function (x1, y1, x2, y2, offs) {
        var len;
        var t;

        if (offs <= 0) {
            return new IFPoint(x1, y1);
        }

        len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (offs >= len) {
            return new IFPoint(x2, y2);
        }
        t = offs / len; // len != 0 as  0 <= offs < len
        return new IFPoint(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    };

    /**
     * Finds a coordinate of a point on parametric quadratic Bezier curve at parameter value t
     * @param {Number} p1 a corresponding coordinate of the start point
     * @param {Number} p2 a corresponding coordinate of the end point
     * @param {Number} c a corresponding coordinate of the control point
     * @param {Number} t - a parameter value
     * @return {Number} a coordinate of a point on curve at parameter value t
     * @version 1.0
     */
    IFMath.prototype.getCurveAtT = function (p1, p2, c, t) {
        var a = p1 + t * (c - p1);
        var b = c + t * (p2 - c);
        return a + t * (b - a);
    };

    /**
     * Finds a coordinate of a point on parametric cubic Bezier curve at parameter value t
     * @param {Number} p1 a corresponding coordinate of the start point
     * @param {Number} p2 a corresponding coordinate of the end point
     * @param {Number} c1 a corresponding coordinate of the first control point
     * @param {Number} c2 a corresponding coordinate of the second control point
     * @param {Number} t - a parameter value
     * @return {Number} a coordinate of a point on curve at parameter value t
     * @version 1.0
     */
    IFMath.prototype.getCubicCurveAtT = function (p1, p2, c1, c2, t) {
        var a = p1 + t * (c1 - p1);
        var b = c1 + t * (c2 - c1);
        var c = c2 + t * (p2 - c2);
        var m = a + t * (b - a);
        var n = b + t * (c - b);
        return m + t * (n - m);
    };

    /**
     * Finds dot product of two vectors
     * @param {Number} x1 x-coordinate of the first vector
     * @param {Number} y1 y-coordinate of the first vector
     * @param {Number} x2 x-coordinate of the second vector
     * @param {Number} y2 y-coordinate of the second vector
     * @return {Number} dot product
     * @version 1.0
     */
    IFMath.prototype.vDotProduct = function (x1, y1, x2, y2) {
        return (x1 == null || y1 == null || x2 == null || y2 == null)
            ? 0.0
            : (x1 * x2) + (y1 * y2);
    };

    /**
     * Finds squared distance between two points
     * @param {Number} x1 x-coordinate of the first point
     * @param {Number} y1 y-coordinate of the first point
     * @param {Number} x2 x-coordinate of the second point
     * @param {Number} y2 y-coordinate of the second point
     * @return {Number} squared distance
     */
    IFMath.prototype.ptSqrDist = function (x1, y1, x2, y2) {
        var tmp1, tmp2;

        if (x1 == null || y1 == null || x2 == null || y2 == null) {
            return 0.0;
        }

        tmp1 = x1 - x2;
        tmp2 = y1 - y2;
        return tmp1 * tmp1 + tmp2 * tmp2;
    };

    /**
     * Finds distance between two points
     * @param {Number} x1 x-coordinate of the first point
     * @param {Number} y1 y-coordinate of the first point
     * @param {Number} x2 x-coordinate of the second point
     * @param {Number} y2 y-coordinate of the second point
     * @return {Number} distance
     */
    IFMath.prototype.ptDist = function (x1, y1, x2, y2) {
        return Math.sqrt(this.ptSqrDist(x1, y1, x2, y2));
    };

    /**
     * Finds relative position of a point against a segment
     * Returns 1 for points left (mirrored Y axis is not taken into account) from the segment line
     * when moving from the segment end p1 to the end p2,
     * 0 - for the points on the segment (with the IFMath.defaultEps accuracy)
     * -1 - for the points to the right of the segment
     * @param {Number} px1 x-coordinate of the start segment point
     * @param {Number} py1 y-coordinate of the start segment point
     * @param {Number} px2 x-coordinate of the end segment point
     * @param {Number} py2 y-coordinate of the end segment point
     * @param {Number} x x-coordinate of the point
     * @param {Number} y y-coordinate of the point
     * @return {Number} relative position of a point against a segment
     * @version 1.0
     */
    IFMath.prototype.segmentSide = function (px1, py1, px2, py2, x, y) {
        var val = (y - py1) * (px2 - px1) + (x - px1) * (py1 - py2);
        if (this.isEqualEps(val, 0)) {
            return 0;
        }
        if (val > 0) {
            return 1;
        }

        // val < 0
        return -1;
    };

    /**
     * Finds squared distance from a point to a segment.
     * Used approach is described here: http://msdn.microsoft.com/en-us/library/ms969920.aspx
     * @param {Number} px1 x-coordinate of the start segment point
     * @param {Number} py1 y-coordinate of the start segment point
     * @param {Number} px2 x-coordinate of the end segment point
     * @param {Number} py2 y-coordinate of the end segment point
     * @param {Number} x x-coordinate of the point
     * @param {Number} y y-coordinate of the point
     * @param {Number} ptMin array from one item to pass out slope value of distance minimizing point, may be null
     * @param {Number} sqrEndAcc squared distance of tolerance for end points, may be null if not needed
     * @return {Number} squared distance from a point to a segment
     * @version 1.0
     */
    IFMath.prototype.sqrSegmentDist = function (px1, py1, px2, py2, x, y, ptMin, sqrEndAcc) {
        if (this.isEqualEps(px1, px2) && this.isEqualEps(py1, py2)) {
            return this.ptSqrDist(px1, py1, x, y);
        }

        // Calculate distance using this approach:
        // http://msdn.microsoft.com/en-us/library/ms969920.aspx
        var ax, ay, bx, by;
        var cx, cy; // projection vector a onto b
        var nx, ny; // normal to b
        var tmp = 0.0;
        var sqrDst = 0.0;

        ax = x - px1;
        ay = y - py1;

        if (px1 == px2 && py1 == py2) {
            sqrDst = this.vDotProduct(ax, ay, ax, ay);
            if (ptMin) {
                ptMin[0] = 0;
            }
        } else if (ptMin && sqrEndAcc && this.vDotProduct(ax, ay, ax, ay) <= sqrEndAcc) {
            ptMin[0] = 0;
            sqrDst = 0.0;
        } else if (ptMin && sqrEndAcc && this.ptSqrDist(x, y, px2, py2) <= sqrEndAcc) {
            ptMin[0] = 1;
            sqrDst = 0.0;
        } else {
            bx = px2 - px1;
            by = py2 - py1;

            //
            //Obtain projection vector.
            //
            //c = ((a * b)/(|b|^2))*b
            //
            tmp = this.vDotProduct(ax, ay, bx, by) / this.vDotProduct(bx, by, bx, by);
            if (tmp <= 0.0) {
                sqrDst = this.vDotProduct(ax, ay, ax, ay);
                if (ptMin) {
                    ptMin[0] = 0;
                }
            }
            else if (tmp >= 1.0) {
                sqrDst = this.vDotProduct(x - px2, y - py2, x - px2, y - py2);
                if (ptMin) {
                    ptMin[0] = 1;
                }
            }
            else {
                cx = bx * tmp;
                cy = by * tmp;

                //
                //Obtain perpendicular projection : n = a - c
                //
                nx = ax - cx;
                ny = ay - cy;

                sqrDst = this.vDotProduct(nx, ny, nx, ny);
                if (ptMin) {
                    ptMin[0] = tmp;
                }
            }
        }

        return sqrDst;
    };

    /**
     * Calculates and returns squared distance between two line segments
     * @param {IFPoint} pt11 - a start point of the first segment
     * @param {IFPoint} pt12 - an end point of the first segment
     * @param {IFPoint} pt21 - a start point of the second segment
     * @param {IFPoint} pt22 - an end point of the second segment
     * @return {Number} squared distance between two line segments
     */
    IFMath.prototype.getSegmToSegmSqrDist = function (pt11, pt12, pt21, pt22) {
        var dst = this.sqrSegmentDist(pt11.getX(), pt11.getY(), pt12.getX(), pt12.getY(), pt21.getX(), pt21.getY());
        var res = dst;
        if (res > 0) {
            dst = this.sqrSegmentDist(pt11.getX(), pt11.getY(), pt12.getX(), pt12.getY(), pt22.getX(), pt22.getY());
            if (dst < res) {
                res = dst;
            }
            if (res > 0) {
                dst = this.sqrSegmentDist(pt21.getX(), pt21.getY(), pt22.getX(), pt22.getY(), pt11.getX(), pt11.getY());
                if (dst < res) {
                    res = dst;
                }
                if (res > 0) {
                    dst = this.sqrSegmentDist(
                        pt21.getX(), pt21.getY(), pt22.getX(), pt22.getY(), pt12.getX(), pt12.getY());

                    if (dst < res) {
                        res = dst;
                    }
                }
            }
        }
        return res;
    };

    /**
     * For points A(x1, y1), B(x2, y2), C(x3, y3) calculates and returns point C', so that AC' makes
     * a collinear projection of the AC vector to the direction of vector AB.
     * @param {Number} x1 - x-coordinate of the point A
     * @param {Number} y1 - y-coordinate of the point A
     * @param {Number} x2 - x-coordinate of the point B
     * @param {Number} y2 - y-coordinate of the point B
     * @param {Number} x3 - x-coordinate of the point C
     * @param {Number} y3 - y-coordinate of the point C
     * @param {Boolean} positiveOnly indicates if only positive projection is needed
     * @return (IFPoint}
     */
    IFMath.prototype.getVectorProjection = function (x1, y1, x2, y2, x3, y3, positiveOnly) {
        var ax = x3 - x1;
        var ay = y3 - y1;
        var bx = x2 - x1;
        var by = y2 - y1;
        // projection vector a onto b
        //c = ((a * b)/(|b|^2))*b

        var norm = this.vDotProduct(bx, by, bx, by);
        var res;
        if (this.isEqualEps(norm, 0)) {
            res = new IFPoint(x3, y3);
        } else {
            var tmp = this.vDotProduct(ax, ay, bx, by) / norm;

            if (tmp <= 0.0 && positiveOnly) {
                res  = new IFPoint(x1, y1);
            }
            else {
                res  = new IFPoint(bx * tmp + x1, by * tmp + y1);
            }
        }

        return res;
    };

    IFMath.prototype.solveLinear2Pseudo = function (a11, a12, b1, a21, a22, b2) {
        var res = this.getLinesIntersection(a11, a12, -b1, a21, a22, -b2);
        if (res == null) { // try to find pseudo solution
            var r1, r2;
            if (!this.isEqualEps(a11 + a12, 0) && (!this.isEqualEps(b1, 0) || this.isEqualEps(b2, 0))) {
                r1 = b1 / (a11 + a12);
                r2 = r1;
            } else if (!this.isEqualEps(a21 + a22, 0) && (!this.isEqualEps(b2, 0) || this.isEqualEps(b1, 0))) {
                r1 = b2 / (a21 + a22);
                r2 = r1;
            } else if (!this.isEqualEps(a12, 0) || !this.isEqualEps(a22, 0)) {
                r1 = 0.0;
                if (!ifMath.isEqualEps(a12, 0)) {
                    r2 = b1 / a12;
                } else {
                    r2 = b2 / a22;
                }
            } else if (!this.isEqualEps(a11, 0) || !this.isEqualEps(a21, 0)) {
                r2 = 0.0;
                if (!this.isEqualEps(a11, 0)) {
                    r1 = b1 / a11;
                } else {
                    r1 = b2 / a21;
                }
            } else {
                r1 = 0.0;
                r2 = 0.0;
            }

            if (this.isEqualEps(a11 * r1 + a12 * r2, b1) && this.isEqualEps(a21 * r1 + a22 * r2, b2)) {
                res = new IFPoint(r1, r2);
            }
        }

        return res;
    };

    /**
     * Divide quadratic Bezier curve into two parts using De Casteljau algorithm,
     * and returns control points of two parts
     * @param {Number} p1 a corresponding coordinate of the curve start point
     * @param {Number} c a corresponding coordinate of the control point
     * @param {Number} p2 a corresponding coordinate of the curve end point
     * @param {Number} t a slope parameter value, where to divide the curve
     * @param {Float64Array(3)} ctrls1 - array of the control points of the first part to be passed out
     * @param {Float64Array(3)} ctrls2 - array of the control points of the second part to be passed out
     */
    IFMath.prototype.divideQuadraticCurve = function (p1, c, p2, t, ctrls1, ctrls2) {
        var a = p1 + t * (c - p1);
        var b = c + t * (p2 - c);
        var m = a + t * (b - a);

        ctrls1[0] = p1;
        ctrls1[1] = a;
        ctrls1[2] = m;
        ctrls2[0] = m;
        ctrls2[1] = b;
        ctrls2[2] = p2;
    };

    /**
     * Evaluates cubic polynomial.
     * @param {Number} a - 3rd degree coefficient
     * @param {Number} b - 2nd degree coefficient
     * @param {Number} c - linear coefficient
     * @param {Number} d - the constant term
     * @param {Number} x - point of polynomial calculation
     * @return {Number} evaluation result
     * @version 1.0
     */
    IFMath.prototype.evalCubic = function (a, b, c, d, x) {
        if (x == 0) {
            return d;
        }

        if (x == 1) {
            return a + b + c + d;
        }

        return ((x * a + b) * x + c) * x + d;
    };

    /**
     * Calculates all inflate points of Bezier cubic curve and also all the points where tangent line is parallel
     * to X or Y axis. Splitting a curve in these points will guarantee, that curvature sign is the same in each
     * sub-curve, and that angle is not more than 90 degrees
     * @param {Number} ax
     * @param {Number} bx
     * @param {Number} cx
     * @param {Number} ay
     * @param {Number} by
     * @param {Number} cy
     * @param {Array} sPts - split points (parameter values) plus two end points, sorted in ascending order
     * @returns {Number} nPoints - the number of split points (including two original end points)
     */
    IFMath.prototype.getCubicCurveSplits = function(ax, bx, cx, ay, by, cy, sPts) {
        // Find initial interval (curve) splitPoints at [0, 1],
        // which are curve inflate points, or such points,
        // that P'x = 0 or P'y = 0
        var splitPoints = [0, 1.0];

        // P(t) = P1 + 3t(C1 - P1) + 3t^2*(C2 - 2C1 + P1) + t^3*(P2 - 3C2 + 3C1 - P1)
        // P' =3(C1 - P1) + 6t(C2 - 2C1 + P1) + 3t^2*(P2 - 3C2 + 3C1 - P1)
        // P'x == 0 when tangent to vertical border, and P'y == 0 when tangent to horizontal border,
        // Also locate all inflate points, where P'x * P''y - P'y * P''x = 0

        // cx = cx1 - px1;
        // cy = cy1 - py1;
        // bx = 2 * (cx2 - cx1 - cx);
        // by = 2 * (cy2 - cy1 - cy);
        // ax = px2 - cx2 -cx - bx;
        // ay = py2 - cy2 -cy - by;
        // P' = 3(at^2 + bt + c)
        // P'' = 3(2at + b)

        // P' = 0;
        ifMath.getQuadraticRoots(ax, bx, cx, splitPoints);
        ifMath.getQuadraticRoots(ay, by, cy, splitPoints);

        // P'x * P''y - P'y * P''x = 0
        // (2bx*ay -2by*ax + ax*by - ay*bx)t^2 + (2cx*ay - 2cy*ax)t + cx*by - cy*bx = 0
        // (bx*ay - by*ax)t^2 + 2*(cx*ay - cy*ax)t + cx*by - cy*bx = 0
        // At^2 + Bt + C = 0
        var A = bx * ay - by * ax;
        var B = 2 * (cx * ay - cy * ax);
        var C = cx * by - cy * bx;
        ifMath.getQuadraticRoots(A, B, C, splitPoints);

        return ifUtil.uSortSegment(0, 1, splitPoints, sPts);
    };

    /**
     * Divide cubic Bezier curve into two parts using De Casteljau algorithm,
     * and returns control points of the needed part
     * @param {Number} p1 a corresponding coordinate of the curve start point
     * @param {Number} c1 a corresponding coordinate of the first control point
     * @param {Number} c2 a corresponding coordinate of the second control point
     * @param {Number} p2 a corresponding coordinate of the curve end point
     * @param {Number} t a slope parameter value, where to divide the curve
     * @param {Number} part indicates which curve part is further needed: 1 - for the first part, 2 - for the second
     * @param {Float64Array(4)} ctrls - array of the control points of needed part to be passed out
     */
    IFMath.prototype.getCtrlPtsCasteljau = function (p1, c1, c2, p2, t, part, ctrls, ctrls2) {
        var a = p1 + t * (c1 - p1);
        var b = c1 + t * (c2 - c1);
        var c = c2 + t * (p2 - c2);
        var m = a + t * (b - a);
        var n = b + t * (c - b);
        var s = m + t * (n - m);

        if (part == null || part == 1) {
            ctrls[0] = p1;
            ctrls[1] = a;
            ctrls[2] = m;
            ctrls[3] = s;
        }
        if (part == null || part == 2) {
            if (part == 2) {
                var ctrls2 = ctrls;
            }
            ctrls2[0] = s;
            ctrls2[1] = n;
            ctrls2[2] = c;
            ctrls2[3] = p2;
        }
    };

    /**
     * Divide cubic Bezier curve using De Casteljau algorithm
     * to extract the curve part between parameter values t1 and t2,
     * and returns control points of the needed part.
     * @param {Number} p1 a corresponding coordinate of the curve start point
     * @param {Number} c1 a corresponding coordinate of the first control point
     * @param {Number} c2 a corresponding coordinate of the second control point
     * @param {Number} p2 a corresponding coordinate of the curve end point
     * @param {Number} t1 a slope parameter value, indicating curve part start
     * @param {Number} t2 a slope parameter value, indicating curve part end
     * @param {Float64Array(4)} ctrls - array of the control points of needed part to be passed out
     * @version 1.0
     */
    IFMath.prototype.getCtrlPts = function (p1, p2, c1, c2, t1, t2, ctrls) {
        var tNew;

        if (t1 == 0) {
            this.getCtrlPtsCasteljau(p1, c1, c2, p2, t2, 1, ctrls);
            return;
        }
        if (t2 == 1) {
            this.getCtrlPtsCasteljau(p1, c1, c2, p2, t1, 2, ctrls);
            return;
        }
        this.getCtrlPtsCasteljau(p1, c1, c2, p2, t1, 2, ctrls);
        tNew = (t2 - t1) / (1 - t1);
        this.getCtrlPtsCasteljau(ctrls[0], ctrls[1], ctrls[2], ctrls[3], tNew, 1, ctrls);
    };

    /**
     * Evaluates polynomial.
     * @param {Array} coeffF - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreeF - polynomial degree
     * @param {Number} x - point of polynomial calculation
     * @return {Number} evaluation result
     * @version 1.0
     */
    IFMath.prototype.evalPoly = function (coeffF, degreeF, x) {
        var i = 0;
        var res = null;

        if (degreeF < 0) {
            return null;
        }

        if (degreeF > 0) {
            if (x != 0) {
                res = coeffF[0];

                if (x == 1) {
                    for (i = 1; i <= degreeF; ++i) {
                        res += coeffF[i];
                    }
                }
                else {
                    for (i = 1; i <= degreeF; ++i) {
                        res = res * x + coeffF[i];
                    }
                }
            }
            else {
                res = coeffF[degreeF];
            }
        }
        else {
            res = coeffF[degreeF];
        }

        return res;
    };

    /**
     * Calculates coefficients of polynomial derivative.
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Array} coeffPolyDeriv - coefficients of polynomial derivative to be passed out
     * @return {Boolean} true if derivative coefficients were successfully calculated
     * @version 1.0
     */
    IFMath.prototype.getCoeffPolyDeriv = function (coeffPoly, degreePoly, coeffPolyDeriv) {
        var i = 0;
        var res = false;

        if (degreePoly >= 1) {
            for (i = 0; i < degreePoly; ++i) {
                coeffPolyDeriv[i] = coeffPoly[i] * (degreePoly - i);
            }

            res = true;
        }

        return res;
    };

    /**
     * Finds roots of cubic polynomial on an interval.
     * @param {Array} coeffG - array of cubic polynomial coefficients, starting from the highest degree
     * @param {Number} p0 - interval start
     * @param {Number} p1 - interval end
     * @param {Array} gRoots - array of polynomial roots to be passed out
     * @param {Boolean} inclEnds indicates if interval ends should be checked when locating polynomial roots
     * @param {Number} acc - desired accuracy of roots calculation
     * @return {Number} number of found roots
     * @version 1.0
     */
    IFMath.prototype.getCubicRoots = function (coeffG, p0, p1, gRoots, inclEnds, acc) {
        var t1, t2, discr, sqrtD, nRoots;
        var a, b, c, d;
        var g0, g1, gt1, gt2;
        var gRootsN = 0;

        var coeffs = new Float64Array(4);
        var coeffInversed = new Float64Array(4);
        var cDeriv = new Float64Array(3);
        var cDeriv2 = new Float64Array(2);
        //var acc = 1e-6;
        var r;
        var i;
        var accNeg = -acc;

        if (p0 >= p1) {
            return 0;
        }

        if (coeffG[0] < 0) {
            for (i = 0; i < 4; ++i) {
                coeffs[i] = -coeffG[i];
            }
        }
        else {
            for (i = 0; i < 4; ++i) {
                coeffs[i] = coeffG[i];
            }
        }

        // g(t) = at^3 + b*t^2 +c*t + d = 0, t from [p0, p1]
        // g't = 3at^2 + 2t*b + c   = 0  => t1 <= t2
        // g''t = 6at +2b

        // below is much code, but the method should be fast, because only one branch will work,
        // TODO: but if the method below will not be fast enough, try exact formulas for
        // roots of 3d-degree polynomial, may be they will be faster...

        a = coeffs[0];
        b = coeffs[1];
        c = coeffs[2];
        d = coeffs[3];

        if (p0 == 0 && p1 == 1) {
            this.inversePolyUnaryInterval(coeffs, 3, coeffInversed);
        }
        else {
            this.inversePolyInterval(coeffs, 3, p0, p1, coeffInversed);
        }


        if (this.estimPositiveRootsDescartes(coeffInversed, 3) == 0) {
            return 0;
        }

        this.getCoeffPolyDeriv(coeffs, 3, cDeriv);

        cDeriv2[0] = 6 * a;
        cDeriv2[1] = 2 * b;

        discr = b * b - cDeriv[0] * c;
        nRoots = 0;
        if (discr == 0) {
            nRoots = 1;
            t1 = -b / cDeriv[0];
            t2 = t1;
        }
        else if (discr > 0) {
            nRoots = 2;
            sqrtD = Math.sqrt(discr);
            t1 = (-b - sqrtD) / cDeriv[0];
            t2 = (-b + sqrtD) / cDeriv[0];
        }

        // value of polinomial at p0
        g0 = this.evalCubic(a, b, c, d, p0);
        // value of polinomial at p1
        g1 = this.evalCubic(a, b, c, d, p1);

        // [-inf, t1], [t2, inf]
        if (nRoots == 0 || t1 >= p1 || t2 <= p0) {
            if (accNeg <= g0 && g0 <= acc) {
                if (inclEnds) {
                    gRoots[gRootsN] = p0;
                    gRootsN += 1;
                }
            }
            else {
                if (accNeg <= g1 && g1 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p1;
                        gRootsN += 1;
                    }
                }
                // g0 > 0 || g1 < 0 => no root
                else if (g0 < 0 && g1 > 0) {

                    r = this.locateByNewton(
                        p0, p1, g0, g1,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (p1 + p0) / 2;
                    }
                    gRootsN += 1;
                }
            }
        }
        // nRoots > 0 && t1 < p1 && t2 > p0

        // t1 <= p0 < p1 <= t2
        else if (t1 <= p0 && t2 >= p1) {
            if (accNeg <= g0 && g0 <= acc) {
                if (inclEnds) {
                    gRoots[gRootsN] = p0;
                    gRootsN += 1;
                }
            }
            else {
                if (accNeg <= g1 && g1 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p1;
                        gRootsN += 1;
                    }
                }
                // g0 < 0 || g1 > 0 => no root
                else if (g0 > 0 && g1 < 0) {
                    r = this.locateByNewton(
                        p0, p1, g0, g1,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (p1 + p0) / 2;
                    }

                    gRootsN += 1;
                }
            }
        }

        // p0 < t1 < p1 <= t2
        else if (t1 > p0 && t2 >= p1) {
            gt1 = this.evalCubic(a, b, c, d, t1);
            if (accNeg <= gt1 && gt1 <= acc) {
                gRoots[gRootsN] = t1;
                gRootsN += 1;
            }
            // gt1 < 0 => no root
            else if (gt1 > 0) {

                // locate in [p0, t1]
                if (accNeg <= g0 && g0 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p0;
                        gRootsN += 1;
                    }
                }
                // g0 > 0 => no root
                else if (g0 < 0) {
                    r = this.locateByNewton(
                        p0, t1, g0, gt1,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (p0 + t1) / 2;
                    }

                    gRootsN += 1;
                }

                // locate in [t1, p1]
                if (accNeg <= g1 && g1 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p1;
                        gRootsN += 1;
                    }
                }
                // g1 > 0 => no root
                else if (g1 < 0) {
                    r = this.locateByNewton(
                        t1, p1, gt1, g1,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (t1 + p1) / 2;
                    }

                    gRootsN += 1;
                }
            }
        }

        // t1 <= p0 < t2 < p1
        else if (t1 <= p0 && t2 < p1) {
            gt2 = this.evalCubic(a, b, c, d, t2);
            if (accNeg <= gt2 && gt2 <= acc) {
                gRoots[gRootsN] = t2;
                gRootsN += 1;
            }
            // gt2 > 0 => no root
            else if (gt2 < 0) {

                // locate in [p0, t2]
                if (accNeg <= g0 && g0 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p0;
                        gRootsN += 1;
                    }
                }
                // g0 < 0 => no root
                else if (g0 > 0) {
                    r = this.locateByNewton(
                        p0, t2, g0, gt2,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (p0 + t2) / 2;
                    }

                    gRootsN += 1;
                }

                // locate in [t2, p1]
                if (accNeg <= g1 && g1 <= acc) {
                    if (inclEnds) {
                        gRoots[gRootsN] = p1;
                        gRootsN += 1;
                    }
                }
                // g1 < 0 => no root
                else if (g1 > 0) {
                    r = this.locateByNewton(
                        t2, p1, gt2, g1,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (t2 + p1) / 2;
                    }

                    gRootsN += 1;
                }
            }
        }

        // p0 < t1 <= t2 < p1
        else {
            if (t1 == t2) {
                gt1 = this.evalCubic(a, b, c, d, t1);
                if (accNeg <= gt1 && gt1 <= acc) {
                    gRoots[gRootsN] = t1;
                    gRootsN += 1;
                }
                else {
                    if (accNeg <= g0 && g0 <= acc) {
                        if (inclEnds) {
                            gRoots[gRootsN] = p0;
                            gRootsN += 1;
                        }
                    }
                    else {
                        if (accNeg <= g1 && g1 <= acc) {
                            if (inclEnds) {
                                gRoots[gRootsN] = p1;
                                gRootsN += 1;
                            }
                        }
                        else if (gt1 < 0 && g1 > 0) {
                            r = this.locateByNewton(
                                t1, p1, gt1, g1,
                                coeffs, 3, cDeriv, cDeriv2, acc);

                            if (r != null) {
                                gRoots[gRootsN] = r;
                            }
                            else {
                                gRoots[gRootsN] = (t1 + p1) / 2;
                            }

                            gRootsN += 1;
                        }
                        else if (g0 < 0 && gt1 > 0) {
                            r = this.locateByNewton(
                                p0, t1, g0, gt1,
                                coeffs, 3, cDeriv, cDeriv2, acc);

                            if (r != null) {
                                gRoots[gRootsN] = r;
                            }
                            else {
                                gRoots[gRootsN] = (p0 + t1) / 2;
                            }

                            gRootsN += 1;
                        } // else no root
                    }
                }
            }
            else { // p0 < t1 < t2 < p1
                gt1 = this.evalCubic(a, b, c, d, t1);
                gt2 = this.evalCubic(b, b, c, d, t2);

                if (gt1 <= 0 || gt2 >= 0) {
                    if (accNeg <= gt1 && gt1 <= acc) {
                        gRoots[gRootsN] = t1;
                        gRootsN += 1;
                    }

                    if (gt1 <= 0) {
                        if (accNeg <= g1 && g1 <= acc) {
                            if (inclEnds) {
                                gRoots[gRootsN] = p1;
                                gRootsN += 1;
                            }
                        }
                        // g1 < 0 => no root
                        else if (gt2 < 0 && g1 > 0) {
                            r = this.locateByNewton(
                                t2, p1, gt2, g1,
                                coeffs, 3, cDeriv, cDeriv2, acc);

                            if (r != null) {
                                gRoots[gRootsN] = r;
                            }
                            else {
                                gRoots[gRootsN] = (t2 + p1) / 2;
                            }

                            gRootsN += 1;
                        } // else no root
                    }

                    if (accNeg <= gt2 && gt2 <= acc) {
                        gRoots[gRootsN] = t2;
                        gRootsN += 1;
                    }

                    if (gt2 >= 0) {
                        if (accNeg <= g0 && g0 <= acc) {
                            if (inclEnds) {
                                gRoots[gRootsN] = p0;
                                gRootsN += 1;
                            }
                        }
                        // g0 > 0 => no root
                        else if (g0 < 0 && gt1 > 0) {
                            r = this.locateByNewton(
                                p0, t1, g0, gt1,
                                coeffs, 3, cDeriv, cDeriv2, acc);

                            if (r != null) {
                                gRoots[gRootsN] = r;
                            }
                            else {
                                gRoots[gRootsN] = (p0 + t1) / 2;
                            }

                            gRootsN += 1;
                        } // else no root
                    }
                }

                else { // gt1 > 0 && gt2 < 0
                    r = this.locateByNewton(
                        t1, t2, gt1, gt2,
                        coeffs, 3, cDeriv, cDeriv2, acc);

                    if (r != null) {
                        gRoots[gRootsN] = r;
                    }
                    else {
                        gRoots[gRootsN] = (t1 + t2) / 2;
                    }

                    gRootsN += 1;

                    if (accNeg <= g0 && g0 <= acc) {
                        if (inclEnds) {
                            gRoots[gRootsN] = p0;
                            gRootsN += 1;
                        }
                    }
                    // g0 > 0 => no root [p0, t1]
                    else if (g0 < 0 && gt1 > 0) {
                        r = this.locateByNewton(
                            p0, t1, g0, gt1,
                            coeffs, 3, cDeriv, cDeriv2, acc);

                        if (r != null) {
                            gRoots[gRootsN] = r;
                        }
                        else {
                            gRoots[gRootsN] = (p0 + t1) / 2;
                        }

                        gRootsN += 1;
                    }

                    if (accNeg <= g1 && g1 <= acc) {
                        gRoots[gRootsN] = p1;
                        gRootsN += 1;
                    }
                    // g1 < 0 => no root [t2, p1]
                    else if (gt2 < 0 && g1 > 0) {
                        r = this.locateByNewton(
                            t2, p1, gt2, g1,
                            coeffs, 3, cDeriv, cDeriv2, acc);

                        if (r != null) {
                            gRoots[gRootsN] = r;
                        }
                        else {
                            gRoots[gRootsN] = (t2 + p1) / 2;
                        }

                        gRootsN += 1;
                    }
                }
            }
        }

        return gRootsN;
    };

    /**
     * The maximal number of possible iterations to perform in Newton method (usually 4-10 should be enough)
     * @private
     */
    IFMath.prototype._maxIter = 100;

    /**
     * Calculates root of a polynomial on a segment using Newton method.
     * Only polynomials of degrees 3 and 5 are supported
     * @param {Number} a - segment start
     * @param {Number} b - segment end
     * @param {Number} fa - value of polynomial at segment start
     * @param {Number} fb - value of polynomial at segment end
     * @param {Array} coeffF - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreeF - polynomial degree
     * @param {Array} coeffFDeriv - coefficients of polynomial derivative
     * @param {Array} coeffFDeriv2 - coefficients of polynomial second derivative
     * @param {Number} acc - desired accuracy of a root calculation
     * @param {Array} sturmSeq - generalized Sturm sequence (array of polynomial coefficients arrays),
     * needed only for some specific cases of 5th degree polynomial, may be ommited in most cases
     * @param {Array} nSignVars - array of two numbers of Sturm sequence sign variations at segment ends,
     * needed only together with Sturm sequence, will be calculated if were not provided, or if some value was null

     * @return {Number} root if it was found, or null otherwise
     * @version 1.0
     */
    IFMath.prototype.locateByNewton = function (a, b, fa, fb, coeffF, degreeF, coeffFDeriv, coeffFDeriv2, acc, sturmSeq, nSignVars) {
        // TODO: check if the last vars will be set to null, if they are not specified in function call
        var x = null;
        var tmp;
        var degreeDeriv = degreeF - 1;
        var accNeg = -acc;
        var zeroNeg = -this.defaultEps;
        var i = 0;
        var val = acc + 1;
        var valDeriv2;
        var deriv2Root;
        var a1;
        var a2;
        var fa1;
        var fa2;
        var locateInitial;
        var nsv = [];
        var nSVars = [];
        var fVals = [];
        var nr;
        var x1;
        var rootsD2 = [];
        var rootsDeriv2 = [];
        var inclEnds;
        var useSt;
        var useSign;

        if (accNeg <= fa && fa <= acc) {
            return a;
        }
        if (accNeg <= fb && fb <= acc) {
            return b;
        }

        a1 = a;
        a2 = b;

        // locate correctly initial point: sign(f) == sign(f'')
        if (degreeF == 3) {
            deriv2Root = -coeffFDeriv2[1] / coeffFDeriv2[0]; // no need to check 0 here
            if (deriv2Root < a || deriv2Root > b) {
                valDeriv2 = coeffFDeriv2[0] * a + coeffFDeriv2[1];
                if (valDeriv2 > 0 && fa > 0 || valDeriv2 < 0 && fa < 0) {
                    x = a;
                    val = fa;
                }
                else {
                    valDeriv2 = coeffFDeriv2[0] * b + coeffFDeriv2[1];
                    if (valDeriv2 > 0 && fb > 0 || valDeriv2 < 0 && fb < 0) {
                        x = b;
                        val = fb;
                    }
                    else { // internal error
                        x = null;
                    }

                }
            }
            else {
                val = this.evalPoly(coeffF, degreeF, deriv2Root);
                if (accNeg <= val && val <= acc) {
                    // solution is found
                    x = deriv2Root;
                }
                else {
                    if (val > 0 && fa > 0 || val < 0 && fa < 0) {
                        a1 = deriv2Root + acc;
                        val = this.evalPoly(coeffF, degreeF, a1);
                        valDeriv2 = coeffFDeriv2[0] * a1 + coeffFDeriv2[1];
                        if (valDeriv2 > 0 && val > 0 || valDeriv2 < 0 && val < 0) {
                            x = a1;
                        }
                        else {
                            valDeriv2 = coeffFDeriv2[0] * b + coeffFDeriv2[1];
                            if (valDeriv2 > 0 && fb > 0 || valDeriv2 < 0 && fb < 0) {
                                x = b;
                                val = fb;
                            }
                            else { // internal error
                                x = null;
                            }

                        }
                    }
                    else if (val > 0 && fb > 0 || val < 0 && fb < 0) {
                        a2 = deriv2Root - acc;
                        val = this.evalPoly(coeffF, degreeF, a2);
                        valDeriv2 = coeffFDeriv2[0] * a2 + coeffFDeriv2[1];
                        if (valDeriv2 > 0 && val > 0 || valDeriv2 < 0 && val < 0) {
                            x = a2;
                        }
                        else {
                            valDeriv2 = coeffFDeriv2[0] * a + coeffFDeriv2[1];
                            if (valDeriv2 > 0 && fa > 0 || valDeriv2 < 0 && fa < 0) {
                                x = a;
                                val = fa;
                            }
                            else { // internal error
                                x = null;
                            }
                        }
                    }
                    else { // internal error
                        x = null;
                    }
                }
            }
        }
        else {
            if (degreeF != 5) {
                throw new Error("Unsupported polynomial degree.");
            }

            // find [a1, a2] and initial point x from [a1, a2]: sign(f(x)) == sign(f''(x)), and
            // sign(f'') permanent on [a1, a2]

            useSt = false;
            useSign = false;

            if (fa < 0 && fb > 0 || fa > 0 && fb < 0) {
                useSign = true;
            }
            else if (sturmSeq && nSignVars) {
                useSt = true;
            }

            locateInitial = true;

            inclEnds = false;
            this.getCubicRoots(coeffFDeriv2, a, b, rootsDeriv2, inclEnds, acc);

            i = 0;
            if (rootsDeriv2.length == 0) {
                a1 = a;
                fVals[0] = fa;
                a2 = b;
                fVals[1] = fb;
                if (useSt) {
                    nSVars[0] = nSignVars[0];
                    nSVars[1] = nSignVars[1];
                }
            }
            else {
                ifUtil.uSortSegment(a, b, rootsDeriv2, rootsD2);
                a1 = a;
                fVals[0] = fa;
                if (useSt) {
                    nSVars[0] = nSignVars[0];
                }
                while (i <= rootsD2.length) {
                    if (i > 0) {
                        a1 = a2;
                        fVals[0] = fVals[1];
                        if (useSt) {
                            nSVars[0] = nSVars[1];
                        }
                    }
                    if (i < rootsD2.length) {
                        a2 = rootsD2[i];
                        fVals[1] = null;
                        if (useSt) {
                            nSVars[1] = null;
                        }
                    }
                    else { // i == rootsD2.length
                        a2 = b;
                        fVals[1] = fb;
                        if (useSt) {
                            nSVars[1] = nSignVars[1];
                        }
                    }

                    if (useSign) {
                        if (fVals[1] == null) {
                            fVals[1] = this.evalPoly(coeffF, degreeF, a2);
                        }

                        if (this.isEqualEps(fVals[1], 0, acc)) {
                            x = a2;
                            val = fVals[1];
                            locateInitial = false;
                        }
                        if (fVals[0] > 0 && fVals[1] < 0 || fVals[0] < 0 && fVals[1] > 0) {
                            break;
                        }
                    }
                    if (useSt) {
                        nr = this.countRootsNSturm(
                            coeffF, degreeF, coeffFDeriv, a1, a2, sturmSeq, nSVars, fVals);

                        if (nr != 0) {
                            break;
                        }
                    }

                    ++i;
                }
            }

            // Now there is at least one root of F at [a1,a2], and no roots of F'' on (a1, a2)
            if (locateInitial && i == 0) {
                valDeriv2 = this.evalPoly(coeffFDeriv2, coeffFDeriv2.length - 1, a);
                if (valDeriv2 > 0 && fa > 0 || valDeriv2 < 0 && fa < 0) {
                    x = a;
                    val = fa;
                    locateInitial = false;
                }
            }
            if (locateInitial && i == rootsD2.length) {
                valDeriv2 = this.evalPoly(coeffFDeriv2, coeffFDeriv2.length - 1, b);
                if (valDeriv2 > 0 && fb > 0 || valDeriv2 < 0 && fb < 0) {
                    x = b;
                    val = fb;
                    locateInitial = false;
                }
            }
            if (locateInitial) {
                fa1 = fVals[0];
                fa2 = fVals[1];
                if (useSt) {
                    nsv = nSVars;
                }

                x = (a1 + a2) / 2;
                valDeriv2 = this.evalPoly(coeffFDeriv2, coeffFDeriv2.length - 1, x);

                while (a2 - a1 > acc && locateInitial) {
                    x = (a1 + a2) / 2;
                    val = this.evalPoly(coeffF, degreeF, x);
                    if (accNeg <= val && val <= acc) {
                        locateInitial = false;
                    }
                    else if (valDeriv2 > 0 && val > 0 || valDeriv2 < 0 && val < 0) {
                        locateInitial = false;
                    }
                    else if (val > 0 && fa1 < 0 || val < 0 && fa1 > 0) {
                        a2 = x;
                        fa2 = val;
                        if (useSt) {
                            nsv[1] = null;
                        }
                    }
                    else if (val > 0 && fa2 < 0 || val < 0 && fa2 > 0) {
                        a1 = x;
                        fa1 = val;
                        if (useSt) {
                            nsv[0] = null;
                        }
                    }
                    else if (useSign || !useSt) {
                        // if useSign -> internal error;
                        // if sturmSeq == null -> Though it is possible to calculate sturmSeq here,
                        // it is not expected in Newton algorithm.
                        //It is better to notify a caller that interval is not good enough for Newton algorithm.
                        locateInitial = false;
                        x = null;
                    }
                    else {  // sign(val) == sign(fa1) == sign(fa2) != sign(valDeriv2)
                        fVals = [fa1, val];
                        nSVars = [nsv[0], null];

                        nr = this.countRootsNSturm(
                            coeffF, degreeF, coeffFDeriv, a1, x, sturmSeq, nSVars, fVals);

                        if (nr > 0) {
                            a2 = x;
                            fa2 = val;
                            nsv[0] = nSVars[0];
                            nsv[1] = nSVars[1];
                        }
                        else {
                            if (nsv[1] != null && nSVars[1] == nsv[1]) {
                                // no root in the second half also -> internal error
                                locateInitial = false;
                            }
                            else {
                                a1 = x;
                                fa1 = val;
                                nsv[0] = nSVars[0];
                            }
                        }
                    }
                } // while (a2 - a1 > acc && locateInitial)

                if (locateInitial) {
                    x = (a1 + a2) / 2;
                    val = this.evalPoly(coeffF, degreeF, x);
                }

            }

        } // degreeF != 3

        // TODO: improve stop rule
        i = 1;
        while (x != null && (val < accNeg || acc < val) && i < this._maxIter) {
            tmp = this.evalPoly(coeffFDeriv, degreeDeriv, x);
            if (zeroNeg < tmp && tmp < this.defaultEps) {
                val = this.evalPoly(coeffF, degreeF, x);
                if (val < accNeg || acc < val) {
                    x = null;
                }
            }
            else {
                val = this.evalPoly(coeffF, degreeF, x);
                tmp = val / tmp;
                x1 = x;
                x = x - tmp;
                if (x <= a1 || x >= a2) {
                    // No convergence or calculations accuracy is reached
                    x = null;
                }
                if (tmp > 0) {
                    a2 = x1;
                }
                else if (tmp < 0) {
                    a1 = x1;
                }

            }
            ++i;
        }

        if (i == this._maxIter) {
            x = null;
        }

        return x;
    };

    /**
     * Finds roots of quadratic equation.
     * @param {Number} a - 2nd degree coefficient
     * @param {Number} b - linear coefficient
     * @param {Number} c - the constant term
     * @param {Array} roots - array of roots to be passed out
     * @version 1.0
     */
    IFMath.prototype.getQuadraticRoots = function (a, b, c, roots) {
        // ax^2 + bx + c = 0
        var discr;
        var sd;

        if (a == 0) {
            if (b != 0) {
                roots.push(-c / b);
            }
        }
        else {
            discr = b * b - 4 * a * c;
            if (discr == 0) {
                roots.push(-b / (2 * a));
            }
            else if (discr > 0) {
                sd = Math.sqrt(discr);
                roots.push((-b + sd) / (2 * a));
                roots.push((-b - sd) / (2 * a));
            }
        }
    };

    /**
     * Returns pseudo reminder from polynomials division as described in the book of
     * Chee-Keng Yap "Fundamental Problems in Algorithmic Algebra".
     * @param {Array} coeffP1 - array of numerator polynomial coefficients, starting from the highest degree
     * @param {Array} coeffP2 - array of divisor polynomial coefficients, starting from the highest degree
     * @param {Array} prem - coefficients of pseudo-reminder to be passed out
     * @return {Number} numerator multiplier
     * @private
     * @version 1.0
     */
    IFMath.prototype._pseudoRem = function (coeffP1, coeffP2, prem) {
        var rem1 = [];
        var j;
        var q;
        var rem2 = [];
        var middlezero;
        var cont = true;
        var c = coeffP2[0];
        var i;
        var t;

        if (coeffP2.length > coeffP1.length) {
            prem = coeffP1;
            return 1;
        }

        for (i = 2; i <= coeffP1.length - coeffP2.length + 1; ++i) {
            c *= coeffP2[0];
        }

        for (i = 0; i < coeffP1.length; ++i) {
            rem1[i] = coeffP1[i] * c;
        }

        while (cont) {
            q = rem1[0] / coeffP2[0];
            middlezero = false;
            for (j = 1; j < coeffP2.length; ++j) {
                t = rem1[j] - q * coeffP2[j];
                if (t != 0 || middlezero) {
                    rem2.push(t);
                    if (t != 0) {
                        middlezero = true;
                    }
                }
            }

            for (j = coeffP2.length; j < rem1.length; ++j) {
                rem2.push(rem1[j]);
            }

            if (rem2.length >= coeffP2.length) {
                rem1 = rem2;
                rem2 = [];
            }
            else {
                cont = false;
            }
        }

        if (rem2.length > 0) {
            for (i = 0; i < rem2.length; ++i) {
                prem[i] = rem2[i];
            }
        }
        return c;
    };

    /**
     * Calculates generalized Sturm sequence based on improved Collins pseudo-reminder sequence.
     * The used generalized Sturm sequence is described in the book of
     * Chee-Keng Yap "Fundamental Problems in Algorithmic Algebra".
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Array} coeffPolyDeriv - coefficients of polynomial derivative
     * @param {Array} sturmPRS - generalized Sturm sequence (array of polynomial coefficients arrays) to be passed out
     * @version 1.0
     */
    IFMath.prototype.getSturmPRS = function (coeffPoly, degreePoly, coeffPolyDeriv, sturmPRS) {
        var a = [];
        var beta = [];
        var delta = [];
        var ksi = [];
        var prem = [];
        var i;
        var j;
        var k;
        var ksideg;
        var onedeg;
        var adeg;
        var pCoeff;
        var sturmD = [];

        beta[0] = null;
        sturmPRS[0] = coeffPoly;
        sturmPRS[1] = coeffPolyDeriv;
        a[0] = coeffPoly[0];
        a[1] = coeffPolyDeriv[0];
        delta[0] = 1;
        beta[1] = 1;
        ksi[0] = 1;
        ksi[1] = a[1];

        sturmD[0] = 1;
        sturmD[1] = 1;

        for (i = 1; i < degreePoly; ++i) {
            prem = [];
            pCoeff = this._pseudoRem(sturmPRS[i - 1], sturmPRS[i], prem);
            if (prem.length == 0) {
                break;
            }
            sturmPRS[i + 1] = [];
            for (j = 0; j < prem.length; ++j) {
                sturmPRS[i + 1][j] = prem[j] / beta[i];
            }
            delta[i] = sturmPRS[i + 1].length - sturmPRS[i].length;
            a[i + 1] = sturmPRS[i + 1][0];
            ksideg = 1;
            onedeg = 1;
            adeg = a[i + 1];
            for (k = 2; k <= delta[i]; ++k) {
                ksideg *= ksi[i];
                onedeg = -onedeg;
                adeg *= a[i + 1];
            }
            beta[i + 1] = onedeg * ksideg * ksi[i] * a[i];
            ksi[i + 1] = adeg / ksideg;
            if (beta[i] > 0 && pCoeff > 0 || beta[i] < 0 && pCoeff < 0) {
                sturmD[i + 1] = -sturmD[i - 1];
            }
            else {
                sturmD[i + 1] = sturmD[i - 1];
            }
        }

        for (i = 2; i < sturmPRS.length; ++i) {
            if (sturmD[i] < 0) {
                for (j = 0; j < sturmPRS[i].length; ++j) {
                    sturmPRS[i][j] = -sturmPRS[i][j];
                }
            }
        }
    };

    /**
     * Calculates number of distinct real roots of a polynomial on an interval using Sturm sequence.
     * @param {Array} coeffF - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreeF - polynomial degree
     * @param {Array} coeffFDeriv - coefficients of polynomial derivative
     * @param {Number} a - segment start
     * @param {Number} b - segment end
     * @param {Array} sturmSeq - generalized Sturm sequence (array of polynomial coefficients arrays)
     * @param {Array} nSignVars - array of two numbers of Sturm sequence sign variations at segment ends,
     * will be calculated and passed out if were not provided, or if some value was null
     * @param {Array} fVals - array of two numbers of polynomial values at segment ends,
     * will be calculated and passed out if were not provided, or if some value was null

     * @return {Number} number of distinct real roots of a polynomial on an interval
     * @version 1.0
     */
    IFMath.prototype.countRootsNSturm = function (coeffF, degreeF, coeffFDeriv, a, b, sturmSeq, nSignVars, fVals) {
        var na = 0;
        var nb = 0;
        var s1;
        var s2;
        var i;

        if (nSignVars[0] == null) {
            if (fVals[0] == null) {
                fVals[0] = this.evalPoly(sturmSeq[0], sturmSeq[0].length - 1, a);
            }
            s1 = fVals[0];
            for (i = 1; i < sturmSeq.length; ++i) {
                s2 = this.evalPoly(sturmSeq[i], sturmSeq[i].length - 1, a);
                if (s2 != 0 && (s1 < 0 && s2 > 0 || s1 > 0 && s2 < 0)) {
                    ++na;
                    s1 = s2;
                }
            }

            nSignVars[0] = na;
        }
        else {
            na = nSignVars[0];
        }

        if (nSignVars[1] == null) {
            if (fVals[1] == null) {
                fVals[1] = this.evalPoly(sturmSeq[0], sturmSeq[0].length - 1, b);
            }
            s1 = fVals[1];
            for (i = 1; i < sturmSeq.length; ++i) {
                s2 = this.evalPoly(sturmSeq[i], sturmSeq[i].length - 1, b);
                if (s2 != 0 && (s1 < 0 && s2 > 0 || s1 > 0 && s2 < 0)) {
                    ++nb;
                    s1 = s2;
                }
            }

            nSignVars[1] = nb;
        }
        else {
            nb = nSignVars[1];
        }

        if (na > nb) {
            return na - nb;
        }
        else {
            return nb - na;
        }
    };

    /**
     * On an initial interval [a, b] locates smaller intervals,
     * each containing only one distinct real root of a polynomial.
     * Sturm sequence is used for this task.
     * @param {Array} coeffF - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreeF - polynomial degree
     * @param {Array} coeffFDeriv - coefficients of polynomial derivative
     * @param {Number} a - segment start
     * @param {Number} b - segment end
     * @param {Array} sturmSeq - generalized Sturm sequence (array of polynomial coefficients arrays)
     * @param {Number} nRoots - number of distinct roots on an initial interval [a, b]
     * @param {Array} nSignVars - array of two numbers of Sturm sequence sign variations at segment ends,
     * will be calculated and passed out if were not provided, or if some value was null
     * @param {Array} fVals - array of two numbers of polynomial values at segment ends,
     * will be calculated and passed out if were not provided, or if some value was null
     * @param {Array} rIntervals - array of root location intervals (interval - array of two numbers, interval ends)
     * @version 1.0
     */
    IFMath.prototype.locRootsSturm = function (coeffF, degreeF, coeffFDeriv, a, b, sturmSeq, nRoots, nSignVars, fVals, rIntervals) {
        var midPt;
        var nSignVars1;
        var fVals1;
        var n1, n2;

        if (nRoots <= 1) {
            return;
        }

        midPt = (a + b) / 2;
        nSignVars1 = [nSignVars[0], null];
        fVals1 = [fVals[0], null];
        n1 = this.countRootsNSturm(coeffF, degreeF, coeffFDeriv, a, midPt, sturmSeq, nSignVars1, fVals1);
        n2 = nRoots - n1;
        if (n1 == 1) {
            rIntervals.push([a, midPt, fVals1[0], fVals1[1]]);
        }
        if (n1 > 1) {
            this.locRootsSturm(coeffF, degreeF, coeffFDeriv, a, midPt,
                sturmSeq, n1, nSignVars1, fVals1, rIntervals);
        }
        if (n2 == 1) {
            rIntervals.push([midPt, b, fVals1[1], fVals[1]]);
        }
        if (n2 > 1) {
            var nSignVars2 = [nSignVars1[1], nSignVars[1]];
            var fVals2 = [fVals1[1], fVals[1]];
            this.locRootsSturm(coeffF, degreeF, coeffFDeriv, midPt, b,
                sturmSeq, n2, nSignVars2, fVals2, rIntervals);
        }
    };

    /**
     * Calculates shifted polynomial coefficients (x = x+b).
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Number} b - original parameter shift value: x = x+b
     * @param {Array} coeffPolyShifted - coefficients of shifted polynomial to be passed out
     * @version 1.0
     */
    IFMath.prototype.shiftPoly = function (coeffPoly, degreePoly, b, coeffPolyShifted) {
        // the binomial theorem:
        // (x + b)^n = SUM{i=0, i=n}(n!/(i!*(n-i)!))*x^(n-i)*b^i
        var i, j;
        var bD = [];
        bD[0] = 1;
        for (i = 1; i <= degreePoly; ++i) {
            bD.push(b * bD[i - 1]);
        }

        coeffPolyShifted[0] = coeffPoly[0];

        for (i = 1; i <= degreePoly; ++i) {
            coeffPolyShifted[i] = coeffPoly[i];
            for (j = 0; j < i; ++j) {
                coeffPolyShifted[i] += this.combNK(degreePoly - j, i - j) * coeffPoly[j] * bD[i - j];
            }
        }
    };

    /**
     * An array with the number combinations from 5
     * @private
     */
    IFMath.prototype._numComb5 = [1, 5, 10, 10, 5, 1];

    /**
     * An array with the number combinations from 4
     * @private
     */
    IFMath.prototype._numComb4 = [1, 4, 6, 4, 1];

    /**
     * An array with the number combinations from 3
     * @private
     */
    IFMath.prototype._numComb3 = [1, 3, 3, 1];

    /**
     * An array with the number combinations from 2
     * @private
     */
    IFMath.prototype._numComb2 = [1, 2, 1];

    /**
     * An array with the number combinations from 1
     * @private
     */
    IFMath.prototype._numComb1 = [1, 1];

    /**
     * Returns a number of combinations from N by K.
     * Only N from 1 to 5 is supported
     * @param {Number} N
     * @param {Number} K
     * @return {Number} number of combinations from N by K
     * @version 1.0
     */
    IFMath.prototype.combNK = function (N, K) {
        if (N <= 5 && K <= N) {
            if (N == 5) {
                return this._numComb5[K];
            }
            if (N == 4) {
                return this._numComb4[K];
            }
            if (N == 3) {
                return this._numComb3[K];
            }
            if (N == 2) {
                return this._numComb2[K];
            }
            if (N == 1) {
                return this._numComb1[K];
            }
        }
        else {
            throw new Error("Combinations calculation not implemented");
        }
        return 0;
    };

    /**
     * Calculates shifted polynomial coefficients, when original interval is shifted to one (x = x+1).
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Array} coeffPolyShifted - coefficients of shifted polynomial to be passed out
     * @version 1.0
     */
    IFMath.prototype.shiftPolyOne = function (coeffPoly, degreePoly, coeffPolyShifted) {
        // the binomial theorem:
        // (x + 1)^n = SUM{i=0, i=n}(n!/(i!*(n-i)!))*x^(n-i)

        var i, j;

        coeffPolyShifted[0] = coeffPoly[0];

        for (i = 1; i <= degreePoly; ++i) {
            coeffPolyShifted[i] = coeffPoly[i];
            for (j = 0; j < i; ++j) {
                coeffPolyShifted[i] += this.combNK(degreePoly - j, i - j) * coeffPoly[j];
            }
        }
    };

    /**
     * Applies transformations to original interval [a, b] so that it becomes (+inf, 0]:
     * Pnew(x) = (1+x)^n * P((ax+b)/(1+x)),
     * And calculates coefficients of the resulted polynomial
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Number} a - segment start
     * @param {Number} b - segment end
     * @param {Array} coeffPolyInversed - coefficients of transformed polynomial to be passed out
     * @version 1.0
     */
    IFMath.prototype.inversePolyInterval = function (coeffPoly, degreePoly, a, b, coeffPolyInversed) {
        var i;
        var c;
        var aD;

        var coeffs = new Float32Array(degreePoly + 1);

        for (i = 0; i <= degreePoly; ++i) {
            coeffs[i] = coeffPoly[i];
        }

        // x = a*x + b
        // 1) x = x + b
        this.shiftPoly(coeffPoly, degreePoly, a, coeffs);

        // 2) x = ax
        c = b - a;
        if (c != 0) {
            aD = 1;
            for (i = 1; i <= degreePoly; ++i) {
                aD /= c;
                coeffs[degreePoly - i] *= aD;
            }
        }

        this.inversePolyUnaryInterval(coeffs, degreePoly, coeffPolyInversed);
    };

    /**
     * Applies transformations to original unary interval [0, 1] so that it becomes (+inf, 0]:
     * Pnew(x) = (1+x)^n * P(1/(1+x)),
     * And calculates coefficients of the resulted polynomial
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @param {Array} coeffPolyInversed - coefficients of transformed polynomial to be passed out
     * @version 1.0
     */
    IFMath.prototype.inversePolyUnaryInterval = function (coeffPoly, degreePoly, coeffPolyInversed) {
        var i;
        var coeffs = new Float32Array(degreePoly + 1);
        for (i = 0; i <= degreePoly; ++i) {
            coeffs[i] = coeffPoly[degreePoly - i];
        }

        // x = x+1
        this.shiftPolyOne(coeffs, degreePoly, coeffPolyInversed);
    };

    /**
     * Estimates the number of positive real roots of a polynomial using Descartes rule of sign
     * @param {Array} coeffPoly - array of polynomial coefficients, starting from the highest degree
     * @param {Number} degreePoly - polynomial degree
     * @return {Number} maximal number of positive real roots of a polynomial
     * @version 1.0
     */
    IFMath.prototype.estimPositiveRootsDescartes = function (coeffPoly, degreePoly) {
        var nonZeroCoeff = [];
        var num = 0;
        var nVarSign = 0;
        var i;

        for (i = 0; i <= degreePoly; ++i) {
            if (coeffPoly[i] != 0) {
                nonZeroCoeff.push(coeffPoly[i]);
                ++num;
            }
        }

        for (i = 0; i < num - 1; ++i) {
            if (nonZeroCoeff[i] > 0 && nonZeroCoeff[i + 1] < 0 ||
                nonZeroCoeff[i] < 0 && nonZeroCoeff[i + 1] > 0) {

                nVarSign += 1;
            }
        }

        return nVarSign;
    };

    /**
     * Construct IFPoint so, that the segment from the previous point and the new point
     * has the angle of 0 or 45 degrees with X or Y axis, and the new point has unchanged at least one of
     * originally supplied x and y coordinates (the one with the highest delta from previous point)
     * @param {Number} prevX - x coordinate of the previous point
     * @param {Number} prevY - y coordinate of the previous point
     * @param {Number} origX - originally supplied x coordinate for the new point
     * @param {Number} origY - originally supplied y coordinate for the new point
     * @param {Number} rotation - if supplied, means angle in radians at which axes should be rotated before constraining
     * @returns {IFPoint} new point, making constrain segment with the previous point
     * @version 1.0
     */
    IFMath.prototype.convertToConstrain = function (prevX, prevY, origX, origY, rotation) {
        // TODO : Move this somewhere else as this is not really but but uses IFTransform which
        // actually is not part of the core
        var dx, dy;
        var tan;
        var tanPIdiv8 = 0.4142;
        var newY, newX;

        var backTransform = new IFTransform(1, 0, 0, 1, 0, 0);
        if (rotation) {
            backTransform = backTransform.rotated(rotation);
        }
        backTransform = backTransform.translated(prevX, prevY);
        var transform = backTransform.inverted();

        var origTransformed = transform.mapPoint(new IFPoint(origX, origY));
        var origTrX = origTransformed.getX();
        var origTrY = origTransformed.getY();
        dx = Math.abs(origTrX);
        dy = Math.abs(origTrY);
        if (!this.isEqualEps(dx, 0) && !this.isEqualEps(dy, 0) && !this.isEqualEps(dx - dy, 0)) {
            if (dx > dy) {
                newX = origTrX;
                tan = dy / dx;
                if (tan < tanPIdiv8) {
                    newY = 0;
                } else {
                    if (0 > origTrY) {
                        newY = -dx;
                    } else {
                        newY = dx;
                    }
                }
            } else {
                newY = origTrY;
                tan = dx / dy;
                if (tan < tanPIdiv8) {
                    newX = 0;
                } else {
                    if (0 > origTrX) {
                        newX = -dy;
                    } else {
                        newX = dy;
                    }
                }
            }
        } else {
            newX = origTrX;
            newY = origTrY;
        }

        return backTransform.mapPoint(new IFPoint(newX, newY));
    };

    _.ifMath = new IFMath();
})(this);