(function (_) {
    /**
     * A linear gradient
     * @class IFLinearGradient
     * @extends IFGradient
     * @constructor
     */
    function IFLinearGradient(stops, scale, angle) {
        IFGradient.call(
            this,
            stops,
            scale
        );

        this._angle = typeof angle === 'number' ? angle : 0;
    }

    IFPattern.inherit('L', IFLinearGradient, IFGradient);

    IFLinearGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof IFLinearGradient && right instanceof  IFLinearGradient) {
            if (IFGradient.equals(left, right, stopsOnly)) {
                if (!stopsOnly) {
                    return IFMath.isEqualEps(left._angle, right._angle);
                }
            }
            return false;
        }
        return false;
    };

    /**
     * Gradient angle in radians
     * @type {number}
     * @private
     */
    IFLinearGradient._angle = 0;

    /**
     * Return the gradient's angle in radians
     * @returns {IFLinearGradient}
     */
    IFLinearGradient.prototype.getAngle = function () {
        return this._angle;
    };

    /** @override */
    IFLinearGradient.prototype.asCSSBackground = function (opacity) {
        var angleDeg = Math.round(IFMath.toDegrees(this._angle)) + 90;
        return 'linear-gradient(' + angleDeg + 'deg, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    IFLinearGradient.prototype.clone = function () {
        return new IFLinearGradient(this._stops);
    };

    /** @override */
    IFLinearGradient.prototype._serializeToBlob = function () {
        var blob = IFGradient.prototype._serializeToBlob.call(this);

        if (blob && !IFMath.isEqualEps(this._angle, 0)) {
            blob.r = this._angle;
        }

        return blob;
    };

    /**
     * @param {{*}} blob
     * @private
     */
    IFLinearGradient.prototype._deserializeFromBlob = function (blob) {
        IFGradient.prototype._deserializeFromBlob.call(this, blob);
        this._angle = blob.hasOwnProperty('r') ? blob.r : 0;
    };

    /** @override */
    IFLinearGradient.prototype.toString = function () {
        return "[Object IFLinearGradient]";
    };

    _.IFLinearGradient = IFLinearGradient;
})(this);