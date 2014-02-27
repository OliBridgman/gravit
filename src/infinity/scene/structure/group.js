(function (_) {
    /**
     * The base for a groups
     * @class GXGroup
     * @extends GXItemCompound
     * @constructor
     */
    function GXGroup() {
        GXItemCompound.call(this);
    }
    GXNode.inherit('group', GXGroup, GXItemCompound);

    /** @override */
    GXGroup.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXItemContainer;
    };

    _.GXGroup = GXGroup;
})(this);