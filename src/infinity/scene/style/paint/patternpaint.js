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
     * @enum
     */
    IFPatternPaint.PatternType = {
        Color: 'C',
        Gradient: 'G',
        Texture: 'T',
        Noise: 'N'
    };

    IFPatternPaint.getTypeOf = function (pattern) {
        if (pattern) {
            if (pattern instanceof IFColor) {
                return IFPatternPaint.PatternType.Color;
            } else if (pattern instanceof IFGradient) {
                return IFPatternPaint.PatternType.Gradient;
            }
        // TODO :
        //} else if (pattern instanceof IFTexture) {
        //    return IFPatternPaint.PatternType.Texture;
        //} else if (pattern instanceof IFNoise) {
        //    return IFPatternPaint.PatternType.Noise;
        //}
        }

        return null;
    };

    /**
     * Visual properties
     */
    IFPatternPaint.VisualProperties = {
        // Pattern (IFColor, IFGradient, IFTexture, IFNoise ...)
        pat: IFColor.BLACK,
        // The horizontal translation of the pattern in % (0..1.0)
        tx: 0,
        // The horizontal translation of the pattern in % (0..1.0)
        ty: 0,
        // The horizontal scalation of the pattern in % (0..1.0)
        sx: 1,
        // The vertical scalation of the pattern in % (0..1.0)
        sy: 1,
        // The rotation of the pattern in radians
        rt: 0,
        // The blend mode of the paint
        blm: IFPaintCanvas.BlendMode.Normal,
        // The opacity of the style
        opc: 1.0
    };

    /** @override */
    IFPatternPaint.prototype.getPaintCmpOrBlend = function () {
        return this.$blm;
    };

    /** @override */
    IFPatternPaint.prototype.getPaintOpacity = function () {
        return this.$opc;
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
                return canvas.createLinearGradient(x1, y1, x2, y2, this.$pat);
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