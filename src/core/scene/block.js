(function (_) {
    /**
     * A block element that supports properties and storage
     * @class GBlock
     * @extends GElement
     * @mixes GNode.Properties
     * @mixes GNode.Store
     * @constructor
     */
    function GBlock() {
        GElement.call(this);
        this._setDefaultProperties(GBlock.VisualProperties, GBlock.MetaProperties);
    }

    GObject.inheritAndMix(GBlock, GElement, [GNode.Properties, GNode.Store]);

    /**
     * The visual properties of a block with their default values
     */
    GBlock.VisualProperties = {
        visible: true
    };

    /**
     * The meta properties of a block with their default values
     */
    GBlock.MetaProperties = {
        name: null,
        locked: false
    };

    /** @override */
    GBlock.prototype.assignFrom = function (other) {
        GElement.prototype.assignFrom.call(this, other);

        if (other instanceof GBlock) {
            this.transferProperties(other, [GBlock.VisualProperties, GBlock.MetaProperties]);
        }
    };

    /**
     * Returns the label of the block which is either the name
     * of the block if it has one or the name of the block's type
     * @return {String}
     */
    GBlock.prototype.getLabel = function () {
        if (this.$name && this.$name !== "") {
            return this.$name;
        }
        return this.getNodeNameTranslated();
    };

    /**
     * Returns the owner layer of this block if any
     * @return {GLayer}
     */
    GBlock.prototype.getOwnerLayer = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GLayer) {
                return p;
            }
        }
        return null;
    };

    /**
     * Returns the root layer of this block if any
     * @return {GLayer}
     */
    GBlock.prototype.getRootLayer = function () {
        var lastLayer = null;
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GLayer) {
                lastLayer = p;
            }
        }
        return lastLayer;
    };

    /**
     * Returns the owner page of this block if any
     * @return {GPage}
     */
    GBlock.prototype.getPage = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GPage) {
                return p;
            }
        }
        return null;
    };

    /** @override */
    GBlock.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GBlock.VisualProperties);
            this.storeProperties(args, GBlock.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GBlock.VisualProperties);
            this.restoreProperties(args, GBlock.MetaProperties);
        } else if (change == GNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;

            // React on various known property changes
            if (propertyArgs.properties.indexOf('visible') >= 0) {
                var isVisible = this.getProperty('visible');

                // Save our old paint bbox if we're getting hidden
                var oldPaintBBox = !isVisible ? this.getPaintBBox() : null;

                // Change hidden flag of this and all elemental children
                this.accept(function (node) {
                    if (node instanceof GElement) {
                        if (isVisible) {
                            node.removeFlag(GElement.Flag.Hidden);
                        } else {
                            node.setFlag(GElement.Flag.Hidden);
                        }
                        node._requestInvalidation();
                    }
                });

                // Deliver child geometry update to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(GElement._Change.ChildGeometryUpdate, this);
                }

                // Request a repaint of either old paint bbox if getting hidden or from
                // the current paint bbox if getting visible
                if (isVisible) {
                    this._handleChange(GElement._Change.InvalidationRequest);
                } else {
                    this._requestInvalidationArea(oldPaintBBox);
                }
            } else if (propertyArgs.properties.indexOf('locked') >= 0) {
                var isLocked = this.getProperty('locked');

                // Change locked flag of this and all elemental children
                this.accept(function (node) {
                    if (node instanceof GElement) {
                        if (isLocked) {
                            node.setFlag(GElement.Flag.Locked);
                        } else {
                            node.removeFlag(GElement.Flag.Locked);
                        }
                    }
                });
            }
        }
        GElement.prototype._handleChange.call(this, change, args);
    };

    _.GBlock = GBlock;
})(this);