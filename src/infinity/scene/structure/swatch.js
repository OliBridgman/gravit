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
     * Visual properties
     */
    IFSwatch.VisualProperties = {
        // The pattern of the swatch (IFPattern)
        pat: null
    };

    /**
     * Meta properties
     */
    IFSwatch.MetaProperties = {
        name: null
    };

    /** @override */
    IFSwatch.prototype.getPatternType = function () {
        return this.$pat ? this.$pat.getPatternType() : null;
    };

    /** @override */
    IFSwatch.prototype.getPattern = function () {
        return this.$pat;
    };

    /**
     * @returns {IFPattern.Type}
     */
    IFSwatch.prototype.getPatternType = function () {
        return this.$pat ? this.$pat.getPatternType() : null;
    };

    /**
     * Returns a css3 background definition for the swatch
     * @param {Number} width background width
     * @param {Number} height background height
     * @return {*} css object
     */
    IFSwatch.prototype.asCSSBackgroundString = function (width, height) {
        var type = this.getPatternType();
        if (type) {
            switch (type) {
                case IFPattern.Type.Color:
                    return IFColor.blendedCSSBackground(this.$pat, (width + height) / 2);
                case IFPattern.Type.Gradient:
                    return {
                        'background': this.$pat.asCSSBackgroundString()
                    }
            }
        }
        return null;
    };

    /** @override */
    IFSwatch.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.asString(value);
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
                    if (property === 'pat') {
                        return IFPattern.parseString(value);
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