(function (_) {
    /**
     * A radial gradient
     * @class IFRadialGradient
     * @extends IFGradient
     * @constructor
     */
    function IFRadialGradient(stops, scale) {
        IFGradient.call(
            this,
            stops,
            scale
        );
    }

    IFPattern.inherit('R', IFRadialGradient, IFGradient);

    IFRadialGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof IFRadialGradient && right instanceof  IFRadialGradient) {
            return IFGradient.equals(left, right, stopsOnly);
        }
        return false;
    };

    /** @override */
    IFRadialGradient.prototype.asCSSBackground = function (opacity) {
        return 'radial-gradient(ellipse at center, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    IFRadialGradient.prototype.toString = function () {
        return "[Object IFRadialGradient]";
    };

    _.IFRadialGradient = IFRadialGradient;
})(this);