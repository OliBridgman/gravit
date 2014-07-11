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
        // Pattern (IFPattern)
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
                        return IFPattern.asString(value);
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
                        return IFPattern.parseString(value);
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