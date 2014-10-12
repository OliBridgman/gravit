(function (_) {
    /**
     * A radial gradient
     * @class IFRadialGradient
     * @extends IFGradient
     * @constructor
     */
    function IFRadialGradient(stops, r, tx, ty, sx, sy) {
        IFGradient.call(
            this,
            stops,
            typeof r === 'number' ? r : 0,
            typeof tx === 'number' ? tx : 0.5,
            typeof ty === 'number' ? ty : 0.5,
            typeof sx === 'number' ? sx : 0.5,
            typeof sy === 'number' ? sy : 0.5
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