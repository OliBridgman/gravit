(function (_) {

    /**
     * A base for pattern painting
     * @class IFPatternPaint
     * @extends IFPaintEntry
     * @constructor
     */
    function IFPatternPaint() {
        IFPaintEntry.call(this);
        this._setDefaultProperties(IFPatternPaint.VisualProperties);
    }

    IFObject.inherit(IFPatternPaint, IFPaintEntry);

    /**
     * Visual properties
     */
    IFPatternPaint.VisualProperties = {
        // Pattern (IFColor, IFGradient, ...)
        pat: IFColor.BLACK,
        // Pattern transformation (GTransform)
        trf: null,
        // The blend mode of the paint
        blm: IFPaintCanvas.BlendMode.Normal,
        // The opacity of the style
        opc: 1.0
    };

    /** @override */
    IFPatternPaint.prototype.store = function (blob) {
        if (IFPaintEntry.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStrokePaint.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        if (value instanceof IFColor) {
                            return 'c' + value.asString();
                        } else if (value instanceof IFGradient) {
                            return 'g' + value.asString();
                        } else {
                            // TODO
                            throw new Error('Unsupported.');
                        }
                    } else if (property === 'trf') {
                        return GTransform.serialize(value);
                    }
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFPatternPaint.prototype.restore = function (blob) {
        if (IFPaintEntry.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStrokePaint.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        if (value.charAt(0) === 'c') {
                            return IFColor.parseColor(value);
                        } else if (value.charAt(0) === 'g') {
                            return IFGradient.parseGradient(value);
                        } else {
                            // TODO
                            throw new Error('Unsupported.');
                        }
                    } else if (property === 'trf') {
                        return GTransform.deserialize(value);
                    }
                }
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFPatternPaint.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, IFPatternPaint.VisualProperties);
        IFPaintEntry.prototype._handleChange.call(this, change, args);
    };

    /**
     * Creates and returns a paintable pattern
     * @param {IFPaintCanvas} canvas the canvas used for creating the pattern
     * @param {GRect} bbox the bounding box to be used
     * @return {*} a canvas-specific fill pattern or null if
     * there's no fill available
     * @private
     */
    IFPatternPaint.prototype._createPaintPattern = function (canvas, bbox) {
        if (this.$pat) {
            if (this.$pat instanceof IFColor) {
                return this.$pat;
            } else if (this.$pat instanceof IFGradient) {
                var x1 = bbox.getX();
                var y1 = bbox.getY();
                var x2 = x1 + bbox.getWidth();
                var y2 = y1;// + bbox.getHeight();
                return ccanvas.createLinearGradient(x1, y1, x2, y2, this.$pat);
            } else {
                throw new Error('Unsupported.');
            }
        }
        return null;
    };

    /** @override */
    IFPatternPaint.prototype.toString = function () {
        return "[IFPatternPaint]";
    };

    _.IFPatternPaint = IFPatternPaint;
})(this);