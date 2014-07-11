(function (_) {
    /**
     * A swatch keeping colors, gradients, etc.
     * @class IFSwatch
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFSwatch() {
        IFNode.call(this);
        this._setDefaultProperties(IFSwatch.VisualProperties, IFSwatch.MetaProperties);
    }
    IFNode.inheritAndMix('swatch', IFSwatch, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * @enum
     */
    IFSwatch.SwatchType = {
        Color: 'C',
        Gradient: 'G'
    };

    /**
     * Visual properties
     */
    IFSwatch.VisualProperties = {
        // The value of the swatch, be it a color, a gradient, pattern, etc.
        val: null
    };

    /**
     * Meta properties
     */
    IFSwatch.MetaProperties = {
        name: null
    };

    /**
     * @returns {IFSwatch.SwatchType}
     */
    IFSwatch.prototype.getType = function () {
        if (this.$val) {
            if (this.$val instanceof IFColor) {
                return IFSwatch.SwatchType.Color;
            } else if (this.$val instanceof IFGradient) {
                return IFSwatch.SwatchType.Gradient;
            }
        }
        return null;
    };

    /** @override */
    IFSwatch.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
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
            this.storeProperties(blob, IFSwatch.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFSwatch.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
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
            this.restoreProperties(blob, IFSwatch.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFSwatch.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene.SwatchCollection;
    };

    _.IFSwatch = IFSwatch;
})(this);