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
     * This will create a paint pattern and return it
     * @param {IFPaintCanvas} canvas the canvas used for creating the pattern
     * @return {*} a paint pattern or null for none
     * @private
     */
    IFAreaPaint.prototype._createPaintPattern = function (canvas) {
        if (this.$pat) {
            if (this.$pat instanceof IFColor) {
                return this.$pat;
            } else if (this.$pat instanceof IFGradient) {
                var gradient = null;

                if (this.$pat.getType() === IFGradient.Type.Linear) {
                    return canvas.createLinearGradient(-0.5, 0, 0.5, 0, this.$pat);
                } else if (this.$pat.getType() === IFGradient.Type.Radial) {
                    return canvas.createRadialGradient(0, 0, 0.5, this.$pat);
                }
            }
        }

        return null;
    };

    /**
     * Returns the transformation for painting the pattern
     * @param {IFRect} bbox the bounding box to be used
     * @returns {IFTransform} null for no transform or a valid transformation
     * @private
     */
    IFAreaPaint.prototype._getPaintPatternTransform = function (bbox) {
        if (this.$pat) {
            if (this.$pat instanceof IFGradient) {
                    var left = bbox.getX();
                    var top = bbox.getY();
                    var width = bbox.getWidth();
                    var height = bbox.getHeight();

                    var sx = this.$sx * width;
                    var sy = this.$sy * height;
                    var tx = left + this.$tx * width;
                    var ty = top + this.$ty * height;

                    return new IFTransform()
                        .scaled(sx, sy)
                        .rotated(this.$rt)
                        .translated(tx, ty);
            }
        }

        return null;
    };

    /** @override */
    IFAreaPaint.prototype.toString = function () {
        return "[IFAreaPaint]";
    };

    _.IFAreaPaint = IFAreaPaint;
})(this);