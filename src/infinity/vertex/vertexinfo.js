(function (_) {

    /**
     * Static vertex information collector used for bbox calc, hit-test etc.
     * @class IFVertexInfo
     * @version 1.0
     * @constructor
     */
    function IFVertexInfo() {
    }

    // -----------------------------------------------------------------------------------------------------------------
    // IFVertexInfo.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A class to keep the result of a hit test
     * @class IFVertexInfo.HitResult
     * @constructor
     * @version 1.0
     */
    IFVertexInfo.HitResult = function () {
    };

    /**
     * Defines the index of the segment that
     * has been hit
     * @type {Number}
     * @version 1.0
     */
    IFVertexInfo.HitResult.prototype.segment = null;

    /**
     * Defines the exact x-coordinate of the
     * hit within the segment that was hit. The
     * coordinate will always be on the exact
     * outline no matter of the outline width
     * or alignment.
     * @type {Number}
     * @version 1.0
     */
    IFVertexInfo.HitResult.prototype.x = null;

    /**
     * Defines the exact y-coordinate of the
     * hit within the segment that was hit. The
     * coordinate will always be on the exact
     * outline no matter of the outline width
     * or alignment.
     * @type {Number}
     * @version 1.0
     */
    IFVertexInfo.HitResult.prototype.y = null;

    /**
     * Defines the slope of the hit within
     * the segment that was hit
     * @type {Number}
     * @version 1.0
     */
    IFVertexInfo.HitResult.prototype.slope = null;

    /**
     * Defines whether the hit is on the outline
     * or not (which means it is on the area)
     * @type {Boolean}
     * @version 1.0
     */
    IFVertexInfo.HitResult.prototype.outline = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFVertexInfo Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Tests if a point is on the segment stroke.
     * Calculate distance using this approach:
     * http://msdn.microsoft.com/en-us/library/ms969920.aspx
     * @param {Number} px1 the x-position of the segment start point
     * @param {Number} py1 the y-position of the segment start point
     * @param {Number} px2 the x-position of the segment end point
     * @param {Number} py2 the y-position of the segment end point
     * @param {Number} x the x-position of the point to test
     * @param {Number} y the y-position of the point to test
     * @param {Number} sqrOutline squared half-width of stroke
     * @param {Number} chainIdx an index of the segment in the path to be written into result, when segment is hit
     * @param {IFVertexInfo.HitResult} result if the function returns true, means
     * a hit was found then this is the result structure that will be filled
     * with the hit information

     * @return {Boolean} true, if a point is on the stroke
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitTestSegment = function (px1, py1, px2, py2, x, y, sqrOutline, chainIdx, result) {
        // ptMin[0] for [a, b]: 0 - min dist in a; 1 - min dist in b; 0 < t < 1- min dist in a+t*(b-a) ==
        var ptMin = [];
        var sqrDst = ifMath.sqrSegmentDist(px1, py1, px2, py2, x, y, ptMin, sqrOutline);

        if (sqrDst <= sqrOutline) {
            // Fill result
            if (result) {
                result.segment = chainIdx;
                result.x = px1 + ptMin[0] * (px2 - px1);
                result.y = py1 + ptMin[0] * (py2 - py1);
                result.slope = ptMin[0];
                result.outline = true;
            }
            return true;
        }

        return false;
    };

    /**
     * Tests if a point is on the quadratic Bezier curve stroke.
     * Polynomial equation of 3d degree is solved to find the minimal distance from point to curve.
     * @param {Number} px1 the x-position of the curve start point
     * @param {Number} py1 the y-position of the curve start point
     * @param {Number} px2 the x-position of the curve end point
     * @param {Number} py2 the y-position of the curve end point
     * @param {Number} cx the x-position of the control point
     * @param {Number} cy the y-position of the control point
     * @param {Number} x the x-position of the point to test
     * @param {Number} y the y-position of the point to test
     * @param {Number} sqrOutline squared half-width of stroke
     * @param {Number} chainIdx an index of the curve in the path to be written into result, when curve is hit
     * @param {IFVertexInfo.HitResult} result if the function returns true, means
     * a hit was found then this is the result structure that will be filled
     * with the hit information

     * @return {Boolean} true, if a point is on the stroke
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitTestCurve = function (px1, py1, px2, py2, cx, cy, x, y, sqrOutline, chainIdx, result) {
        // The first and the second quadratic curve coefficients for P(t)x and P(t)y
        var ax, ay, bx, by;

        // Squared distances to curve convex hull segments
        var d1, d2, d3;
        var ptMin = []; // ptMin[0] for [a, b]: 0 - min dist in a; 1 - min dist in b; 0 < t < 1- min dist in a+t*(b-a)

        // Coefficients of 4th degree distance polynomial
        var coeffF = new Float64Array(5);

        // Coefficients of derivative polynomial
        var coeffG = new Float64Array(4);
        var b, c, d;

        // Roots of derivative polynomial and their number
        var gRoots = [];
        var gRootsN;

        // Accuracy of roots calculation
        var acc = 1e-6;

        // Flags used for analysis of point and curve pience relative position
        var hitPossible = false;
        var insideFlag = true;

        // Minimal distance from point to curve
        var min;
        // Index of distance minimizing point in the array of derivative polynomial roots
        var hitPtIdx;

        // Indicates if interval ends should be checked when locating polynomial roots on the interval
        var inclEnds;

        // Coordinates of curve control points center of gravity
        var middlePtx, middlePty;

        // Auxiliary variables
        var tmp1;
        var i;

        middlePtx = (px1 + px2 + cx) / 3;
        middlePty = (py1 + py2 + cy) / 3;

        d1 = ifMath.sqrSegmentDist(px1, py1, px2, py2, x, y, ptMin, sqrOutline);
        if (d1 <= sqrOutline) {
            hitPossible = true;
        }
        else if (ifMath.segmentSide(px1, py1, px2, py2, x, y) *
            ifMath.segmentSide(px1, py1, px2, py2, middlePtx, middlePty) < 0) {
            insideFlag = false;
        }

        // Curve end is hit, no need to look for closer point
        if (hitPossible && (ptMin[0] == 0 || ptMin[0] == 1)) {
            if (result) {
                result.segment = chainIdx;
                result.outline = true;
                result.slope = ptMin[0];

                if (ptMin[0] == 0) {
                    result.x = px1;
                    result.y = py1;
                }
                else { // ptMin[0] == 1
                    result.x = px2;
                    result.y = py2;
                }
            }
            return true;
        }

        d2 = ifMath.sqrSegmentDist(px1, py1, cx, cy, x, y);
        if (d2 <= sqrOutline) {
            hitPossible = true;
        }
        else if (ifMath.segmentSide(px1, py1, cx, cy, x, y) *
            ifMath.segmentSide(px1, py1, cx, cy, middlePtx, middlePty) < 0) {
            insideFlag = false;
        }

        d3 = ifMath.sqrSegmentDist(cx, cy, px2, py2, x, y);
        if (d3 <= sqrOutline) {
            hitPossible = true;
        }
        else if (ifMath.segmentSide(cx, cy, px2, py2, x, y) *
            ifMath.segmentSide(cx, cy, px2, py2, middlePtx, middlePty) < 0) {
            insideFlag = false;
        }

        if (!hitPossible && !insideFlag) {
            return false;
        }

        // find directly curve point, minimizing distance
        // P(t) = t^2(P2 - 2C + P1) + 2t(C-P1) + P1
        // P(t) = t^2A + tB + D
        // F(x(t), y(t)) = (x - x(t))^2 + (y - y(t))^2 -> min
        // F(t) = t^4*ax^2 + t^2*bx^2 + dx^2 +
        //        2t^3*ax*bx + 2t^2* ax*dx + 2t*bx*dx + 
        //        x^2 - 2x*t^2*ax - 2x*t*bx -2x*dx +
        //        t^4*ay^2 + t^2*by^2 + dy^2 +
        //        2t^3*ay*by + 2t^2* ay*dy + 2t*by*dy + 
        //        y^2 - 2y*t^2*ay - 2y*t*by -2y*dy
        // dF(t)/dt = 4t^3*ax^2 + 2t*bx^2 + 6t^2*ax*bx + 4t*ax*dx + 2bx*dx - 
        //            4t*x*ax - 2x*bx +
        //            4t^3*ay^2 + 2t*by^2 + 6t^2*ay*by + 4t*ay*dy + 2by*dy - 
        //            4t*y*ay - 2y*by =
        //    = 2* ( 
        //      2t^3(ax^2 + ay^2) + 3t^2(ax*bx + ay*by) +
        //      t(bx^2 + 2ax*dx - 2x*ax + by^2 + 2ay*dy - 2y*ay) +
        //      bx*dx - x*bx + by*dy - y*by
        //      )
        // df/dt = 0 <==> 2t^3(a, a) + 3t^2(a,b) + 
        // t( (b,b) + 2(a,d) -2(p,a) ) + (b,d) - (p,b) = 0
        // 
        // g(t) = t^3 + b*t^2 +c*t + d = 0, t from [0, 1]
        // g't = 3t^2 + 2t*b + c   = 0  => t1 <= t2 
        // g''t = 6t +2b

        ax = px2 - 2 * cx + px1;
        ay = py2 - 2 * cy + py1;

        if (ax == 0 && ay == 0) {
            return this._hitTestSegment(px1, py1, px2, py2, x, y, sqrOutline, chainIdx, result);
        }

        bx = 2 * (cx - px1);
        by = 2 * (cy - py1);

        coeffF[0] = ax * ax + ay * ay;
        coeffF[1] = 2 * (ax * bx + ay * by);
        coeffF[2] = bx * bx + by * by + 2 * ax * (px1 - x) + 2 * ay * (py1 - y);
        coeffF[3] = 2 * (bx * (px1 - x) + by * (py1 - y));
        coeffF[4] = (px1 - x) * (px1 - x) + (py1 - y) * (py1 - y);

        tmp1 = 2 * coeffF[0];
        b = 3 * coeffF[1] / (2 * tmp1);
        c = coeffF[2] / tmp1;
        d = coeffF[3] / (2 * tmp1);

        coeffG[0] = 1;
        coeffG[1] = b;
        coeffG[2] = c;
        coeffG[3] = d;

        inclEnds = false;
        gRootsN = ifMath.getCubicRoots(coeffG, 0.0, 1.0, gRoots, inclEnds, acc);

        if (gRootsN == 0) {
            // ends are already checked
            return false;
        }

        min = sqrOutline + 1;
        hitPtIdx = gRootsN + 1;
        // calculate F(t) in g(t) roots, find min
        for (i = 0; i < gRootsN; ++i) {
            tmp1 = ifMath.evalPoly(coeffF, 4, gRoots[i]);
            if (min > tmp1) {
                min = tmp1;
                hitPtIdx = i;
            }
        }

        if (min <= sqrOutline) {
            // Fill result
            if (result) {
                result.segment = chainIdx;
                result.x = (gRoots[hitPtIdx] * ax + bx) * gRoots[hitPtIdx] + px1;
                result.y = (gRoots[hitPtIdx] * ay + by) * gRoots[hitPtIdx] + py1;
                result.outline = true;
                result.slope = gRoots[hitPtIdx];
            }
            return true;
        }

        return false;
    };

    /**
     * Tests if a point is on the cubic Bezier curve stroke.
     * Algorithm uses the generalized Sturm sequence based on Collins pseudo-reminder sequence
     * for locating the roots of polynomial equation of 5th degree.
     * This generalized Sturm sequence is described in the book of
     * Chee-Keng Yap "Fundamental Problems in Algorithmic Algebra"
     * @param {Number} px1 the x-position of the curve start point
     * @param {Number} py1 the y-position of the curve start point
     * @param {Number} px2 the x-position of the curve end point
     * @param {Number} py2 the y-position of the curve end point
     * @param {Number} cx1 the x-position of the first control point
     * @param {Number} cy1 the y-position of the first control point
     * @param {Number} cx2 the x-position of the second control point
     * @param {Number} cy2 the y-position of the second control point
     * @param {Number} x the x-position of the point to test
     * @param {Number} y the y-position of the point to test
     * @param {Number} sqrOutline squared half-width of stroke
     * @param {Number} chainIdx an index of the curve in the path to be written into result, when curve is hit
     * @param {IFVertexInfo.HitResult} result if the function returns true, means
     * a hit was found then this is the result structure that will be filled
     * with the hit information

     * @return {Boolean} true, if a point is on the stroke
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitTestCurve2 = function (px1, py1, px2, py2, cx1, cy1, cx2, cy2, x, y, sqrOutline, chainIdx, result) {
        // There is a hit if the shortest squared distance from point to curve is less than sqrOutline.
        // An exact distance from a point to a point on curve is a polynomial of 6 degree.
        // To find a distance minimization point, we need to check curve ends and find and check roots
        // of the distance polynomial derivative on the segment [0, 1], which is a polynomial of 5 degree.
        // To find the roots of 5-th degree polynomial, they will be located first, and then calculated
        // with Newton method.
        // The root location problem is solved in two steps: on the first step a curve is split into
        // several pieces in curve inflate points, and then on the second step the roots location is continued
        // using bisection and generalized Sturm sequence based on pseudo-reminder sequence and Collins algorithm,
        // described in the book of Chee-Keng Yap "Fundamental Problems in Algorithmic Algebra".

        // Algorithm is divided into 8 steps. See comments in the algorithm for each step description.

        // Array of points in which curve is split
        var splitPoints;
        // Sorted split points
        var sPtsNew = [];
        // number of split points
        var nPoints;

        // Coefficients, used in P'(t) = 0 equation
        var ax, ay, bx, by, cx, cy;

        // Coefficients, used in P(t) formula
        var b1x, b1y, c1x, c1y;

        // Coefficients of 6 degree distance polynomial
        var coeffF = new Float64Array(7);

        // Coefficients of 5 degree derivative polynomial
        var coeffFDeriv = new Float64Array(6);

        // Coefficients of 5 degree polynomial, calculated from derivative polynomial and interval transformation
        var coeffInversed = new Float64Array(6);

        // Squared distances from point to P1 and P2
        var sqrDst1, sqrDst2;

        // Coefficients, used in quadratic equation for inflate points
        var A, B, C;

        // Auxiliary variables for calculations
        var tmp;
        var d1, d2;

        // parameter values for ends of each peace of curve
        var A1, A2;
        // coordinates or ends of each peace of curve
        var pA1x, pA1y, pA2x, pA2y;
        // squared distances to ends of each peace of curve
        var dA1, dA2;
        // arrays, used for storing coordinates of control points for each peace of curve
        var ctrlsx = new Float64Array(4);
        var ctrlsy = new Float64Array(4);
        // values of derivative polynomial at ends of each peace of curve
        var v51, v52;
        // Number of real roots of derivative polynomial at roots location interval,
        // estimated with Descartes rule of sign
        var nRoots;
        // Number of distinct real roots of derivative polynomial at roots location interval,
        // estimated with Sturm sequence
        var nRootsNew;

        // Coeffitients of the second and third derivative polynomials
        var coeffFDeriv2 = null;
        var coeffFDeriv3 = null;

        // Derivative polynomial root, and point x and y coordinates at the root value
        var r1, r1x, r1y;

        // squared distance between points
        var sqrDst;

        // Auxiliary index variables
        var j, k;

        // Flags used for analysis of point and curve pience relative position
        var hitPossible = false;
        var insideFlag = true;

        // Coordinates of each curve piece control points center of gravity
        var middlePtx, middlePty;

        // generalized Sturm sequence (array of polynomial coefficients arrays)
        var sturmSeq = [];

        // Number of Sturm sequence sign variations at roots location interval ends
        var nSignVars;
        // Derivative polynomial values at roots location interval ends
        var fVals;

        // 1. Inverse interval [0, 1] to [0, inf) and estimate by Descartes rule of sign
        // if the number of positive real roots could be > 0
        // If == 0, select the lowest distance to Pt from P1 and P2.
        // Otherwise, proceed to step 2.

        // Pdist(t) = (Px(t) - x)^2 + (Py(t) - y)^2 =
        // = Px(t)^2 + Py(t)^2 - 2x*Px(t) - 2y*Px(t) + x^2 +y^2
        //
        // P(t) = P1 + 3t(C1 - P1) + 3t^2*(C2 - 2C1 + P1) + t^3*(P2 - 3C2 + 3C1 - P1)
        // P' =3(C1 - P1) + 6t(C2 - 2C1 + P1) + 3t^2*(P2 - 3C2 + 3C1 - P1)
        // P' = 3(at^2 + bt + c)
        // P(t) = at^3 + 3/2*bt^2 + 3ct + d = a1t^3 + b1t^2 + c1t + d1
        // a1 = a, d1 = p1

        cx = cx1 - px1;
        c1x = 3 * cx;
        cy = cy1 - py1;
        c1y = 3 * cy;
        tmp = cx2 - cx1 - cx;
        b1x = 3 * tmp;
        bx = 2 * tmp;
        tmp = cy2 - cy1 - cy;
        b1y = 3 * tmp;
        by = 2 * tmp;
        ax = px2 - cx2 - cx - bx;
        ay = py2 - cy2 - cy - by;

        // P(t)^2 = a1^2*t^6 + b1^2*t^4 + c1^2*t^2 + d1^2 + 2*a1b1*t^5 + 2a1c1*t^4 +
        //        + 2(a1d1 + b1c1)t^3 + 2b1d1*t^2 + 2c1d1*t
        //
        // d1 = d1 - x, d2 = d2 - y
        //
        // Pdist(t) = (a1^2 + a2^2)*t^6 + 2*(a1b1 + a2b2)*t^5 + (b1^2 + 2a1c1 + b2^2 + 2a2c2)*t^4 +
        //         + 2(a1(d1 - x) + b1c1 + a2(d2 - y) + b2c2)*t^3 + (c1^2 + 2b1(d1 - x) + c2^2 + 2b2(d2 -y))*t^2 +
        //         + 2(c1(d1 - x) + c2(d2 - y))*t + (d1 - x)^2 + (d2 - y)^2
        d1 = px1 - x;
        d2 = py1 - y;
        coeffF[0] = ax * ax + ay * ay;
        coeffF[1] = 2 * (ax * b1x + ay * b1y);
        coeffF[2] = b1x * b1x + b1y * b1y + 2 * (ax * c1x + ay * c1y);
        coeffF[3] = (ax * d1 + b1x * c1x + ay * d2 + b1y * c1y) * 2;
        coeffF[4] = c1x * c1x + c1y * c1y + (b1x * d1 + b1y * d2) * 2;
        coeffF[5] = (c1x * d1 + c1y * d2) * 2;
        coeffF[6] = d1 * d1 + d2 * d2;

        ifMath.getCoeffPolyDeriv(coeffF, 6, coeffFDeriv);

        ifMath.inversePolyUnaryInterval(coeffFDeriv, 5, coeffInversed);

        if (ifMath.estimPositiveRootsDescartes(coeffInversed, 5) == 0) {
            sqrDst1 = ifMath.ptSqrDist(px1, py1, x, y);
            sqrDst2 = ifMath.ptSqrDist(px2, py2, x, y);

            if (sqrDst1 <= sqrOutline || sqrDst2 <= sqrOutline) {
                if (result) {
                    result.segment = chainIdx;
                    result.outline = true;
                    if (sqrDst1 < sqrDst2) {
                        result.x = px1;
                        result.y = py1;
                        result.slope = 0.0;
                    }
                    else {
                        result.x = px2;
                        result.y = py2;
                        result.slope = 1.0;
                    }
                }
                return true;
            }
            return false;
        }

        // 2. Find initial interval (curve) splitPoints at [0, 1],
        // which are curve inflate points, or such points,
        // that P'x = 0 or P'y = 0
        nPoints = ifMath.getCubicCurveSplits(ax, bx, cx, ay, by, cy, sPtsNew);

        // 3. Based on splitPoints iterate through intervals,
        // and for each interval perform the following steps:

        for (var i = 0; i < nPoints - 1; ++i) {

            // 4.
            // Evaluate dist to bounding segments between splitPoints
            // If sqrDist > sqrOutline, proceed to next segment
            // If sqrDist <= sqrOutline and min is at segment ends,
            // return true and result if needed

            if (i == 0) {
                A1 = sPtsNew[i];
                pA1x = ifMath.evalCubic(ax, b1x, c1x, px1, A1);
                pA1y = ifMath.evalCubic(ay, b1y, c1y, py1, A1);
                dA1 = ifMath.ptSqrDist(pA1x, pA1y, x, y);
                if (dA1 <= sqrOutline) {
                    if (result) {
                        result.segment = chainIdx;
                        result.outline = true;
                        result.x = pA1x;
                        result.y = pA1y;
                        result.slope = A1;
                    }
                    return true;
                }
            }
            else {
                A1 = A2;
                pA1x = pA2x;
                pA1y = pA2y;
                dA1 = dA2;
            }
            A2 = sPtsNew[i + 1];
            pA2x = ifMath.evalCubic(ax, b1x, c1x, px1, A2);
            pA2y = ifMath.evalCubic(ay, b1y, c1y, py1, A2);
            dA2 = ifMath.ptSqrDist(pA2x, pA2y, x, y);
            if (dA2 <= sqrOutline) {
                if (result) {
                    result.segment = chainIdx;
                    result.outline = true;
                    result.x = pA2x;
                    result.y = pA2y;
                    result.slope = A2;
                }
                return true;
            }

            ifMath.getCtrlPts(px1, px2, cx1, cx2, A1, A2, ctrlsx);
            ifMath.getCtrlPts(py1, py2, cy1, cy2, A1, A2, ctrlsy);

            // splitPoints were received such a way, that curve parts don't change curvature direction,
            // and winding angle from one end to the other is not more than 90 degrees.
            // This mean, that control points don't change their order when convex hull is constructed.
            // And a distance to this part of curve may be estimated as the distance to polyhedron,
            // constructed from control points
            hitPossible = false;
            insideFlag = true;
            middlePtx = (ctrlsx[0] + ctrlsx[1] + ctrlsx[2] + ctrlsx[3]) / 4;
            middlePty = (ctrlsy[0] + ctrlsy[1] + ctrlsy[2] + ctrlsy[3]) / 4;
            for (j = 0; j < 4; ++j) {

                if (j == 3) {
                    k = 0;
                }
                else {
                    k = j + 1;
                }
                if (ifMath.sqrSegmentDist(ctrlsx[j], ctrlsy[j], ctrlsx[k], ctrlsy[k], x, y) <= sqrOutline) {
                    hitPossible = true;
                    break;
                }
                if (ifMath.segmentSide(ctrlsx[j], ctrlsy[j], ctrlsx[k], ctrlsy[k], x, y) *
                    ifMath.segmentSide(ctrlsx[j], ctrlsy[j], ctrlsx[k], ctrlsy[k], middlePtx, middlePty) < 0) {
                    insideFlag = false;
                }
            }

            if (!hitPossible && !insideFlag) {
                continue;
            }


            // 5. For interval [Ai, Ai+1], check ends
            // If f5(Ai) = 0, set Ai = Ai + eps
            // If f5(Ai+1) = 0, set Ai+1 = Ai+1 - eps

            v51 = ifMath.evalPoly(coeffFDeriv, 5, A1);
            // TODO: change 0.005 with the correct value, which guarantees accuracy
            if (ifMath.isEqualEps(v51, 0)) {
                A1 += 0.005;
                v51 = ifMath.evalPoly(coeffFDeriv, 5, A1);
            }
            v52 = ifMath.evalPoly(coeffFDeriv, 5, A2);
            if (ifMath.isEqualEps(v52, 0)) {
                A2 -= 0.005;
                v52 = ifMath.evalPoly(coeffFDeriv, 5, A2);
            }

            // 6. Inverse interval [Ai, Ai+1] to [0, inf) and estimate by Descartes rule of sign
            // if the number of positive real roots N could be > 0
            // If N = 0, lowerest distance to Pt from P(ai) and P(ai+1) should be checked.
            // Actually, no such check is needed due to step 4.
            // If N = 1 , proceed to step 7.
            // If N > 1, proceed to step 8.
            ifMath.inversePolyInterval(coeffFDeriv, 5, A1, A2, coeffInversed);

            nRoots = ifMath.estimPositiveRootsDescartes(coeffInversed, 5);
            if (nRoots == 0) {
                continue;
            }

            // 7. N = 1
            // apply Newton method to find the root,
            // calculate distance for this root, return true if <= sqrOutline
            if (!coeffFDeriv2) {
                coeffFDeriv2 = new Float64Array(5);
                ifMath.getCoeffPolyDeriv(coeffFDeriv, 5, coeffFDeriv2);
            }

            if (!coeffFDeriv3) {
                coeffFDeriv3 = new Float64Array(4);
                ifMath.getCoeffPolyDeriv(coeffFDeriv2, 4, coeffFDeriv3);
            }

            if (nRoots == 1) {
                r1 = ifMath.locateByNewton(A1, A2, v51, v52, coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005);
                if (r1 == null) {
                    r1 = (A1 + A2) / 2;
                }
                r1x = ifMath.evalCubic(ax, b1x, c1x, px1, r1);
                r1y = ifMath.evalCubic(ay, b1y, c1y, py1, r1);
                sqrDst = ifMath.ptSqrDist(r1x, r1y, x, y);
                if (sqrDst <= sqrOutline) {
                    if (result) {
                        result.segment = chainIdx;
                        result.outline = true;
                        result.x = r1x;
                        result.y = r1y;
                        result.slope = r1;
                    }
                    return true;
                }
            }

            // 8. N > 1
            // Find Sturm sequense, and count the exact number NS of distinct real roots at [Ai, Ai+1]
            // if NS > 1, apply bisection and recursion Sturm to isolate intervals, where = 1,
            // apply Newton for each new interval with 1 real root
            // Calculate distance for each found root, return true if <= sqrOutline

            if (nRoots > 1) {
                if (sturmSeq.length == 0) {
                    ifMath.getSturmPRS(coeffFDeriv, 5, coeffFDeriv2, sturmSeq);
                }

                nSignVars = [];
                fVals = [v51, v52];
                nRootsNew = ifMath.countRootsNSturm(coeffFDeriv, 5, coeffFDeriv2, A1, A2,
                    sturmSeq, nSignVars, fVals);

                if (nRootsNew == 0) {
                    continue;
                }

                if (nRootsNew == 1) {
                    r1 = ifMath.locateByNewton(A1, A2, v51, v52, coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005,
                        sturmSeq, nSignVars);
                    if (r1 == null) {
                        r1 = (A1 + A2) / 2;
                    }
                    r1x = ifMath.evalCubic(ax, b1x, c1x, px1, r1);
                    r1y = ifMath.evalCubic(ay, b1y, c1y, py1, r1);
                    sqrDst = ifMath.ptSqrDist(r1x, r1y, x, y);
                    if (sqrDst <= sqrOutline) {
                        if (result) {
                            result.segment = chainIdx;
                            result.outline = true;
                            result.x = r1x;
                            result.y = r1y;
                            result.slope = r1;
                        }
                        return true;
                    }
                }

                if (nRootsNew > 1) {
                    var rIntervals = [];
                    ifMath.locRootsSturm(coeffFDeriv, 5, coeffFDeriv2, A1, A2, sturmSeq, nRootsNew,
                        nSignVars, fVals, rIntervals);

                    for (var s = 0; s < rIntervals.length; ++s) {
                        r1 = ifMath.locateByNewton(rIntervals[s][0], rIntervals[s][1],
                            rIntervals[s][2], rIntervals[s][3], coeffFDeriv, 5, coeffFDeriv2, coeffFDeriv3, 0.005,
                            sturmSeq);
                        if (r1 == null) {
                            r1 = (rIntervals[s][0] + rIntervals[s][1]) / 2;
                        }
                        r1x = ifMath.evalCubic(ax, b1x, c1x, px1, r1);
                        r1y = ifMath.evalCubic(ay, b1y, c1y, py1, r1);
                        sqrDst = ifMath.ptSqrDist(r1x, r1y, x, y);
                        if (sqrDst <= sqrOutline) {
                            if (result) {
                                result.segment = chainIdx;
                                result.outline = true;
                                result.x = r1x;
                                result.y = r1y;
                                result.slope = r1;
                            }
                            return true;
                        }
                    }
                }
            } // nRoots > 1

        } // for splitPoints

        return false;
    };

    /**
     * Counts a point inside score for line segment according to
     * the paper of J. Ruiz de Miras and F. R. Feito "Inclusion Test for Curved-Edge Polygons".
     * @param {Number} px1 the x-position of the segment start point
     * @param {Number} py1 the y-position of the segment start point
     * @param {Number} px2 the x-position of the segment end point
     * @param {Number} py2 the y-position of the segment end point
     * @param {Number} x the x-position of the point to count score
     * @param {Number} y the y-position of the point to count score
     * @param {Boolean} countSegm if true, segment inside is counted as under segment

     * @return {Number} a point inside score
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitUnderSegment = function (px1, py1, px2, py2, x, y, countSegm) {
        var s1, s2, s3;

        s1 = ifMath.segmentSide(0, 0, px1, py1, x, y);
        s2 = ifMath.segmentSide(px1, py1, px2, py2, x, y);
        s3 = ifMath.segmentSide(px2, py2, 0, 0, x, y);

        if (s1 > 0 && s2 > 0 && s3 > 0) {
            return 2;
        }

        if (s1 < 0 && s2 < 0 && s3 < 0) {
            return -2;
        }

        if (s1 == 0) {
            if (s2 > 0 && s3 > 0) {
                return 1;
            }
            if (s2 < 0 && s3 < 0) {
                return -1;
            }
            return 0;
        }

        if (s3 == 0) {
            if (s1 > 0 && s2 > 0) {
                return 1;
            }
            if (s1 < 0 && s2 < 0) {
                return -1;
            }
            return 0;
        }

        if (countSegm && s2 == 0) {
            if (s1 > 0 && s3 > 0) {
                return 1;
            }
            if (s1 < 0 && s3 < 0) {
                return -1;
            }
            return 0;
        }

        return 0;
    };

    /**
     * Counts a point inside score for conic curve region according to
     * the paper of J. Ruiz de Miras and F. R. Feito "Inclusion Test for Curved-Edge Polygons".
     * @param {Number} px1 the x-position of the curve start point
     * @param {Number} py1 the y-position of the curve start point
     * @param {Number} px2 the x-position of the curve end point
     * @param {Number} py2 the y-position of the curve end point
     * @param {Number} cx the x-position of a control point
     * @param {Number} cy the y-position of a control point
     * @param {Function} cHullCheck the function to check if the point inside convex hull of control points
     * @param {Function} curvFunc the implicit equation for curve
     * @param {Number} x the x-position of the point to count score
     * @param {Number} y the y-position of the point to count score

     * @return {Number} a point inside score
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._evalConicReg = function (px1, py1, px2, py2, cx, cy, cHullCheck, curvFunc, x, y) {
        var alpha;
        var chullres; // result of checking against controls convex hull
        var sideC; // value of curve function in the control point
        var sidePt; // value of curve function in the point to test
        var signReg = -ifMath.segmentSide(px1, py1, px2, py2, cx, cy); // the region sign

        if (signReg == 0) {
            // mirrored Y is noticed
            return this._hitUnderSegment(px1, py1, px2, py2, x, y);
        }

        // mirrored Y is noticed
        alpha = this._hitUnderSegment(px1, py1, px2, py2, x, y, true);

        // Check point is from convex hull
        chullres = cHullCheck(x, y);
        if (chullres < 0) {
            return alpha;
        }

        // Pt is inside convex hull
        if (chullres == 0) { // point is on the foundation of conic region
            return signReg + alpha;
        }

        sideC = -curvFunc(cx, cy);

        // Mirrored Y axis gives:
        sidePt = -curvFunc(x, y);

        if (sidePt > 0 && sideC < 0 || sidePt < 0 && sideC > 0) {
            // Pt is inside arc
            return signReg + signReg + alpha;
        }

        return alpha;
    };

    /**
     * Counts a point inside score for quadartic Bezier curve according to
     * the paper of J. Ruiz de Miras and F. R. Feito "Inclusion Test for Curved-Edge Polygons"
     * and using the results presented in the document of Alois Zingl "A Rasterizing Algorithm for Drawing Curves".
     * @param {Number} px1 the x-position of the curve start point
     * @param {Number} py1 the y-position of the curve start point
     * @param {Number} px2 the x-position of the curve end point
     * @param {Number} py2 the y-position of the curve end point
     * @param {Number} cx the x-position of the control point
     * @param {Number} cy the y-position of the control point
     * @param {Number} x the x-position of the point to count score
     * @param {Number} y the y-position of the point to count score

     * @return {Number} a point inside score
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitUnderCurve = function (px1, py1, px2, py2, cx, cy, x, y) {
        // Here is used formulas for curve implicitization from the document of
        // Alois Zingl "A Rasterizing Algorithm for Drawing Curves"

        function curvFunc(x, y) {
            //implicit formula for curve is:
            //(x*(py1 - 2cy + py2) - y*(px1 - 2cx + px2))^2 + 2(x(py1 - py2) - y(px1 - px2))*curvature + curvature^2 = 0
            // where x and y are shifted to cx and cy

            var curvature = (px1 - cx) * (py2 - cy) + (cx - px2) * (py1 - cy);
            var xn = x - cx;
            var yn = y - cy;
            var tmp1 = xn * (py1 - 2 * cy + py2) - yn * (px1 - 2 * cx + px2);
            return tmp1 * tmp1 + (2 * (xn * (py1 - py2) + yn * (px2 - px1)) + curvature) * curvature;
        }

        function cHullCheck(x, y) {
            var s1, s2, s3;
            var middlePtx = (px1 + cx + px2) / 3;
            var middlePty = (py1 + cy + py2) / 3;

            s3 = ifMath.segmentSide(px2, py2, px1, py1, x, y);
            if (s3 == 0) {
                return 0;
            }

            s1 = ifMath.segmentSide(px1, py1, cx, cy, x, y);
            s2 = ifMath.segmentSide(cx, cy, px2, py2, x, y);

            if (s1 != ifMath.segmentSide(px1, py1, cx, cy, middlePtx, middlePty) ||
                s2 != ifMath.segmentSide(cx, cy, px2, py2, middlePtx, middlePty) ||
                s3 != ifMath.segmentSide(px2, py2, px1, py1, middlePtx, middlePty)) {

                return -1;
            }

            // Pt is inside convex hull
            return 1;
        }

        return this._evalConicReg(px1, py1, px2, py2, cx, cy, cHullCheck, curvFunc, x, y);
    };

    /**
     * Counts a point inside score for cubic Bezier curve according to
     * the paper of J. Ruiz de Miras and F. R. Feito "Inclusion Test for Curved-Edge Polygons"
     * and using the results presented in the document of Alois Zingl "A Rasterizing Algorithm for Drawing Curves".
     * @param {Number} px1 the x-position of the curve start point
     * @param {Number} py1 the y-position of the curve start point
     * @param {Number} px2 the x-position of the curve end point
     * @param {Number} py2 the y-position of the curve end point
     * @param {Number} cx1 the x-position of the first control point
     * @param {Number} cy1 the y-position of the first control point
     * @param {Number} cx2 the x-position of the second control point
     * @param {Number} cy2 the y-position of the second control point
     * @param {Number} x the x-position of the point to count score
     * @param {Number} y the y-position of the point to count score

     * @return {Number} a point inside score
     * @private
     * @version 1.0
     */
    IFVertexInfo.prototype._hitUnderCurve2 = function (px1, py1, px2, py2, cx1, cy1, cx2, cy2, x, y) {
        // Here is used formulas for curve implicitization and self-intersection point from the document of
        // Alois Zingl "A Rasterizing Algorithm for Drawing Curves"

        // Overall algorithm for counting a point inside score (for path inside hit-test) is the following:
        // 1. Split curve in self-intersection points and inflate points
        // 2. Implicitize each peace
        // 3. Apply the same algorithm for checking curve region inside as for quadratic curves

        var tot = 0;
        var splitPoints = [];

        // Coefficients, used in P'(t) = 0 equation
        var ax, ay, bx, by, cx, cy;

        // Coefficients, used in P(t) formula
        var b1x, b1y, c1x, c1y;
        var coeffPX;
        var coeffPY;
        // With shifted t to [-1/2, 1/2]
        var coeffPShiftedX;
        var coeffPShiftedY;

        // Coefficients, used in quadratic equation for inflate points
        var A, B, C;

        var tmp;

        // variables for finding a self-intersection point
        var Xa, Xb, Xc, Ya, Yb, Yc, Cac, Cab, Cbc;
        var sqrtC;
        var tv1, tv2;

        // arrays, used for storing coordinates of control points for each peace of curve
        var ctrlsx;
        var ctrlsy;

        // parameter values for ends of each peace of curve
        var A1, A2;

        // 1. Find inflate points:
        // P'x * P''y - P'y * P''x = 0
        // P(t) = P1 + 3t(C1 - P1) + 3t^2*(C2 - 2C1 + P1) + t^3*(P2 - 3C2 + 3C1 - P1)
        // P' =3(C1 - P1) + 6t(C2 - 2C1 + P1) + 3t^2*(P2 - 3C2 + 3C1 - P1)
        // P' = 3(at^2 + bt + c)
        // P(t) = at^3 + 3/2*bt^2 + 3ct + d = a1t^3 + b1t^2 + c1t + d1
        // a1 = a, d1 = p1
        cx = cx1 - px1;
        c1x = 3 * cx;
        cy = cy1 - py1;
        c1y = 3 * cy;
        tmp = cx2 - cx1 - cx;
        b1x = 3 * tmp;
        bx = 2 * tmp;
        tmp = cy2 - cy1 - cy;
        b1y = 3 * tmp;
        by = 2 * tmp;
        ax = px2 - cx2 - cx - bx;
        ay = py2 - cy2 - cy - by;

        // (2bx*ay -2by*ax + ax*by - ay*bx)t^2 + (2cx*ay - 2cy*ax)t + cx*by - cy*bx = 0
        // (bx*ay - by*ax)t^2 + 2*(cx*ay - cy*ax)t + cx*by - cy*bx = 0
        // At^2 + Bt + C = 0
        A = bx * ay - by * ax;
        B = 2 * (cx * ay - cy * ax);
        C = cx * by - cy * bx;
        ifMath.getQuadraticRoots(A, B, C, splitPoints);

        // a curve may have a self-intersection point only if it doesn't have inflate points
        if (splitPoints.length == 0) {
            // Find self-intersection points:
            // t from [0, 1] -> t = ^t + 1/2 -> ^t from [-1/2, 1,2]
            coeffPX = new Float64Array(4);
            coeffPY = new Float64Array(4);
            coeffPShiftedX = new Float64Array(4);
            coeffPShiftedY = new Float64Array(4);

            coeffPX[0] = ax;
            coeffPX[1] = b1x;
            coeffPX[2] = c1x;
            coeffPX[3] = px1;

            coeffPY[0] = ay;
            coeffPY[1] = b1y;
            coeffPY[2] = c1y;
            coeffPY[3] = py1;

            ifMath.shiftPoly(coeffPX, 3, 0.5, coeffPShiftedX);
            ifMath.shiftPoly(coeffPY, 3, 0.5, coeffPShiftedY);

            // ^t1,2 = (Cac +- sqrt(12Cab*Cbc - 3Cac^2)) / 2Cab
            Xa = -coeffPShiftedX[0];
            Xb = coeffPShiftedX[1] / 3;
            Xc = -coeffPShiftedX[2] / 3;
            Ya = -coeffPShiftedY[0];
            Yb = coeffPShiftedY[1] / 3;
            Yc = -coeffPShiftedY[2] / 3;

            Cac = Xa * Yc - Xc * Ya;
            Cab = Xa * Yb - Xb * Ya;
            Cbc = Xb * Yc - Xc * Yb;

            tmp = 12 * Cab * Cbc - 3 * Cac * Cac;
            if (tmp > 0) { // case of a cusp when tmp == 0 is not interested, as it was calculated in inflate points
                sqrtC = Math.sqrt(tmp);
                tv1 = (Cac - sqrtC) / (Cab * 2);
                tv2 = (Cac + sqrtC) / (Cab * 2);

                if (-0.5 < tv1 && tv1 < 0.5) {
                    splitPoints.push(tv1 + 0.5);
                    if (-0.5 < tv2 && tv2 < 0.5) {
                        splitPoints.push(tv2 + 0.5);

                        // a slope inside curve, add a split point in the middle
                        splitPoints.push((tv1 + tv2) / 2 + 0.5);
                    }
                }

                if (-0.5 < tv2 && tv2 < 0.5) {
                    splitPoints.push(tv2 + 0.5);
                }
            } // tmp > 0
        } // splitPoints.length == 0

        splitPoints.push(0.0);
        splitPoints.push(1.0);
        var sPtsNew = [];
        var nPoints = ifUtil.uSortSegment(0, 1, splitPoints, sPtsNew);

        // 2. Implicitize each peace
        ctrlsx = new Float64Array(4);
        ctrlsy = new Float64Array(4);

        for (var i = 0; i < nPoints - 1; ++i) {
            if (i == 0) {
                A1 = sPtsNew[i];
            }
            else {
                A1 = A2;
            }
            A2 = sPtsNew[i + 1];

            if (A1 == 0.0 && A2 == 1.0) {
                ctrlsx[0] = px1;
                ctrlsx[1] = cx1;
                ctrlsx[2] = cx2;
                ctrlsx[3] = px2;

                ctrlsy[0] = py1;
                ctrlsy[1] = cy1;
                ctrlsy[2] = cy2;
                ctrlsy[3] = py2;
            }
            else {
                ifMath.getCtrlPts(px1, px2, cx1, cx2, A1, A2, ctrlsx);
                ifMath.getCtrlPts(py1, py2, cy1, cy2, A1, A2, ctrlsy);
            }

            // splitPoints were received such a way, that curve parts don't change curvature direction,
            // and winding angle from one end to the other is less than 360 degrees.
            // Also there are no singular (self-intersection) points inside each peace
            // So each peace is a valid conic region, and we can use it in algorithm for inside of a path checking
            // 3. Apply the same algorithm as for quadratic curves

            function curvFunc(x, y) {
                // calculate the implicit equation for this curve:
                // ax^3 - 3bx^2y + 3cxy^2 - dy^3 + 3ex^2 - 3fxy + 3gy^2 + 3hx - 3iy + j = 0

                // According to Alois Zingl "A Rasterizing Algorithm for Drawing Curves":
                var Xa = ctrlsx[0] - 3 * ctrlsx[1] + 3 * ctrlsx[2] - ctrlsx[3];
                var Xb = (ctrlsx[0] - ctrlsx[1] - ctrlsx[2] + ctrlsx[3]) / 2;
                var Xc = (ctrlsx[0] + ctrlsx[1] - ctrlsx[2] - ctrlsx[3]) / 4;
                var Xd = (ctrlsx[0] + 3 * ctrlsx[1] + 3 * ctrlsx[2] + ctrlsx[3]) / 8;
                var Ya = ctrlsy[0] - 3 * ctrlsy[1] + 3 * ctrlsy[2] - ctrlsy[3];
                var Yb = (ctrlsy[0] - ctrlsy[1] - ctrlsy[2] + ctrlsy[3]) / 2;
                var Yc = (ctrlsy[0] + ctrlsy[1] - ctrlsy[2] - ctrlsy[3]) / 4;
                var Yd = (ctrlsy[0] + 3 * ctrlsy[1] + 3 * ctrlsy[2] + ctrlsy[3]) / 8;

                var Cac = Xa * Yc - Xc * Ya;
                var Cab = Xa * Yb - Xb * Ya;
                var Cbc = Xb * Yc - Xc * Yb;
                var Cad = Xa * Yd - Xd * Ya;
                var Cbd = Xb * Yd - Xd * Yb;
                var Ccd = Xc * Yd - Xd * Yc;

                var XaSqr = Xa * Xa;
                var XbSqr = Xb * Xb;
                var YaSqr = Ya * Ya;
                var YbSqr = Yb * Yb;

                var CacSqr = Cac * Cac;
                var CadSqr = Cad * Cad;

                var CabCbc = Cab * Cbc;
                var CabCbd = Cab * Cbd;
                var CabCac = Cab * Cac;

                var mu1 = 3 * CabCbd - Cac * Cad;
                var mu2 = 3 * CacSqr - Cab * (4 * Cad + 9 * Cbc);

                var a = YaSqr * Ya;
                var b = Xa * YaSqr;
                var c = XaSqr * Ya;
                var d = XaSqr * Xa;
                var e = Cad * YaSqr - 3 * Ya * (2 * Cab * Yc + Cac * Yb) + 9 * Cab * YbSqr;
                var f = (2 * Cad + 3 * Cbc) * Xa * Ya + 9 * (2 * Cab * Xb * Yb + Xb * Xc * YaSqr - XaSqr * Yb * Yc);
                var g = Cad * XaSqr - 3 * (2 * Cab * Xc + Cac * Xb) * Xa + 9 * Cab * XbSqr;
                var h = CadSqr * Ya + 6 * mu1 * Yb + 3 * mu2 * Yc + 9 * CabCac * Yd;
                var i = CadSqr * Xa + 6 * mu1 * Xb + 3 * mu2 * Xc + 9 * CabCac * Xd;
                var j = Cad * (CadSqr - 9 * (Cac * Cbd + 2 * Cab * Ccd)) + 27 * (CabCbd * Cbd + CacSqr * Ccd) - 81 * CabCbc * Ccd;

                var XSqr = x * x;
                var YSqr = y * y;

                return (a * x - 3 * b * y + 3 * e) * XSqr + (3 * c * x - d * y + 3 * g) * YSqr + ((h - f * y) * x - i * y) * 3 + j;
            }

            function cHullCheck(x, y) {
                var middlePtx = (ctrlsx[0] + ctrlsx[1] + ctrlsx[2] + ctrlsx[3]) / 4;
                var middlePty = (ctrlsy[0] + ctrlsy[1] + ctrlsy[2] + ctrlsy[3]) / 4;
                var s1;
                var j;
                var k;

                for (j = 0; j < 4; ++j) {

                    if (j == 3) {
                        k = 0;
                    }
                    else {
                        k = j + 1;
                    }

                    s1 = ifMath.segmentSide(ctrlsx[j], ctrlsy[j], ctrlsx[k], ctrlsy[k], x, y);
                    if (j == 3 && s1 == 0) {
                        return 0;
                    }
                    if (s1 * ifMath.segmentSide(ctrlsx[j], ctrlsy[j], ctrlsx[k], ctrlsy[k], middlePtx, middlePty) < 0) {
                        return -1;
                    }
                }

                return 1;
            }

            if (ifMath.isEqualEps(ctrlsx[0], ctrlsx[1]) && ifMath.isEqualEps(ctrlsy[0], ctrlsy[1])) {
                tot += this._evalConicReg(ctrlsx[0], ctrlsy[0], ctrlsx[3], ctrlsy[3], ctrlsx[2], ctrlsy[2],
                    cHullCheck, curvFunc, x, y);
            }
            else {
                tot += this._evalConicReg(ctrlsx[0], ctrlsy[0], ctrlsx[3], ctrlsy[3], ctrlsx[1], ctrlsy[1],
                    cHullCheck, curvFunc, x, y);
            }
        }

        return tot;
    };

    /**
     * Make a hit-test against a vertex source and a point.
     * The vertex source will be automatically rewinded to the beginning.
     * If orientation is not provided, inside will be defined automatically for even/odd fill of the shape
     * @param {Number} x the x-position of the point to hit-test against
     * @param {Number} y the y-position of the point to hit-test against
     * @param {IFVertexSource} source the vertex source used for hit-testing
     * @param {Number} outlineWidth the width of the outline. If this is
     * zero, it is assumed that it is sqrt(ifMath.defaultEps)
     * @param {Boolean} area if true, the fill area will be tested as well,
     * otherwise only the outline will be considered
     * @param {IFVertexInfo.HitResult} result if the function returns true, means
     * a hit was found then this is the result structure that will be filled
     * with the hit information
     * @param {Boolean} orientationCW - true means that clock-wise orientation should be used,
     * false - counter-clockwise, null - define orientation automatically

     * @return {Boolean} true if a hit was made, false if not
     * @version 1.0
     */
    IFVertexInfo.prototype.hitTest = function (x, y, source, outlineWidth, area, result, orientationCW) {
        var px1, py1, px2, py2, cx1, cy1, pStartX, pStartY;
        var chainIdx = 0;
        var res = false;
        var vertex = new IFVertex();
        var sqrOutline = outlineWidth ? (outlineWidth / 2) * (outlineWidth / 2) : ifMath.defaultEps;
        var tot = 0;
        var xshift = 0;

        pStartX = null;
        pStartY = null;

        // The approach is based on the paper of
        // J. Ruiz de Miras and F. R. Feito "Inclusion Test for Curved-Edge Polygons"
        // With the change while counting result: [-1, -1/2, 0, 1/2, 1] -> [-2, -1, 0, 1, 2]

        // if x == 0 and y == 0, everything must be shifted for inside testing
        if (ifMath.isEqualEps(x, 0.0) && ifMath.isEqualEps(y, 0.0)) {
            xshift = 1;
        }

        if (source.rewindVertices(0)) {
            // iterate through curves
            while (source.readVertex(vertex)) {
                switch (vertex.command) {
                    case IFVertex.Command.Move:
                        px1 = vertex.x;
                        py1 = vertex.y;
                        pStartX = px1;
                        pStartY = py1;
                        break;

                    case IFVertex.Command.Line:
                        ++chainIdx;
                        res = this._hitTestSegment(px1, py1, vertex.x, vertex.y, x, y, sqrOutline, chainIdx, result);
                        if (res) {
                            return res;
                        }
                        if (area) {
                            tot += this._hitUnderSegment(px1 + xshift, py1, vertex.x + xshift, vertex.y,
                                x + xshift, y);
                        }
                        px1 = vertex.x;
                        py1 = vertex.y;
                        break;

                    case IFVertex.Command.Curve:
                        ++chainIdx;
                        px2 = vertex.x;
                        py2 = vertex.y;
                        if (source.readVertex(vertex)) {
                            res = this._hitTestCurve(px1, py1, px2, py2, vertex.x, vertex.y,
                                x, y, sqrOutline, chainIdx, result);
                            if (res) {
                                return res;
                            }
                            if (area) {
                                tot += this._hitUnderCurve(px1 + xshift, py1, px2 + xshift, py2,
                                    vertex.x + xshift, vertex.y, x + xshift, y);
                            }
                            px1 = px2;
                            py1 = py2;
                        }
                        break;

                    case IFVertex.Command.Curve2:
                        ++chainIdx;
                        px2 = vertex.x;
                        py2 = vertex.y;
                        if (source.readVertex(vertex)) {
                            // Save first control point here
                            cx1 = vertex.x;
                            cy1 = vertex.y;
                            if (source.readVertex(vertex)) {
                                res = this._hitTestCurve2(px1, py1, px2, py2, cx1, cy1,
                                    vertex.x, vertex.y, x, y, sqrOutline, chainIdx, result);
                                if (res) {
                                    return res;
                                }
                                if (area) {
                                    tot += this._hitUnderCurve2(px1 + xshift, py1, px2 + xshift, py2, cx1 + xshift, cy1,
                                        vertex.x + xshift, vertex.y, x + xshift, y);
                                }
                                px1 = px2;
                                py1 = py2;
                            }
                        }
                        break;

                    case IFVertex.Command.Close:
                        if (pStartX != px1 || pStartY != py1) {
                            ++chainIdx;
                            res = this._hitTestSegment(px1, py1, pStartX, pStartY, x, y, sqrOutline, chainIdx, result);
                            if (res) {
                                return res;
                            }
                            if (area) {
                                tot += this._hitUnderSegment(px1 + xshift, py1, pStartX + xshift, pStartY,
                                    x + xshift, y);
                            }
                        }
                        pStartX = px1;
                        pStartY = py1;
                        break;

                    default:
                        throw new Error("Unknown vertex command: " + vertex.command.toString());
                } // switch
            } // while

            if (area) {
                if (orientationCW == null && (tot == 2 || tot == -2) ||
                        tot == 2 && !orientationCW || tot == -2 && orientationCW) {

                    if (result) {
                        result.outline = false;
                    }
                    res = true;
                }
            }
        }

        return res;
    };

    /**
     * Calculate bounding box for a vertex source. The vertex source will
     * be automatically rewinded to the beginning.
     * @param {IFVertexSource} source the vertex source used for calculation
     * @param {Boolean} exact if true, the bounding box will include exact
     * curve calculation, otherwise if false, the bounding box will include
     * the max. bbox also surrounding any curve control points
     * @return {GRect} the calculated bounds rect, this might be null if
     * there're no valid bounds available as well as this might be an
     * empty rectangle if segments are at the same position or too less.
     * @version 1.0
     */
    IFVertexInfo.prototype.calculateBounds = function (source, exact) {
        if (source.rewindVertices(0)) {
            var minX = null;
            var minY = null;
            var maxX = null;
            var maxY = null;

            function measurePoint(x, y) {
                if (minX == null || x < minX) {
                    minX = x;
                }
                if (maxX == null || x > maxX) {
                    maxX = x;
                }

                if (minY == null || y < minY) {
                    minY = y;
                }
                if (maxY == null || y > maxY) {
                    maxY = y;
                }
            };

            function measureCurve(px1, py1, px2, py2, cx, cy) {
                var t = 0;
                var s = 0;
                var px = 0;
                var py = 0;

                measurePoint(px2, py2);

                // P(t) = t^2(P2 - 2C + P1) + 2t(C-P1) + P1
                // P' = 2t(P2 - 2C + P1) + 2(C-P1)
                // P'x == 0 when tangent to vertical border, and P'y == 0 when tangent to horizontal border,
                // t = (P1 - C) / (P2 - 2C + P1), P = (P1*P2 -C^2) / (P2 - 2C + P1)

                // when cx in the middle of [px1,px2], P(t)x is linear,
                // no single tangent point to vertical border between P1 and P2,
                // so not interested in this case
                s = px2 - 2 * cx + px1;
                if (s != 0) {
                    t = (px1 - cx) / s;
                    if (t > 0 && t < 1) {
                        px = (px1 * px2 - cx * cx) / (px2 - 2 * cx + px1);
                        py = ifMath.getCurveAtT(py1, py2, cy, t);
                        measurePoint(px, py);
                    }
                }

                // when cy in the middle of [py1,py2], P(t)y is linear,
                // no single tangent point to horizontal border between P1 and P2,
                // so not interested in this case
                s = py2 - 2 * cy + py1;
                if (s != 0) {
                    t = (py1 - cy) / s;
                    if (t > 0 && t < 1) {
                        py = (py1 * py2 - cy * cy) / (py2 - 2 * cy + py1);
                        px = ifMath.getCurveAtT(px1, px2, cx, t);
                        measurePoint(px, py);
                    }
                }
            };

            function measureCurve2(px1, py1, px2, py2, cx1, cy1, cx2, cy2) {
                var t = 0;
                var s = 0;
                var px = 0;
                var py = 0;

                measurePoint(px2, py2);

                // P(t) = P1 + 3t(C1 - P1) + 3t^2*(C2 - 2C1 + P1) + t^3*(P2 - 3C2 + 3C1 - P1)
                // P' =3(C1 - P1) + 6t(C2 - 2C1 + P1) + 3t^2*(P2 - 3C2 + 3C1 - P1)
                // P'x == 0 when tangent to vertical border, and P'y == 0 when tangent to horizontal border,
                // Cubic curve may have 'spike' inflate point, but in it also P'x = 0 and P'y = 0

                var cx = cx1 - px1;
                var cy = cy1 - py1;
                var bx = 2 * (cx2 - cx1 - cx);
                var by = 2 * (cy2 - cy1 - cy);
                var ax = px2 - cx2 - cx - bx;
                var ay = py2 - cy2 - cy - by;
                // P' = 3(at^2 + bt + c)

                function measureAtT(t) {
                    var px = 0;
                    var py = 0;

                    if (t > 0 && t < 1) {
                        px = ifMath.getCubicCurveAtT(px1, px2, cx1, cx2, t);
                        py = ifMath.getCubicCurveAtT(py1, py2, cy1, cy2, t);
                        measurePoint(px, py);
                    }
                };

                function measureAtRoot(a, b, c) {
                    var discr = 0;
                    var sd = 0;

                    if (a == 0) {
                        if (b != 0) // otherwise, P(t) is linear by x or y, no interest points between 0 and 1
                        {
                            t = -c / b;
                            measureAtT(t);
                        }
                    }
                    else {
                        discr = b * b - 4 * a * c;
                        if (discr == 0) {
                            t = -b / (2 * a);
                            measureAtT(t);
                        }
                        else if (discr > 0) {
                            sd = Math.sqrt(discr);
                            t = (-b + sd) / (2 * a);
                            measureAtT(t);
                            t = (-b - sd) / (2 * a);
                            measureAtT(t);
                        }
                    }
                };

                measureAtRoot(ax, bx, cx);
                measureAtRoot(ay, by, cy);
            }

            var vertex = new IFVertex();

            var px1, py1, px2, py2, cx1, cy1;

            while (source.readVertex(vertex)) {
                switch (vertex.command) {
                    case IFVertex.Command.Move:
                    case IFVertex.Command.Line:
                        measurePoint(vertex.x, vertex.y);
                        px1 = vertex.x;
                        py1 = vertex.y;
                        break;

                    case IFVertex.Command.Curve:
                        px2 = vertex.x;
                        py2 = vertex.y;
                        if (source.readVertex(vertex)) {
                            if (exact) {
                                measureCurve(px1, py1, px2, py2, vertex.x, vertex.y);
                            } else {
                                measurePoint(px2, py2);
                                measurePoint(vertex.x, vertex.y);
                            }
                            px1 = px2;
                            py1 = py2;
                        }
                        break;

                    case IFVertex.Command.Curve2:
                        px2 = vertex.x;
                        py2 = vertex.y;
                        if (source.readVertex(vertex)) {
                            // Save first control point here
                            cx1 = vertex.x;
                            cy1 = vertex.y;
                            if (source.readVertex(vertex)) {
                                if (exact) {
                                    measureCurve2(px1, py1, px2, py2, cx1, cy1, vertex.x, vertex.y);
                                } else {
                                    measurePoint(px2, py2);
                                    measurePoint(cx1, cy1);
                                    measurePoint(vertex.x, vertex.y);
                                }
                                px1 = px2;
                                py1 = py2;
                            }
                        }
                        break;

                    case IFVertex.Command.Close:
                        break;

                    default:
                        throw new Error("Unknown vertex command: " + vertex.command.toString());
                }
            }

            if (minX != null && minY != null) {
                return new GRect(minX, minY, maxX != null ? maxX - minX : 0, maxY != null ? maxY - minY : 0);
            }
        }
        return null;
    };

    /** @override */
    IFVertexInfo.prototype.toString = function () {
        return "[Object IFVertexInfo]";
    };

    _.IFVertexInfo = IFVertexInfo;
    _.gVertexInfo = new IFVertexInfo();
})(this);