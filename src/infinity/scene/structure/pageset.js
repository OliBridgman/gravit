(function (_) {
    /**
     * An element representing a set of pages
     * @class GXPageSet
     * @extends GXGroup
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @constructor
     */
    function GXPageSet() {
        GXGroup.call(this);
        this._setDefaultProperties(GXPageSet.MetaProperties);
    }

    GXNode.inheritAndMix("pageSet", GXPageSet, GXGroup, [GXNode.Properties, GXNode.Store]);

    /**
     * The meta properties of a page-set and their defaults
     */
    GXPageSet.MetaProperties = {
        title: null
    };

    /** @override */
    GXPageSet.prototype.validateInsertion = function (parent, reference) {
        // pageSet can only be appended to the scene and
        // only if the scene does not yet contain a pageSet
        // or to another pageSet
        return parent instanceof GXPageSet || (parent instanceof GXScene && !parent.getPageSet());
    };

    /** @override */
    GXPageSet.prototype.validateRemoval = function () {
        // A pageSet can only be removed from another pageSet
        // and not from the document which is the root
        return this._parent instanceof GXPageSet;
    };


    /** @override */
    GXPageSet.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPageSet.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPageSet.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPageSet.MetaProperties);
            return true;
        }
        return false;
    };

    _.GXPageSet = GXPageSet;
})(this);