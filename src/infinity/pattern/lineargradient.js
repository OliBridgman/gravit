(function (_) {
    /**
     * A linear gradient
     * @class IFLinearGradient
     * @extends IFGradient
     * @constructor
     */
    function IFLinearGradient(stops, r, tx, ty, sx, sy) {
        IFGradient.call(
            this,
            stops,
            typeof r === 'number' ? r : 0,
            typeof tx === 'number' ? tx : 0,
            typeof ty === 'number' ? ty : 0,
            typeof sx === 'number' ? sx : 1,
            typeof sy === 'number' ? sy : 1
        );
    }

    IFPattern.inherit('L', IFLinearGradient, IFGradient);

    IFLinearGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof IFLinearGradient && right instanceof  IFLinearGradient) {
            return IFGradient.equals(left, right, stopsOnly);
        }
        return false;
    };

    /** @override */
    IFLinearGradient.prototype.asCSSBackground = function (opacity) {
        return 'linear-gradient(90deg, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    IFLinearGradient.prototype.toString = function () {
        return "[Object IFLinearGradient]";
    };

    _.IFLinearGradient = IFLinearGradient;
})(this);