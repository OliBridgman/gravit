(function (_) {
    /**
     * The base for a groups
     * @class GXGroup
     * @extends GXItem
     * @mixes GXNode.Container
     * @mixes GXElement.Transform
     * @constructor
     */
    function GXGroup() {
        GXItem.call(this);
    }
    GXNode.inheritAndMix('group', GXGroup, GXItem, [GXNode.Container, GXElement.Transform]);

    /** @override */
    GXGroup.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXBlock;
    };

    _.GXGroup = GXGroup;
})(this);