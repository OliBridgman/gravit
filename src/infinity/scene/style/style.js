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
        // Whether the style is visible or not
        vs: true,
        // The composite of the style
        cmp: IFPaintCanvas.CompositeOperator.SourceOver,
        // The opacity of the style
        opc: 1.0
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFStyle.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on a style
     * @param {IFStyleEntry} entry the style entry that had been hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class IFStyle.HitResult
     */
    IFStyle.HitResult = function (entry, args) {
        this.entry = entry;
        this.data = args;
    };

    /**
     * The style entry that had been hit
     * @type {IFStyleEntry}
     */
    IFStyle.HitResult.prototype.entry = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    IFStyle.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFStyle Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns the bounding box of the style
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    IFStyle.prototype.getBBox = function (source) {
        var vEffectPadding = [0, 0, 0, 0];
        var filterPadding = [0, 0, 0, 0];
        var effectPadding = [0, 0, 0, 0];
        var paintPadding = [0, 0, 0, 0];

        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFStyleEntry) {
                var padding = child.getPadding();
                if (padding) {
                    if (child instanceof IFVEffectEntry) {
                        // vEffects are additive
                        vEffectPadding = [
                            vEffectPadding[0] + padding[0],
                            vEffectPadding[1] + padding[1],
                            vEffectPadding[2] + padding[2],
                            vEffectPadding[3] + padding[3]
                        ];
                    } else if (child instanceof IFFilterEntry) {
                        // filters always sum up
                        filterPadding = [
                            filterPadding[0] + Math.abs(padding[0]),
                            filterPadding[1] + Math.abs(padding[1]),
                            filterPadding[2] + Math.abs(padding[2]),
                            filterPadding[3] + Math.abs(padding[3])
                        ];
                    } else if (child instanceof IFEffectEntry) {
                        // effects approximate the largest
                        effectPadding = [
                            Math.max(effectPadding[0], padding[0]),
                            Math.max(effectPadding[1], padding[1]),
                            Math.max(effectPadding[2], padding[2]),
                            Math.max(effectPadding[3], padding[3])
                        ];
                    } else if (child instanceof IFPaintEntry) {
                        // paints approximate the largest
                        paintPadding = [
                            Math.max(paintPadding[0], padding[0]),
                            Math.max(paintPadding[1], padding[1]),
                            Math.max(paintPadding[2], padding[2]),
                            Math.max(paintPadding[3], padding[3])
                        ];
                    } else {
                        throw new Error('Unknown entry with padding.');
                    }
                }
            }
        }

        return source.expanded(
            vEffectPadding[0] + paintPadding[0] + filterPadding[0] + effectPadding[0],
            vEffectPadding[1] + paintPadding[1] + filterPadding[1] + effectPadding[1],
            vEffectPadding[2] + paintPadding[2] + filterPadding[2] + effectPadding[2],
            vEffectPadding[3] + paintPadding[3] + filterPadding[3] + effectPadding[3]
        );
    };

    /**
     * Creates a vertex source based on a source and any potential
     * vector effects within this style
     * @param {IFVertexSource} source
     * @return {IFVertexSource}
     */
    IFStyle.prototype.createVertexSource = function (source) {
        for (var entry = this.getFirstChild(); entry !== null; entry = entry.getNext()) {
            if (entry instanceof IFVEffectEntry) {
                source = entry.createEffect(source);
            }
        }
        return source;
    };

    /**
     * Called whenever a hit-test should be made on this style. Only
     * paint style entries can be hit. Note that if there're any vector
     * effects in this style, they're applied to the source before hit-
     * testing takes place. Goes from top-to-bottom.
     * @parma {IFVertexSource} source the vertice source
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance value for hit testing in view coordinates
     * @returns {IFStyle.HitResult} the hit result or null for none
     */
    IFStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        // Make sure to get a transformed / effected source
        source = this.createVertexSource(source);

        // Hit test our children now
        for (var entry = this.getLastChild(); entry !== null; entry = entry.getPrevious()) {
            if (entry instanceof IFPaintEntry) {
                var result = entry.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
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