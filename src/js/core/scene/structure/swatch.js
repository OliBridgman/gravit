(function (_) {
    /**
     * A swatch keeping colors, gradients, etc.
     * @class GSwatch
     * @extends GNode
     * @mixes GNode.Store
     * @mixes GNode.Properties
     * @constructor
     */
    function GSwatch() {
        GNode.call(this);
        this._setDefaultProperties(GSwatch.VisualProperties, GSwatch.MetaProperties);
    }

    GNode.inheritAndMix('swatch', GSwatch, GNode, [GNode.Store, GNode.Properties]);

    /**
     * Visual properties
     */
    GSwatch.VisualProperties = {
        // The pattern of the swatch (GPattern)
        pat: null
    };

    /**
     * Meta properties
     */
    GSwatch.MetaProperties = {
        name: null
    };

    /** @override */
    GSwatch.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GScene.SwatchCollection;
    };

    /** @override */
    GSwatch.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.serialize(value);
                    }
                }
                return value;
            });
            this.storeProperties(args, GSwatch.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GSwatch.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.deserialize(value);
                    }
                }
            });
            this.restoreProperties(args, GSwatch.MetaProperties);
        }

        GNode.prototype._handleChange.call(this, change, args);
    };

    _.GSwatch = GSwatch;
})(this);