(function (_) {
    /**
     * The base for shapes, layers, pages, etc. that may also have styles
     * that can actually be inherited
     * @class GXItem
     * @extends GXElement
     * @mixes GXElement.Style
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @constructor
     */
    function GXItem() {
        GXElement.call(this);
        this._setDefaultProperties(GXItem.VisualProperties, GXItem.MetaProperties);
    }
    GObject.inheritAndMix(GXItem, GXElement, [GXElement.Style, GXNode.Properties, GXNode.Store]);

    /**
     * The visual properties of an item with their default values
     */
    GXItem.VisualProperties = {
        visible: true
    };

    /**
     * The meta properties of an item with their default values
     */
    GXItem.MetaProperties = {
        name: null,
        locked: false
    };

    /** @override */
    GXItem.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXItem.VisualProperties);
            this.storeProperties(blob, GXItem.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXItem.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXItem.VisualProperties);
            this.restoreProperties(blob, GXItem.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXItem.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;

            // React on various known property changes
            if (propertyArgs.properties.indexOf('visible') >= 0) {
                var isVisible = this.getProperty('visible');

                // Save our old paint bbox if we're getting hidden
                var oldPaintBBox = !isVisible ? this.getPaintBBox() : null;

                // Change hidden flag of this and all elemental children and invalidate their geometry
                this.accept(function (node) {
                    if (node instanceof GXElement) {
                        if (isVisible) {
                            node.removeFlag(GXElement.Flag.Hidden);
                        } else {
                            node.setFlag(GXElement.Flag.Hidden);
                        }
                        node._invalidateGeometry();
                    }
                });

                // Deliver child geometry update to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(GXElement._Change.ChildGeometryUpdate, this);
                }

                // Request a repaint of either old paint bbox if getting hidden or from
                // the current paint bbox if getting visible
                if (isVisible) {
                    this._handleChange(GXElement._Change.InvalidationRequest);
                } else {
                    this._requestInvalidationArea(oldPaintBBox);
                }
            } else if (propertyArgs.properties.indexOf('locked') >= 0) {
                var isLocked = this.getProperty('locked');

                // Change locked flag of this and all elemental children
                this.accept(function (node) {
                    if (node instanceof GXElement) {
                        if (isLocked) {
                            node.removeFlag(GXElement.Flag.Locked);
                        } else {
                            node.setFlag(GXElement.Flag.Locked);
                        }
                    }
                });
            }

            // Call super and be done with it
            GXElement.prototype._handleChange.call(this, change, args);
        } else {
            // Call super by default and be done with it
            GXElement.prototype._handleChange.call(this, change, args);
        }
    };

    _.GXItem = GXItem;
})(this);