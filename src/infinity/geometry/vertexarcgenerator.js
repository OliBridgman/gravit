(function (_) {

    // TODO : Correct code style & jsdoc errors in here!

    /** This class represents a generator of an arc on a 2D plane.
     * @class GXVertexArcGenerator
     * @version 1.0
     * @constructor
     */
    function GXVertexArcGenerator() {
    };

    GXVertexArcGenerator._transform = null;

    /**
     * Accuracy or considering start and end angles the same
     */
    var ACC = 1.0e-6;
    var defaultFlatness = 0.5;

    /**
     * Canvas Y axis is mirrored down compared with usual orientation
     * make the needed correction of angles and clockwise orientation
     * Corrects angles, if angles difference is close to 2Pi with ACC accuracy, consider
     * start angle - 0, end angle - 2Pi
     * @param [startAngle] {number}
     * @param [endAngle] {number}
     * @param [isCW] {Boolean} clockwise orientation
     * @private
     * @version 1.0
     */
    GXVertexArcGenerator.prototype._correctArgs = function (startAngle, endAngle, isCW) {
        // Define local variables with the same names as arguments to mirror Y axis against X axis
        var startAngle = -startAngle;
        var endAngle = -endAngle;
        var isCW = !isCW;

        // correct angles
        var diffLambda = Math.abs(endAngle - startAngle);
        if (diffLambda + ACC > gMath.PI2) {
            diffLambda = gMath.mod(diffLambda, gMath.PI2);
            if (diffLambda < ACC || (gMath.PI2 - diffLambda) < ACC) {
                if (!isCW) {
                    startAngle = 0;
                    endAngle = gMath.PI2;
                } else {
                    startAngle = gMath.PI2;
                    endAngle = 0;
                }
            } else {
                startAngle = gMath.mod(startAngle, gMath.PI2);
                endAngle = gMath.mod(endAngle, gMath.PI2);
            }
        } else {
            startAngle = gMath.mod(startAngle, gMath.PI2);
            endAngle = gMath.mod(endAngle, gMath.PI2);
        }

        // ensure correct angles order
        if (startAngle < 0) {
            startAngle += gMath.PI2;
        }

        if (endAngle < 0) {
            endAngle += gMath.PI2;
        }

        if (startAngle < endAngle && isCW) {
            startAngle += gMath.PI2;
        }

        if (endAngle < startAngle && !isCW) {
            endAngle += gMath.PI2;
        }

        return {
            'startAngle': startAngle,
            'endAngle': endAngle,
            'isCW': isCW
        };
    };

    /**
     * Calculates coordinates of a point on ellipse at angle
     * @param [cx] {number} - x-coordinate of the ellipse center
     * @param [cy] {number} - y-coordinate of the ellipse center
     * @param [ra] {number} - ellipse radius 1
     * @param [rb] {number} - ellipse radius 2
     * @param [angle] {number} angle
     * @return {GPoint} a point on ellipse at angle
     * @private
     * @version 1.0
     */
    GXVertexArcGenerator.prototype._pointAtAngle = function (cx, cy, ra, rb, angle) {
        return new GPoint(ra * Math.cos(angle) + cx, rb * Math.sin(angle) + cy);
    };

    /**
     * Takes into account clockwice or counterclockwise orientation and
     * returns the next angle having the delta difference with the previous one
     * @param [isCCW] {Boolean} if an arc is counterclockwise oriented
     * @param [prevAngle] {number} previous angle
     * @param [delta] {number} angles difference
     * @return {number} next angle having the delta difference with the previous one
     * @private
     * @version 1.0
     */
    GXVertexArcGenerator.prototype._getNextAngle = function (isCCW, delta, prevAngle) {
        return isCCW ? prevAngle + delta : prevAngle - delta;
    };

    /**
     * Takes into account clockwice or counterclockwise orientation and
     * returns the two neighbour angles at which the end points of intersected edge are located
     * @param [numVert] {number} a total number of polygon or star verices
     * @param [isCCW] {Boolean} if an arc is counterclockwise oriented
     * @param [angle] {number} an angle of radius-vector for finding arc end point
     * @return ['prev', 'next', 'prevOrder'] array of angles, and the order of the vertex corresponding the first angle
     * @private
     * @version 1.0
     */
    GXVertexArcGenerator.prototype._getNeighbourAngles = function (numVert, isCCW, angle) {
        var delta = gMath.PI2 / numVert;
        var n = gMath.div(angle, delta);
        if (isCCW) {
            var prevAngle = delta * n; // previous angle
            return {
                'prev': prevAngle,
                'next': prevAngle + delta,
                'prevOrder': n
            };
        } else {
            var prevAngle = delta * (n + 1);
            return {
                'prev': prevAngle,
                'next': prevAngle - delta,
                'prevOrder': n + 1
            };
        }
    };

    /**
     * Creates a star (polygon, when inner and outer ellipses are equal) or an arc-like part of it
     * @param [vertexTarget] {GXVertexTarget} a target container for adding vertices
     * @param [cx] {number} - x-coordinate of the ellipses center
     * @param [cy] {number} - y-coordinate of the ellipses center
     * @param [ra1] {number} - inner ellipse radius 1
     * @param [rb1] {number} - inner ellipse radius 2
     * @param [ra2] {number} - outer ellipse radius 1
     * @param [rb2] {number} - outer ellipse radius 2
     * @param [startAngle] {number} arc's start angle
     * @param [endAngle] {number} arc's end angle
     * @param [numVert] {number} a number of star verices on the outer ellipse
     * @param {Number} roundness the roundness of the edges
     * @return {Boolean} indicator if all the vertices were successfully calculated and added into target
     * @public
     * @version 1.0
     */
    GXVertexArcGenerator.prototype.createStar = function (vertexTarget, cx, cy, ra1, rb1, ra2, rb2, startAngle, endAngle, numVert, roundness) {
        if (numVert <= 2) {
            return false;
        }

        // TODO : Support edge roundness
        roundness = roundness || 0;

        var numVrtx;
        if ((ra1 == ra2) && (rb1 == rb2)) {
            // polygon is needed
            numVrtx = numVert;
        } else {
            // star
            numVrtx = numVert * 2;
        }

        // Define local variables with the same names as parameters, but corrected and normalized
        // canvas Y axis is mirrored down compared with usual orientation
        // make the needed correction of parameters
        var corrParams = this._correctArgs(startAngle, endAngle, true);
        var startAngle = corrParams.startAngle;
        var endAngle = corrParams.endAngle;
        var isCW = corrParams.isCW;
        var isCCW = !isCW;

        // Define a function, which returns point at angle on outer or inner ellipse,
        // depending on i parameter parity
        var pointAtAngle = function (angle, i) {
            return i % 2 === 0 ? gArcVertexGenerator._pointAtAngle(cx, cy, ra2, rb2, angle)
                : gArcVertexGenerator._pointAtAngle(cx, cy, ra1, rb1, angle);
        }

        var delta = gMath.PI2 / numVrtx;

        // An indicator if the arc is a full shape (star / polygon)
        var fullShape = (Math.abs(endAngle - startAngle) == gMath.PI2);

        var finished = false;
        var prevAngle;
        var prevPt;
        var nextAngle;
        var nextPt;
        var startPt;
        var i = 0;

        // start an arc accurately and create a base for further iteration over vertices
        if (fullShape) {
            prevAngle = startAngle;
            prevPt = pointAtAngle(prevAngle, i);
            nextAngle = this._getNextAngle(isCCW, delta, prevAngle);
            nextPt = pointAtAngle(nextAngle, ++i);
            startPt = prevPt;
            vertexTarget.addVertex(GXVertex.Command.Move, startPt.getX(), startPt.getY());
        } else {
            var angles = this._getNeighbourAngles(numVrtx, isCCW, startAngle);
            prevAngle = angles.prev;
            nextAngle = angles.next;
            i = angles.prevOrder;
            prevPt = pointAtAngle(prevAngle, i);
            nextPt = pointAtAngle(nextAngle, ++i);

            if (prevAngle == startAngle) {
                startPt = prevPt;
            } else {
                // Find the correct point at the edge as an intersection point between the edge and
                // a radius-vector going from center at the angle startAngle
                var pt1 = pointAtAngle(startAngle, 0);
                startPt = gMath.getIntersectionPoint(prevPt.getX(), prevPt.getY(), nextPt.getX(), nextPt.getY(),
                    cx, cy, pt1.getX(), pt1.getY());
                if (!startPt) {
                    return false;
                }
            }

            // TODO: comment the below line when the starting point will be added outside,
            // or add a flag to function call indicating if this point shall be painted here
            vertexTarget.addVertex(GXVertex.Command.Line, startPt.getX(), startPt.getY());
        }

        finished = (nextAngle + ACC > endAngle) && isCCW || (nextAngle - ACC < endAngle) && !isCCW;

        // iterate over vertices until the pre-last vertex
        while (!finished) {
            vertexTarget.addVertex(GXVertex.Command.Line, nextPt.getX(), nextPt.getY());
            prevPt = nextPt;
            prevAngle = nextAngle;
            nextAngle = this._getNextAngle(isCCW, delta, prevAngle);
            nextPt = pointAtAngle(nextAngle, ++i);
            finished = (nextAngle + ACC > endAngle) && isCCW || (nextAngle - ACC < endAngle) && !isCCW;
        }

        // Find accurately the last vertex:
        // Calculate the last vertex based on endAngle instead of nextAngle 
        // to avoid calculations inaccuracy affecting the number of vertices and the
        // last vertex coordinates
        if (Math.abs(nextAngle - endAngle) < ACC) {
            if (fullShape) {
                // nextAngle == endAngle == startAngle with ACC accuracy
                vertexTarget.addVertex(GXVertex.Command.Line, startPt.getX(), startPt.getY());
            } else {
                vertexTarget.addVertex(GXVertex.Command.Line, nextPt.getX(), nextPt.getY());
            }
        } else {
            // Find the correct point at the edge as an intersection point between the edge and
            // a radius-vector going from center at the angle lambda2
            var pt2 = pointAtAngle(endAngle, 0);

            // end point
            var endPt = gMath.getIntersectionPoint(prevPt.getX(), prevPt.getY(), nextPt.getX(), nextPt.getY(),
                cx, cy, pt2.getX(), pt2.getY());
            if (!endPt) {
                return false;
            }
            vertexTarget.addVertex(GXVertex.Command.Line, endPt.getX(), endPt.getY());
        }

        return true;
    };


    // coefficients for error estimation
    // while using cubic Bezier curves for ellipse arc approximation
    // 0 < b/a < 1/4
    var coeffs3Low = [
        [
            [3.85268, -21.229, -0.330434, 0.0127842],
            [-1.61486, 0.706564, 0.225945, 0.263682],
            [-0.910164, 0.388383, 0.00551445, 0.00671814],
            [-0.630184, 0.192402, 0.0098871, 0.0102527]
        ],
        [
            [-0.162211, 9.94329, 0.13723, 0.0124084],
            [-0.253135, 0.00187735, 0.0230286, 0.01264],
            [-0.0695069, -0.0437594, 0.0120636, 0.0163087],
            [-0.0328856, -0.00926032, -0.00173573, 0.00527385]
        ]
    ];

    // coefficients for error estimation
    // while using cubic Bezier curves for ellipse arc approximation
    // 1/4 <= b/a <= 1
    var coeffs3High = [
        [
            [0.0899116, -19.2349, -4.11711, 0.183362],
            [0.138148, -1.45804, 1.32044, 1.38474],
            [0.230903, -0.450262, 0.219963, 0.414038],
            [0.0590565, -0.101062, 0.0430592, 0.0204699]
        ],
        [
            [0.0164649, 9.89394, 0.0919496, 0.00760802],
            [0.0191603, -0.0322058, 0.0134667, -0.0825018],
            [0.0156192, -0.017535, 0.00326508, -0.228157],
            [-0.0236752, 0.0405821, -0.0173086, 0.176187]
        ]
    ];

    // safety factor to convert the "best" error approximation
    // into a "max bound" error
    var safety3 = [0.001, 4.98, 0.207, 0.0067];

    var defaultFlatness = 0.5; // in points

    /**
     * Compute the value of a rational function.
     * This method handles rational functions where the numerator is
     * quadratic and the denominator is linear
     * @param x absissa for which the value should be computed
     * @param c coefficients array of the rational function
     * @return {Number}
     * @version 1.0
     */
    function rationalFunction(x, c) {
        return (x * (x * c[0] + c[1]) + c[2]) / (x + c[3]);
    };

    /**
     * Estimate the approximation error for a sub-arc of the ellipse.
     * @param [ra] {number} - ellipse radius 1
     * @param [rb] {number} - ellipse radius 2
     * @param [etaA] {number} start angle of the sub-arc
     * @param [nextAngle] {number}  end angle of the sub-arc
     * @return {Number} upper bound of the approximation error between the cubic Bezier
     * curve and the real ellipse
     * @private
     * @version 1.0
     */
    GXVertexArcGenerator.prototype._estimateError = function (ra, rb, etaA, nextAngle) {
        var eta = 0.5 * (etaA + nextAngle);

        var x = rb / ra;
        var dEta = nextAngle - etaA;
        var cos2 = Math.cos(2 * eta);
        var cos4 = Math.cos(4 * eta);
        var cos6 = Math.cos(6 * eta);

        var coeffs = (x < 0.25) ? coeffs3Low : coeffs3High;

        var c0 = rationalFunction(x, coeffs[0][0])
            + cos2 * rationalFunction(x, coeffs[0][1])
            + cos4 * rationalFunction(x, coeffs[0][2])
            + cos6 * rationalFunction(x, coeffs[0][3]);

        var c1 = rationalFunction(x, coeffs[1][0])
            + cos2 * rationalFunction(x, coeffs[1][1])
            + cos4 * rationalFunction(x, coeffs[1][2])
            + cos6 * rationalFunction(x, coeffs[1][3]);

        return rationalFunction(x, safety3) * ra * Math.exp(c0 + c1 * dEta);
    };

    /**
     * Creates an ellipse or an arc-like part of it with applied this._transform
     * @param [vertexTarget] {GXVertexTarget} a target container for adding vertices
     * @param [cx] {number} - x-coordinate of the ellipse center
     * @param [cy] {number} - y-coordinate of the ellipse center
     * @param [ra] {number} - ellipse radius 1
     * @param [rb] {number} - ellipse radius 2
     * @param [startAngle] {number} arc's start angle
     * @param [endAngle] {number} arc's end angle
     * @param [ellipseStyle] {GXVertex.EllipseStyle} indicates if pie (0), chord (1) or arc (2) shall be calculated
     * @param [threshold] {number} upper bound of the possible approximation error between the cubic Bezier
     * curve and the real ellipse, if not given or 0 defaults to defaultFlatness (0.5pt)
     * @return {Boolean} indicator if all the vertices were successfully calculated and added into target
     * @public
     * @version 1.0
     */
    GXVertexArcGenerator.prototype.createEllipse = function (vertexTarget, cx, cy, ra, rb, startAngle, endAngle, ellipseStyle, threshold) {
        var new_cx, new_cy, new_ra, new_rb, new_startAngle, new_endAngle, theta;
        var T0, M;

        if (!this._transform || this._transform.isIdentity()) {
            return this._createEllipse(
                vertexTarget, cx, cy, ra, rb, startAngle, endAngle, ellipseStyle, 0, threshold);
        }

        // Ellipse may be described in the matrix form x*Q*(x)trans = 0
        // For original ellipse we have
        // (x - cx)^2 / ra^2 + (y - cy)^2 / rb^2 = 1
        // rb^2*x^2 + ra^2*y^2 + 2*(-rb^2)*cx*x + 2*(-ra^2)*cy*y -ra^2*rb^2 + cx^2*rb^2 + cy^2*ra^2 = 0
        // When we apply transform with matrix T, we get equation x*(T^-1)trans*Q*(T^-1)*(x)trans = 0
        //
        //                                                          1 0 0
        // Unit circle with center at (0,0) has ellipse matrix Q = [0 1 0]
        //                                                          0 0 -1
        // Transform, that was applied to the unit circle with center at (0,0) to get the original ellipse was:
        //       ra 0  cx
        // T0 = [0  rb cy]
        //       0  0   1
        //                                      1/ra  0  -cx/ra
        // It may be easily checked as T0^-1 = [ 0  1/rb -cy/rb]
        //                                       0    0    1
        // Applying new transform T1 to original ellipse is the same as to apply T1*T0 to the unit circle
        // with center at (0,0)
        // Lets find matrix M = T1*T0, and then new ra, rb, cx, cy, and rotation angle theta from it.

        T0 = new GTransform(ra, 0, 0, rb, cx, cy);
        M = this._transform.clone();
        M.preMultiply(T0);
        new_cx = M.tx;
        new_cy = M.ty;

        // new_ra * cos(theta) = M.sx
        // new_ra * sin(theta) = M.shy
        // new_rb * -sin(theta) = M.shx
        // new_rb * cos(theta) = M.sy
        new_ra = Math.sqrt(M.sx * M.sx + M.shy * M.shy);
        new_rb = Math.sqrt(M.shx * M.shx + M.sy * M.sy);

        // TODO: find rotation angle theta, and new_startAngle, new_endAngle

        return this._createEllipse(
            vertexTarget, new_cx, new_cy, new_ra, new_rb, new_startAngle, new_endAngle, ellipseStyle, theta, threshold);
    };

    GXVertexArcGenerator.prototype._createEllipse = function (vertexTarget, cx, cy, ra, rb, startAngle, endAngle, ellipseStyle, theta, threshold) {

        // TODO: get from the old code version generation of ellipse rotated to some degree theta

        // Define local variables with the same names as parameters, but corrected and normalized
        // canvas Y axis is mirrored down compared with usual orientation
        // make the needed correction of parameters
        var corrParams = this._correctArgs(startAngle, endAngle, true);
        var startAngle = corrParams.startAngle;
        var endAngle = corrParams.endAngle;
        var isCW = corrParams.isCW;
        var isCCW = !isCW;

        // An indicator if the arc is a full shape (ellipse)
        var fullShape = (Math.abs(endAngle - startAngle) == gMath.PI2);

        if (!threshold) {
            threshold = defaultFlatness;
        }

        var isPieSlice = false;
        var isChord = false;
        switch (ellipseStyle) {
            case 0:
                isPieSlice = true;
                break;
            case 1:
                isChord = true;
                break;
            case 2:
                break;
            default:
                throw new Error("Unknown ellipse arc style - " + ellipseStyle.toString());
        }

        var prevAngle;
        var nextAngle;

        // find the number of Bezier curves needed
        var found = false;
        var n = 1;
        var diffAngle = Math.abs(endAngle - startAngle);
        while ((!found) && (n < 1024)) {
            var delta = diffAngle / n;

            // Take into account that due to calculations inaccuracy when delta 
            // are calculated, delta which is exactly 0.5Pi may become a little bit greater
            if (Math.abs(delta) <= 0.5 * Math.PI + ACC) {
                var nextAngle = startAngle;
                found = true;
                for (i = 0; found && (i < n); ++i) {
                    prevAngle = nextAngle;
                    nextAngle = this._getNextAngle(isCCW, delta, prevAngle);
                    found = (this._estimateError(ra, rb, prevAngle, nextAngle) <= threshold);
                }
                if (!found) {
                    n = n << 1;
                }
            } else {
                n = n << 1;
            }
        }

        delta = diffAngle / n;

        // Add the first point and create a base for iterating over curves
        nextAngle = startAngle;
        var nextPt = this._pointAtAngle(cx, cy, ra, rb, nextAngle);
        var startPt = nextPt;
        var xNextDot = -ra * Math.sin(nextAngle);
        var yNextDot = rb * Math.cos(nextAngle);

        if (isPieSlice) {
            vertexTarget.addVertex(GXVertex.Command.Move, cx, cy);
            vertexTarget.addVertex(GXVertex.Command.Line, nextPt.getX(), nextPt.getY());
        } else if (isChord) {
            vertexTarget.addVertex(GXVertex.Command.Move, nextPt.getX(), nextPt.getY());
        } else { // Arc
            vertexTarget.addVertex(GXVertex.Command.Line, nextPt.getX(), nextPt.getY());
        }

        var t = Math.tan(0.5 * delta);
        var alpha = Math.sin(delta) * (Math.sqrt(4 + 3 * t * t) - 1) / 3;

        var prevPt;
        var xPrevDot;
        var yPrevDot;

        // iterate over curves
        for (var i = 0; i < n; ++i) {
            prevAngle = nextAngle;
            prevPt = nextPt;
            xPrevDot = xNextDot;
            yPrevDot = yNextDot;

            // Find accurately the last vertex:
            // Calculate the last vertex based on endAngle instead of nextAngle 
            // to avoid calculations inaccuracy affecting the number of vertices and the
            // last vertex coordinates
            if (i == n - 1) {
                nextAngle = endAngle;
                if (fullShape) {
                    nextPt = startPt;
                } else {
                    nextPt = this._pointAtAngle(cx, cy, ra, rb, nextAngle);
                }
            } else {
                nextAngle = this._getNextAngle(isCCW, delta, prevAngle);
                nextPt = this._pointAtAngle(cx, cy, ra, rb, nextAngle);
            }
            xNextDot = -ra * Math.sin(nextAngle);
            yNextDot = rb * Math.cos(nextAngle);

            vertexTarget.addVertex(GXVertex.Command.Curve2, nextPt.getX(), nextPt.getY());
            if (isCCW) {
                vertexTarget.addVertex(GXVertex.Command.Curve2, prevPt.getX() + alpha * xPrevDot, prevPt.getY() + alpha * yPrevDot);
                vertexTarget.addVertex(GXVertex.Command.Curve2, nextPt.getX() - alpha * xNextDot, nextPt.getY() - alpha * yNextDot);
            } else {
                vertexTarget.addVertex(GXVertex.Command.Curve2, prevPt.getX() - alpha * xPrevDot, prevPt.getY() - alpha * yPrevDot);
                vertexTarget.addVertex(GXVertex.Command.Curve2, nextPt.getX() + alpha * xNextDot, nextPt.getY() + alpha * yNextDot);
            }
        }

        if (isPieSlice || isChord) {
            vertexTarget.addVertex(GXVertex.Command.Close);
        }

        return true;
    };

    _.gArcVertexGenerator = new GXVertexArcGenerator();
})(this);