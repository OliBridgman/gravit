(function (_) {
    /**
     * A class representing a CMYK Color
     * @param {CMYK} cmyk
     * @class GCMYKColor
     * @extends GColor
     * @constructor
     */
    function GCMYKColor(cmyk) {
        GColor.call(this, cmyk ? cmyk : [1, 1, 1, 1]);
    }

    GPattern.inherit('Y', GCMYKColor, GColor);

    GCMYKColor.equals = function (left, right) {
        if (left instanceof GCMYKColor && right instanceof  GCMYKColor) {
            return GUtil.equals(left._value, right._value);
        }
        return false;
    };

    /** @override */
    GCMYKColor.prototype.toHumanString = function () {
        return 'cmyk ' +
            (this._value[0] * 100).toFixed() + '%,' +
            (this._value[1] * 100).toFixed() + '%,' +
            (this._value[2] * 100).toFixed() + '%,' +
            (this._value[3] * 100).toFixed() + '%';
    };

    /** @override */
    GCMYKColor.prototype.toScreen = function (noCMS) {
        return GColor.cmykToRGB(this._value, noCMS);
    };

    /** @override */
    GCMYKColor.prototype.clone = function () {
        return new GCMYKColor(this._value);
    };

    /** @override */
    GCMYKColor.prototype.toString = function () {
        return "[Object GCMYKColor]";
    };

    _.GCMYKColor = GCMYKColor;
})(this);