(function (_) {

    /**
     * A base style class
     * @class IFStyle
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @mixes IFNode.Container
     * @constructor
     */
    function IFStyle() {
        this._setDefaultProperties(IFStyle.VisualProperties);
    }

    IFObject.inheritAndMix(IFStyle, IFNode, [IFNode.Store, IFNode.Properties, IFNode.Container]);

    /**
     * Style's mime-type
     * @type {string}
     */
    IFStyle.MIME_TYPE = "application/infinity+style";

    /**
     * Visual properties
     */
    IFStyle.VisualProperties = {
        // The composite of the style
        cmp: IFPaintCanvas.CompositeOperator.SourceOver,
        // The opacity of the style
        opc: 1.0
    };

    /**
     * Returns the bounding box of the style
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    IFStyle.prototype.getBBox = function (source) {
        var stylePadding = [0, 0, 0, 0];

        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFStyleEntry) {
                var padding = child.getPadding();
                if (padding) {
                    stylePadding = [
                        Math.max(padding[0], stylePadding[0]),
                        Math.max(padding[1], stylePadding[1]),
                        Math.max(padding[2], stylePadding[2]),
                        Math.max(padding[3], stylePadding[3])
                    ]
                }
            }
        }

        return source.expanded(stylePadding[0], stylePadding[1], stylePadding[2], stylePadding[3]);
    };

    /** @override */
    IFStyle.prototype.validateInsertion = function (parent, reference) {
        // By default, styles can only be appended to stylesets
        return parent instanceof IFStyleSet;
    };

    /** @override */
    IFStyle.prototype.toString = function () {
        return "[IFStyle]";
    };

    _.IFStyle = IFStyle;
})(this);