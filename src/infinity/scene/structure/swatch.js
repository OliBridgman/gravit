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
    IFSwatch.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene.SwatchCollection;
    };

    /** @override */
    IFSwatch.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.asString(value);
                    }
                }
                return value;
            });
            this.storeProperties(args, IFSwatch.MetaProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.parsePattern(value);
                    }
                }
            });
            this.restoreProperties(args, IFSwatch.MetaProperties);
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    _.IFSwatch = IFSwatch;
})(this);