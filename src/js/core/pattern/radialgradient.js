(function (_) {
    /**
     * A radial gradient
     * @class GRadialGradient
     * @extends GGradient
     * @constructor
     */
    function GRadialGradient(stops, scale) {
        GGradient.call(
            this,
            stops,
            scale
        );
    }

    GPattern.inherit('R', GRadialGradient, GGradient);

    GRadialGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof GRadialGradient && right instanceof  GRadialGradient) {
            return GGradient.equals(left, right, stopsOnly);
        }
        return false;
    };

    /** @override */
    GRadialGradient.prototype.asCSSBackground = function (opacity) {
        return 'radial-gradient(ellipse at center, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    GRadialGradient.prototype.toString = function () {
        return "[Object GRadialGradient]";
    };

    _.GRadialGradient = GRadialGradient;
})(this);