(function (_) {

    /**
     * A base for area pattern painting like fill & stroke
     * @class IFAreaPaint
     * @extends IFPatternPaint
     * @constructor
     */
    function IFAreaPaint() {
        IFPatternPaint.call(this);
        this._setDefaultProperties(IFAreaPaint.VisualProperties);
    }

    IFObject.inherit(IFAreaPaint, IFPatternPaint);

    /**
     * Visual properties
     */
    IFAreaPaint.VisualProperties = {
        // The horizontal translation of the pattern in % (0..1.0)
        tx: 0,
        // The horizontal translation of the pattern in % (0..1.0)
        ty: 0,
        // The horizontal scalation of the pattern in % (0..1.0)
        sx: 1,
        // The vertical scalation of the pattern in % (0..1.0)
        sy: 1,
        // The rotation of the pattern in radians
        rt: 0
    };

    /** @override */
    IFAreaPaint.prototype.store = function (blob) {
        if (IFPatternPaint.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFAreaPaint.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAreaPaint.prototype.restore = function (blob) {
        if (IFPatternPaint.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFAreaPaint.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAreaPaint.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, IFAreaPaint.VisualProperties);
        IFPatternPaint.prototype._handleChange.call(this, change, args);
    };

    /**
     * @param {GRect} bbox
     * @return {GTransform}
     * @private
     */
    IFAreaPaint.prototype._getPatternTransform = function (bbox) {
        var width = bbox.getWidth();
        var height = bbox.getHeight();

        return new GTransform()
            .scaled(this.$sx, this.$sy)
            .rotated(this.$rt)
            .translated(bbox.getX(), bbox.getY())
            .translated(this.$tx * width, this.$ty * height);
    };

    /** @override */
    IFAreaPaint.prototype.toString = function () {
        return "[IFAreaPaint]";
    };

    _.IFAreaPaint = IFAreaPaint;
})(this);