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
            this.storeProperties(blob, IFPatternPaint.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        if (value instanceof IFColor) {
                            return 'C' + value.asString();
                        } else if (value instanceof IFGradient) {
                            return 'G' + value.asString();
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
            this.restoreProperties(blob, IFPatternPaint.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        var type = value.charAt(0);
                        value =value .substring(1);
                        if (type === 'C') {
                            return IFColor.parseColor(value);
                        } else if (type === 'G') {
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

    /** @override */
    IFPatternPaint.prototype.toString = function () {
        return "[IFPatternPaint]";
    };

    _.IFPatternPaint = IFPatternPaint;
})(this);