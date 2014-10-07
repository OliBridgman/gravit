(function (_) {
    /**
     * A class representing a color gradient
     * @class IFGradient
     * @extends IFPattern
     * @constructor
     */
    function IFGradient(stops, r, tx, ty, sx, sy) {
        if (stops) {
            this._stops = [];
            for (var i = 0; i < stops.length; ++i) {
                this._stops.push({
                    position: stops[i].position < 0 ? 0 : stops[i].position > 100 ? 100 : stops[i].position,
                    color: stops[i].color
                });
            }
        } else {
            this._stops = [{color: IFRGBColor.WHITE, position: 0}, {color: IFRGBColor.BLACK, position: 100}];
        }

        this._r = typeof r === 'number' ? r : 0;
        this._tx = typeof tx === 'number' ? tx : 0;
        this._ty = typeof ty === 'number' ? ty : 0;
        this._sx = typeof sx === 'number' ? sx : 1;
        this._sy = typeof sy === 'number' ? sy : 1;
    }

    IFObject.inherit(IFGradient, IFPattern);

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

                if (!IFUtil.equals(s1[i].color, s2[i].color)) {
                    return false;
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
     * You may modify the return value though this class
     * is supposed to be immutable so ensure you know what
     * you are actually doing!!
     * @returns {Array<{{position: Number, color: IFColor}}>}
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
            blob.s.push({
                p: this._stops[i].position,
                c: IFPattern.serialize(this._stops[i].color)
            })
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
                var stop = blob.s[i];
                this._stops.push({
                    position: stop.p,
                    color: IFPattern.deserialize(stop.c)
                })
            }
        }
    };

    /**
     * Return CSS-Compatible string representation of the underlying gradient
     * stops separated by comma
     * @return {String}
     */
    IFGradient.prototype.toScreenCSS = function () {
        var cssStops = [];

        for (var i = 0; i < this._stops.length; ++i) {
            var stop = this._stops[i];
            cssStops.push('' + stop.color.toScreenCSS() + ' ' + stop.position + '%');
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
    IFGradient.prototype.toString = function () {
        return "[Object IFGradient]";
    };

    _.IFGradient = IFGradient;
})(this);