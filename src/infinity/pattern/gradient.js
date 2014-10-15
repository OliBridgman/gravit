(function (_) {
    /**
     * A class representing a color gradient
     * @class IFGradient
     * @extends IFPattern
     * @constructor
     */
    function IFGradient(stops, r, tx, ty, sx, sy) {
        if (stops) {
            this._stops = stops.slice();
        } else {
            this._stops = [
                {opacity: 1, position: 0},
                {opacity: 1, position: 1.0},
                {color: IFRGBColor.WHITE, position: 0},
                {color: IFRGBColor.BLACK, position: 1.0}
            ];
        }

        this._r = typeof r === 'number' ? r : 0;
        this._tx = typeof tx === 'number' ? tx : 0;
        this._ty = typeof ty === 'number' ? ty : 0;
        this._sx = typeof sx === 'number' ? sx : 1;
        this._sy = typeof sy === 'number' ? sy : 1;
    }

    IFObject.inherit(IFGradient, IFPattern);

    function interpolateStops(stops, position, filter, callback) {
        var prevStop = null;
        var nextStop = null;

        for (var i = 0; i < stops.length; ++i) {
            var stop = stops[i];
            if (filter(stop)) {
                if (stop.position === position) {
                    return callback(stop, stop);
                }

                if (stop.position < position && (!prevStop || stop.position > prevStop.position)) {
                    prevStop = stop;
                }

                if (stop.position > position && (!nextStop || stop.position < nextStop.position)) {
                    nextStop = stop;
                }
            }
        }

        return callback(prevStop, nextStop);
    };

    IFGradient.interpolateOpacity = function (stops, position) {
        return interpolateStops(stops, position, function (s) {
            return s.hasOwnProperty('opacity')
        }, function (prev, next) {
            if (prev === next || (prev && !next)) {
                return prev.opacity;
            } else if (next && !prev) {
                return next.opacity;
            } else {
                return next.opacity * position + prev.opacity * (1 - position);
            }
        });
    }

    IFGradient.interpolateColor = function (stops, position, nullForMatch, noCMS) {
        return interpolateStops(stops, position, function (s) {
            return s.hasOwnProperty('color')
        }, function (prev, next) {

            if (prev === next || (prev && !next)) {
                return nullForMatch ? null : prev.color;
            } else if (next && !prev) {
                return next.color;
            } else {
                var c1 = next.color.toScreen(noCMS);
                var c2 = prev.color.toScreen(noCMS);

                return new IFRGBColor([
                    Math.round(c1[0] * position + c2[0] * (1 - position)),
                    Math.round(c1[1] * position + c2[1] * (1 - position)),
                    Math.round(c1[2] * position + c2[2] * (1 - position))
                ]);
            }
        });
    }

    /**
     * Returns the interpolated (aka real) screen colors
     */
    IFGradient.interpolateStops = function (stops, noCMS) {
        var result = [];

        for (var i = 0; i < stops.length; ++i) {
            var stop = stops[i];
            if (stop.hasOwnProperty('color')) {
                result.push({
                    position: stop.position,
                    color: stop.color,
                    opacity: IFGradient.interpolateOpacity(stops, stop.position, true)
                });
            } else if (stop.hasOwnProperty('opacity')) {
                var color = IFGradient.interpolateColor(stops, stop.position, true, noCMS);
                if (color !== null) {
                    result.push({
                        position: stop.position,
                        color: color,
                        opacity: stop.opacity
                    });
                }
            }
        }

        return result.sort(function (a, b) {
            return a.position > b.position;
        });
    };

    /**
     * Compare two gradients for equality Also takes care of null parameters.
     * Note that this does not compare the type of the gradient.
     * @param {IFGradient} left left side gradient
     * @param {IFGradient} right right side gradient
     * @param {Boolean} [stopsOnly] if set, gradients are equal if their stop
     * values are equal no matter of their type, defaults to false
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    IFGradient.equals = function (left, right, stopsOnly) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (!stopsOnly) {
                if (left._tx !== right._tx ||
                    left._ty !== right._ty ||
                    left._sx !== right._sx ||
                    left._sy !== right._sy ||
                    left._r !== right._r) {
                    return false;
                }
            }

            if (left._stops.length !== right._stops.length) {
                return false;
            }

            var s1 = left._stops;
            var s2 = right._stops;
            for (var i = 0; i < s1.length; ++i) {
                if (s1[i].position !== s2[i].position) {
                    return false;
                }

                if (s1[i].hasOwnProperty('opacity')) {
                    if (!s2[i].hasOwnProperty('opacity')) {
                        return false;
                    } else {
                        if (s1[i].opacity !== s2[i].opacity) {
                            return false;
                        }
                    }
                } else {
                    if (!IFUtil.equals(s1[i].color, s2[i].color)) {
                        return false;
                    }
                }
            }
        }
        return false;
    };

    /**
     * @type {Array<{{position: Number, color: IFColor}}>}
     * @private
     */
    IFGradient.prototype._stops = null;

    /**
     * @type {number}
     * @private
     */
    IFGradient.prototype._r = null;

    /**
     * @type {number}
     * @private
     */
    IFGradient.prototype._tx = null;

    /**
     * @type {number}
     * @private
     */
    IFGradient.prototype._ty = null;

    /**
     * @type {number}
     * @private
     */
    IFGradient.prototype._sx = null;

    /**
     * @type {number}
     * @private
     */
    IFGradient.prototype._sy = null;

    /**
     * Returns the interpolated colors
     * @return {Array<{{color: IFColor, opacity: Number, position: Number}}>}
     */
    IFGradient.prototype.getInterpolatedStops = function (noCMS) {
        return IFGradient.interpolateStops(this._stops, noCMS);
    };

    /**
     * You may modify the return value though this class
     * is supposed to be immutable so ensure you know what
     * you are actually doing!!
     * @returns {Array<{{position: Number, color: IFColor, opacity: Number}}>}
     */
    IFGradient.prototype.getStops = function () {
        return this._stops;
    };

    /** @override */
    IFGradient.prototype.serialize = function () {
        var blob = {};

        blob.t = [this._tx, this._ty, this._sx, this._sy, this._r];
        blob.s = [];

        for (var i = 0; i < this._stops.length; ++i) {
            var stop = this._stops[i];

            var obj = {
                p: stop.position
            };

            if (stop.hasOwnProperty('color')) {
                obj.c = IFPattern.serialize(stop.color);
            } else if (stop.hasOwnProperty('opacity')) {
                obj.o = stop.opacity;
            }

            blob.s.push(obj);
        }

        return JSON.stringify(blob);
    };

    /** @override */
    IFGradient.prototype.deserialize = function (string) {
        var blob = JSON.parse(string);

        if (blob) {
            this._tx = blob.t[0];
            this._ty = blob.t[1];
            this._sx = blob.t[2];
            this._sy = blob.t[3];
            this._r = blob.t[4];

            this._stops = [];

            for (var i = 0; i < blob.s.length; ++i) {
                var obj = blob.s[i];
                var stop = {
                    position: obj.p
                };

                if (obj.hasOwnProperty('c')) {
                    stop.color = IFPattern.deserialize(obj.c);
                } else if (obj.hasOwnProperty('o')) {
                    stop.opacity = obj.o
                }

                this._stops.push(stop);
            }
        }
    };

    /** @override */
    IFGradient.prototype.isScaled = function () {
        return this._sx !== 1.0 || this._sy !== 1.0;
    };

    /**
     * Return CSS-Compatible string representation of the underlying gradient
     * stops separated by comma
     * @param {Number} opacity
     * @return {String}
     */
    IFGradient.prototype.toScreenCSS = function (opacity, noCMS) {
        var stops = this.getInterpolatedStops();
        var cssStops = [];
        for (var i = 0; i < stops.length; ++i) {
            var stop = stops[i];
            var stopOpacity = stop.opacity;
            if (typeof opacity === 'number') {
                stopOpacity *= opacity;
            }
            cssStops.push('' + stop.color.toScreenCSS(stopOpacity, noCMS) + ' ' + Math.round(stop.position * 100) + '%');
        }

        return cssStops.join(', ');
    };

    /**
     * Returns a transformation for the gradient
     * @param width
     * @param height
     */
    IFGradient.prototype.getGradientTransform = function (width, height) {
        return new IFTransform()
            .scaled(this._sx, this._sy)
            .rotated(this._r)
            .translated(this._tx, this._ty);
    };

    /** @override */
    IFGradient.prototype.createPaint = function (canvas, bbox) {
        return {
            paint: canvas.createGradient(this),
            transform: this
                .getGradientTransform()
                .scaled(bbox.getWidth(), bbox.getHeight())
                .translated(bbox.getX(), bbox.getY())
        };
    };

    /** @override */
    IFGradient.prototype.toString = function () {
        return "[Object IFGradient]";
    };

    _.IFGradient = IFGradient;
})(this);