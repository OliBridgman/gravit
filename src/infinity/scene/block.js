(function (_) {
    /**
     * A block element that support styles, properties and storage
     * @class GXBlock
     * @extends GXElement
     * @mixes GXElement.Style
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @constructor
     */
    function GXBlock() {
        GXElement.call(this);
        this._setDefaultProperties(GXBlock.VisualProperties, GXBlock.MetaProperties);
    }
    GObject.inheritAndMix(GXBlock, GXElement, [GXElement.Style, GXNode.Properties, GXNode.Store]);

    /**
     * The visual properties of a block with their default values
     */
    GXBlock.VisualProperties = {
        visible: true
    };

    /**
     * The meta properties of a block with their default values
     */
    GXBlock.MetaProperties = {
        name: null,
        locked: false
    };

    /**
     * Returns the label of the block which is either the name
     * of the block if it has one or the name of the block's type
     * @return {String}
     */
    GXBlock.prototype.getLabel = function () {
        if (this.$name && this.$name !== "") {
            return this.$name;
        }
        return this.getNodeNameTranslated();
    };

    /** @override */
    GXBlock.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXBlock.VisualProperties);
            this.storeProperties(blob, GXBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXBlock.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXBlock.VisualProperties);
            this.restoreProperties(blob, GXBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXBlock.prototype._handleChange = function (change, args) {
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

    _.GXBlock = GXBlock;
})(this);