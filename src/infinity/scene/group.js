(function (_) {
    /**
     * The base for a paintable group
     * @class GXGroup
     * @extends GXElement
     * @mixes GXNode.Container
     * @constructor
     * @version 1.0
     */
    function GXGroup() {
    }

    GObject.inheritAndMix(GXGroup, GXElement, [GXNode.Container]);

    _.GXGroup = GXGroup;
})(this);