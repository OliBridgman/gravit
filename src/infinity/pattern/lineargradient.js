(function (_) {
    /**
     * A linear gradient
     * @class IFLinearGradient
     * @extends IFGradient
     * @constructor
     */
    function IFLinearGradient(stops, scale, rotation) {
        IFGradient.call(
            this,
            stops,
            scale
        );

        this._rotation = typeof rotation === 'number' ? rotation : 0;
    }

    IFPattern.inherit('L', IFLinearGradient, IFGradient);

    IFLinearGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof IFLinearGradient && right instanceof  IFLinearGradient) {
            if (IFGradient.equals(left, right, stopsOnly)) {
                if (!stopsOnly) {
                    return IFMath.isEqualEps(left._rotation, right._rotation);
                }
            }
            return false;
        }
        return false;
    };

    /**
     * Gradient rotation in radians
     * @type {number}
     * @private
     */
    IFLinearGradient._rotation = 0;

    /**
     * Return the gradient's rotation in degrees
     * @returns {IFLinearGradient}
     */
    IFLinearGradient.prototype.getRotation = function () {
        return this._rotation;
    };

    /** @override */
    IFLinearGradient.prototype.asCSSBackground = function (opacity) {
        var rotDeg = Math.round(IFMath.toDegrees(this._rotation)) + 90;
        return 'linear-gradient(' + rotDeg + 'deg, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    IFLinearGradient.prototype.clone = function () {
        return new IFLinearGradient(this._stops);
    };

    /** @override */
    IFLinearGradient.prototype._serializeToBlob = function () {
        var blob = IFGradient.prototype._serializeToBlob.call(this);

        if (blob && !IFMath.isEqualEps(this._rotation, 0)) {
            blob.r = this._rotation;
        }

        return blob;
    };

    /**
     * @param {{*}} blob
     * @private
     */
    IFLinearGradient.prototype._deserializeFromBlob = function (blob) {
        IFGradient.prototype._deserializeFromBlob.call(this, blob);
        this._rotation = blob.hasOwnProperty('r') ? blob.r : 0;
    };

    /** @override */
    IFLinearGradient.prototype.toString = function () {
        return "[Object IFLinearGradient]";
    };

    _.IFLinearGradient = IFLinearGradient;
})(this);