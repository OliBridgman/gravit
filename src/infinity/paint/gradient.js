(function (_) {
    /**
     * A class representing a color gradient
     * @class IFGradient
     * @extends IFPattern
     * @constructor
     */
    function IFGradient(stops, type) {
        if (stops) {
            this._stops = [];
            for (var i = 0; i < stops.length; ++i) {
                this._stops.push({
                    position: stops[i].position < 0 ? 0 : stops[i].position > 100 ? 100 : stops[i].position,
                    color: stops[i].color
                });
            }
        } else {
            this._stops = [new IFColor(IFColor.Type.Black), new IFColor(IFColor.Type.White)];
        }

        this._type = type ? type : IFGradient.Type.Linear;
    }

    IFObject.inherit(IFGradient, IFPattern);

    /**
     * @enum
     */
    IFGradient.Type = {
        Linear: 'L',
        Radial: 'R'
    };

    /**
     * Parse a string into a IFGradient
     * @param {String} string
     * @return {IFGradient}
     */
    IFGradient.parseGradient = function (string) {
        if (!string || string === "") {
            return null;
        }

        var blob = JSON.parse(string);
        if (blob) {
            var result = new IFGradient();

            result._type = blob.t;
            result._stops = [];

            for (var i = 0; i < blob.s.length; ++i) {
                var stop = blob.s[i];
                result._stops.push({
                    position: stop.p,
                    color: IFColor.parseColor(stop.c)
                })
            }

            return result;
        }

        return null;
    };

    /**
     * Compare two gradients for equality Also takes care of null parameters
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
                if (left._type !== right._type) {
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

                if (!IFColor.equals(s1[i].color, s2[i].color)) {
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

    /** @override */
    IFGradient.prototype.getPatternType = function () {
        return IFPattern.Type.Gradient;
    };

    /**
     * @return {IFGradient.Type}
     */
    IFGradient.prototype.getType = function () {
        return this._type;
    };

    /**
     * You may modify the return value though this class
     * is supposed to be immutable so ensure you know what
     * you are actually doing!!
     * @returns {Array<{{position: Number, color: IFColor}}>}
     */
    IFGradient.prototype.getStops = function () {
        return this._stops;
    };

    /**
     * Return string representation of the underlying gradient
     * @return {String}
     */
    IFGradient.prototype.asString = function () {
        var stops = [];
        for (var i = 0; i < this._stops.length; ++i) {
            stops.push({
                p: this._stops[i].position,
                c: this._stops[i].color.asString()
            })
        }

        var blob = {
            t: this._type,
            s: stops
        };

        return JSON.stringify(blob);
    };

    /**
     * Return CSS-Compatible string representation of the underlying gradient
     * stops separated by comma
     * @return {String}
     */
    IFGradient.prototype.asCSSString = function () {
        var cssStops = [];

        for (var i = 0; i < this._stops.length; ++i) {
            var stop = this._stops[i];
            cssStops.push('' + stop.color.asCSSString() + ' ' + stop.position + '%');
        }

        return cssStops.join(', ');
    };

    /**
     * Return CSS-Compatible string representation of the underlying gradient
     * including the gradient declaration used for css background
     * @return {String}
     */
    IFGradient.prototype.asCSSBackgroundString = function () {
        var cssStops = this.asCSSString();
        switch (this._type) {
            case IFGradient.Type.Radial:
                return 'radial-gradient(ellipse at center, ' + cssStops + ')';
            default:
                return 'linear-gradient(90deg, ' + cssStops + ')';
        }
    };

    /** @override */
    IFGradient.prototype.toString = function () {
        return "[Object IFGradient]";
    };

    _.IFGradient = IFGradient;
})(this);