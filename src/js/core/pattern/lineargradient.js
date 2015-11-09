(function (_) {
    /**
     * A linear gradient
     * @class GLinearGradient
     * @extends GGradient
     * @constructor
     */
    function GLinearGradient(stops, scale, angle) {
        GGradient.call(
            this,
            stops,
            scale
        );

        this._angle = typeof angle === 'number' ? angle : 0;
    }

    GPattern.inherit('L', GLinearGradient, GGradient);

    GLinearGradient.equals = function (left, right, stopsOnly) {
        if (left instanceof GLinearGradient && right instanceof  GLinearGradient) {
            if (GGradient.equals(left, right, stopsOnly)) {
                if (!stopsOnly) {
                    return GMath.isEqualEps(left._angle, right._angle);
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
    GLinearGradient._angle = 0;

    /**
     * Return the gradient's angle in radians
     * @returns {GLinearGradient}
     */
    GLinearGradient.prototype.getAngle = function () {
        return this._angle;
    };

    /** @override */
    GLinearGradient.prototype.asCSSBackground = function (opacity) {
        var angleDeg = Math.round(GMath.toDegrees(this._angle)) + 90;
        return 'linear-gradient(' + angleDeg + 'deg, ' + this.toScreenCSS(opacity) + ')';
    };

    /** @override */
    GLinearGradient.prototype.clone = function () {
        return new GLinearGradient(this._stops);
    };

    /** @override */
    GLinearGradient.prototype._serializeToBlob = function () {
        var blob = GGradient.prototype._serializeToBlob.call(this);

        if (blob && !GMath.isEqualEps(this._angle, 0)) {
            blob.r = this._angle;
        }

        return blob;
    };

    /**
     * @param {{*}} blob
     * @private
     */
    GLinearGradient.prototype._deserializeFromBlob = function (blob) {
        GGradient.prototype._deserializeFromBlob.call(this, blob);
        this._angle = blob.hasOwnProperty('r') ? blob.r : 0;
    };

    /** @override */
    GLinearGradient.prototype.toString = function () {
        return "[Object GLinearGradient]";
    };

    _.GLinearGradient = GLinearGradient;
})(this);