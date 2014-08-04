(function (_) {
    /**
     * A block element that supports properties and storage
     * @class IFBlock
     * @extends IFElement
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @constructor
     */
    function IFBlock() {
        IFElement.call(this);
        this._setDefaultProperties(IFBlock.VisualProperties, IFBlock.MetaProperties);
    }

    IFObject.inheritAndMix(IFBlock, IFElement, [IFNode.Properties, IFNode.Store]);

    /**
     * The visual properties of a block with their default values
     */
    IFBlock.VisualProperties = {
        visible: true
    };

    /**
     * The meta properties of a block with their default values
     */
    IFBlock.MetaProperties = {
        name: null,
        locked: false
    };

    /**
     * The containting owner layer
     * @type {IFLayer}
     * @private
     */
    IFBlock.prototype._ownerLayer = null;

    /**
     * The containting root layer
     * @type {IFLayer}
     * @private
     */
    IFBlock.prototype._rootLayer = null;

    /**
     * The containting page
     * @type {IFPage}
     * @private
     */
    IFBlock.prototype._page = null;

    /**
     * Returns the label of the block which is either the name
     * of the block if it has one or the name of the block's type
     * @return {String}
     */
    IFBlock.prototype.getLabel = function () {
        if (this.$name && this.$name !== "") {
            return this.$name;
        }
        return this.getNodeNameTranslated();
    };

    /**
     * Returns the owner layer of this block if any
     * @return {IFLayer}
     */
    IFBlock.prototype.getOwnerLayer = function () {
        return this._ownerLayer;
    };

    /**
     * Returns the root layer of this block if any
     * @return {IFLayer}
     */
    IFBlock.prototype.getRootLayer = function () {
        return this._rootLayer;
    };

    /**
     * Returns the owner page of this block if any
     * @return {IFPage}
     */
    IFBlock.prototype.getPage = function () {
        return this._page;
    };

    /** @override */
    IFBlock.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFBlock.VisualProperties);
            this.storeProperties(blob, IFBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlock.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFBlock.VisualProperties);
            this.restoreProperties(blob, IFBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlock.prototype._setParent = function (parent) {
        IFElement.prototype._setParent.call(this, parent);

        // update rootLayer, layer, page
        if (parent) {
            this._ownerLayer = parent instanceof IFLayer ? parent : parent instanceof IFBlock ? parent.getOwnerLayer() : null;
            this._rootLayer = parent instanceof IFLayer && !parent.getOwnerLayer() ? parent : parent instanceof IFBlock ? parent.getRootLayer() : null;
            this._page = parent instanceof IFPage ? parent : parent instanceof IFBlock ? parent.getPage() : null;
        } else {
            this._ownerLayer = null;
            this._rootLayer = null;
            this._page = null;
        }
    };

    /** @override */
    IFBlock.prototype._handleChange = function (change, args) {
        if (change == IFNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;

            // React on various known property changes
            if (propertyArgs.properties.indexOf('visible') >= 0) {
                var isVisible = this.getProperty('visible');

                // Save our old paint bbox if we're getting hidden
                var oldPaintBBox = !isVisible ? this.getPaintBBox() : null;

                // Change hidden flag of this and all elemental children and invalidate their geometry
                this.accept(function (node) {
                    if (node instanceof IFElement) {
                        if (isVisible) {
                            node.removeFlag(IFElement.Flag.Hidden);
                        } else {
                            node.setFlag(IFElement.Flag.Hidden);
                        }
                        node._invalidateGeometry();
                    }
                });

                // Deliver child geometry update to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(IFElement._Change.ChildGeometryUpdate, this);
                }

                // Request a repaint of either old paint bbox if getting hidden or from
                // the current paint bbox if getting visible
                if (isVisible) {
                    this._handleChange(IFElement._Change.InvalidationRequest);
                } else {
                    this._requestInvalidationArea(oldPaintBBox);
                }
            } else if (propertyArgs.properties.indexOf('locked') >= 0) {
                var isLocked = this.getProperty('locked');

                // Change locked flag of this and all elemental children
                this.accept(function (node) {
                    if (node instanceof IFElement) {
                        if (isLocked) {
                            node.setFlag(IFElement.Flag.Locked);
                        } else {
                            node.removeFlag(IFElement.Flag.Locked);
                        }
                    }
                });
            }

            // Call super and be done with it
            IFElement.prototype._handleChange.call(this, change, args);
        } else {
            // Call super by default and be done with it
            IFElement.prototype._handleChange.call(this, change, args);
        }
    };

    _.IFBlock = IFBlock;
})(this);