(function (_) {

    /**
     * A base style entry class
     * @class IFStyleEntry
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyleEntry() {
        IFNode.call(this);
        this._setDefaultProperties(IFStyleEntry.GeometryProperties);
    }

    IFObject.inheritAndMix(IFStyleEntry, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Visual properties
     */
    IFStyleEntry.GeometryProperties = {
        // Whether the node is visible or not
        vs: true
    };

    /** @override */
    IFStyleEntry.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStyleEntry.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStyleEntry.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStyleEntry.GeometryProperties);
            return true;
        }
        return false;
    };

    /**
     * If the style extends the paint area it should
     * return the padding extensions here: [left, top, right, bottom]
     * @returns {Array<Number>}
     */
    IFStyleEntry.prototype.getPadding = function () {
        return null;
    };

    /** @override */
    IFStyleEntry.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFStyle;
    };

    /** @override */
    IFStyleEntry.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFStyleEntry.GeometryProperties);
        IFNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * This will fire a change event for geometry updates on the owner style
     * whenever a given property has been changed that affected the geometry.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * geometrical changes
     * @return {Boolean} true if there was a property change that affected a
     * change of the geometry and was handled (false i.e. for no owner element)
     * @private
     */
    IFStyleEntry.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.BeforePropertiesChange || change == IFNode._Change.AfterPropertiesChange) {
            var style = this.getOwnerStyle();
            if (style) {
                if (ifUtil.containsObjectKey(args.properties, properties)) {
                    switch (change) {
                        case IFNode._Change.BeforePropertiesChange:
                            style.prepareGeometryChange();
                            break;
                        case IFNode._Change.AfterPropertiesChange:
                            style.finishGeometryChange();
                            break;
                    }
                    return true;
                }
            }
            return false;
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates on the owner style
     * whenever a given property has been changed that affected the visual.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * visual changes
     * @return {Boolean} true if there was a property change that affected a
     * visual change and was handled (false i.e. for no owner element)
     * @private
     */
    IFStyleEntry.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.AfterPropertiesChange) {
            var style = this.getOwnerStyle();
            if (style) {
                if (ifUtil.containsObjectKey(args.properties, properties)) {
                    style.visualChange();
                    return true;
                }
            }
            return false;
        }
        return false;
    };

    /**
     * Returns the owner style if any or null
     * @returns {IFStyle}
     */
    IFStyleEntry.prototype.getOwnerStyle = function () {
        var parent = this.getParent();
        return parent && parent instanceof IFStyle ? parent : null;
    };

    /** @override */
    IFStyleEntry.prototype.toString = function () {
        return "[IFStyleEntry]";
    };

    _.IFStyleEntry = IFStyleEntry;
})(this);