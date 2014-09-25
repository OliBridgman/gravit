(function (_) {
    /**
     * Color grading filter
     * @class IFColorGradingFilter
     * @constructor
     */
    function IFColorGradingFilter() {
    };

    /**
     * Parses an Adobe ACV File and returns the curve points
     * @param {ArrayBuffer} data
     * @return {{rgb:[], r:[], g:[], b:[]}} the curve points or null
     * if ACV couldn't be read
     */
    IFColorGradingFilter.parseACV = function (data) {
        var view = new jDataView(data);

        var result = {
            rgb: [],
            r: [],
            g: [],
            b: []
        };

        view.seek(4);

        var length = view.getUint16();
        var ref = ['r', 'g', 'b'];
        var array = null;
        var x = null;
        var y = null;
        var i = null;
        var j = null;

        result.rgb.push([0, view.getUint16() ]);
        view.seek(view.tell() + 2);
        for (i = 1; i < length; i++) {
            y = view.getUint16();
            x = view.getUint16();
            result.rgb.push([x, y]);
        }

        // Now let's get the individual R, G, B curve result
        for (i = 0; i < 3; i++) {
            length = view.getUint16();
            array = result[ ref[ i ] ];
            for (j = 0; j < length; j++) {
                y = view.getUint16();
                x = view.getUint16();
                array.push([x, y]);
            }
        }

        return result;
    };

    /**
     * Gets the curve values for the specified set of curve points
     */
    IFColorGradingFilter.getCurve = function (curvePoints) {
        var curve = [],
            x = [],
            y = [],
            spline,
            p,
            i;

        // Loop through each point
        for (i = 0; i < curvePoints.length; i++) {
            p = curvePoints[ i ];
            x.push(p[0]);
            y.push(p[1]);
        }

        // Create the cubic spline
        cubicSpline = new MonotonicCubicSpline(x, y);

        // Interpolate values and return the curve
        for (i = 0; i <= 256; i++)
            curve[ i ] = Math.round(cubicSpline.interpolate(i)) || 0;

        return curve;
    };

    /**
     * Gets the curves values for the various RGB channels
     */
    IFColorGradingFilter.getCurves = function (allPoints) {
        var getCurves = [],
            curves = {},
            i = 0,
            min,
            j;

        /*
         * Handy function for getting lowest value in an array, above a specified value.
         * Found at http://www.webdeveloper.com/forum/showthread.php?254722-Smallest-Value-in-an-Array
         */
        Array.prototype.getLowestAbove = function (a) {
            return Math.min.apply(0, this.filter(function (a) {
                return a > this;
            }, a)) || 0;
        }

        // Get each curve & add them to the curves array
        for (i in allPoints)
            getCurves.push(IFColorGradingFilter.getCurve(allPoints[ i ]));

        // Sort them out
        curves.a = getCurves[0];
        curves.r = getCurves[1];
        curves.g = getCurves[2];
        curves.b = getCurves[3];

        // Remove null values
        for (i in curves) {
            min = ( curves[ i ].getLowestAbove(0) - 1 );
            for (j = 0; j <= curves[ i ].length; j++) {
                if (curves[ i ][ j ] == 0)
                    curves[ i ][ j ] = min;
            }
        }

        return curves;
    };

    /**
     * @override
     * @param {{rgb:[], r:[], g:[], b:[]}} args color grading curve points
     */
    IFColorGradingFilter.apply = function (pixels, width, height, args) {
        var curves = IFColorGradingFilter.getCurves(args);
        if (curves) {
            var length = pixels.length;

            // Apply the color R, G, B values to each individual pixel
            for (var i = 0; i < length; i += 4) {
                pixels[ i ] = curves.r[ pixels[ i ] ];
                pixels[ i + 1 ] = curves.g[ pixels[ i + 1 ] ];
                pixels[ i + 2 ] = curves.b[ pixels[ i + 2 ] ];
            }

            // Apply the overall RGB contrast changes to each pixel
            for (var i = 0; i < length; i += 4) {
                pixels[ i ] = curves.a[ pixels[ i ] ];
                pixels[ i + 1 ] = curves.a[ pixels[ i + 1 ] ];
                pixels[ i + 2 ] = curves.a[ pixels[ i + 2 ] ];
            }
        }
    };

    _.IFColorGradingFilter = IFColorGradingFilter;

    /*
     * jQuery filter.me is Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
     * Copyright © 2012 Matthew Ruddy (http://matthewruddy.com).
     *
     * @author Matthew Ruddy
     * @version 1.0
     */
})(this);