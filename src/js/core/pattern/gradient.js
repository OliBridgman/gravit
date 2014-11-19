(function (_) {
    /**
     * A class representing a color gradient
     * @class GGradient
     * @extends GPattern
     * @constructor
     */
    function GGradient(stops, scale) {
        if (stops) {
            this._stops = [];
            for (var i = 0; i < stops.length; ++i) {
                var stop = stops[i];
                var newStop = {
                    position: stop.position
                };

                if (stop.hasOwnProperty('color')) {
                    newStop.color = stop.color;
                } else if (stop.hasOwnProperty('opacity')) {
                    newStop.opacity = stop.opacity;
                }

                this._stops.push(newStop);
            }
        } else {
            this._stops = [
                {opacity: 1, position: 0},
                {opacity: 1, position: 1.0},
                {color: GRGBColor.WHITE, position: 0},
                {color: GRGBColor.BLACK, position: 1.0}
            ];
        }

        this._scale = typeof scale === 'number' ? scale : 1.0;
    }

    GObject.inherit(GGradient, GPattern);

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

    GGradient.interpolateOpacity = function (stops, position) {
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

    GGradient.interpolateColor = function (stops, position, nullForMatch, noCMS) {
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

                return new GRGBColor([
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
    GGradient.interpolateStops = function (stops, noCMS) {
        var result = [];

        for (var i = 0; i < stops.length; ++i) {
            var stop = stops[i];
            if (stop.hasOwnProperty('color')) {
                result.push({
                    position: stop.position,
                    color: stop.color,
                    opacity: GGradient.interpolateOpacity(stops, stop.position, true)
                });
            } else if (stop.hasOwnProperty('opacity')) {
                var color = GGradient.interpolateColor(stops, stop.position, true, noCMS);
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
     * @param {GGradient} left left side gradient
     * @param {GGradient} right right side gradient
     * @param {Boolean} [stopsOnly] if set, gradients are equal if their stop
     * values are equal no matter of their type, defaults to false
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    GGradient.equals = function (left, right, stopsOnly) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (!stopsOnly) {
                if (left._scale !== right._scale) {
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
                    if (!GUtil.equals(s1[i].color, s2[i].color)) {
                        return false;
                    }
                }
            }
        }
        return false;
    };

    /**
     * @type {Array<{{position: Number, color: GColor}}>}
     * @private
     */
    GGradient.prototype._stops = null;

    /**
     * @type {number}
     * @private
     */
    GGradient.prototype._scale = null;

    /**
     * Returns the interpolated colors
     * @return {Array<{{color: GColor, opacity: Number, position: Number}}>}
     */
    GGradient.prototype.getInterpolatedStops = function (noCMS) {
        return GGradient.interpolateStops(this._stops, noCMS);
    };

    /**
     * You may modify the return value though this class
     * is supposed to be immutable so ensure you know what
     * you are actually doing!!
     * @returns {Array<{{position: Number, color: GColor, opacity: Number}}>}
     */
    GGradient.prototype.getStops = function () {
        return this._stops;
    };

    /** @override */
    GGradient.prototype.serialize = function () {
        return JSON.stringify(this._serializeToBlob());
    };

    /** @override */
    GGradient.prototype.deserialize = function (string) {
        var blob = JSON.parse(string);

        if (blob) {
            this._deserializeFromBlob(blob);
        }
    };

    /**
     * Returns the scale of the pattern
     * @returns {number}
     */
    GGradient.prototype.getScale = function () {
        return this._scale;
    };

    /**
     * Return CSS-Compatible string representation of the underlying gradient
     * stops separated by comma
     * @param {Number} opacity
     * @return {String}
     */
    GGradient.prototype.toScreenCSS = function (opacity, noCMS) {
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
     * @returns {{*}}
     * @private
     */
    GGradient.prototype._serializeToBlob = function () {
        var blob = {};

        if (this._scale && this._scale !== 1.0) {
            blob.s = this._scale;
        }

        blob.x = [];

        for (var i = 0; i < this._stops.length; ++i) {
            var stop = this._stops[i];

            var obj = {
                p: stop.position
            };

            if (stop.hasOwnProperty('color')) {
                obj.c = GPattern.serialize(stop.color);
            } else if (stop.hasOwnProperty('opacity')) {
                obj.o = stop.opacity;
            }

            blob.x.push(obj);
        }

        return blob;
    };

    /**
     * @param {{*}} blob
     * @private
     */
    GGradient.prototype._deserializeFromBlob = function (blob) {
        this._scale = blob.hasOwnProperty('s') ? blob.s : 1;

        this._stops = [];

        for (var i = 0; i < blob.x.length; ++i) {
            var obj = blob.x[i];
            var stop = {
                position: obj.p
            };

            if (obj.hasOwnProperty('c')) {
                stop.color = GPattern.deserialize(obj.c);
            } else if (obj.hasOwnProperty('o')) {
                stop.opacity = obj.o
            }

            this._stops.push(stop);
        }
    };

    /** @override */
    GGradient.prototype.toString = function () {
        return "[Object GGradient]";
    };

    _.GGradient = GGradient;
})(this);