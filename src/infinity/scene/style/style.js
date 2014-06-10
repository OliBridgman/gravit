(function (_) {

    /**
     * Base style class
     * @class IFStyle
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyle() {
        IFNode.call(this);
    }

    IFObject.inheritAndMix(IFStyle, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Style's mime-type
     * @type {string}
     */
    IFStyle.MIME_TYPE = "application/infinity+style";

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
     * Returns the actual style. You should always use this one to act on the style
     * when reading something from it. Note that this should always return a style
     * with a container.
     * @param {IFStyle}
     */
    IFStyle.prototype.getActualStyle = function () {
        return this;
    };

    /**
     * Creates a preview image of this canvas
     * @param {Number} width the width of the preview
     * @param {Number} height the height of the preview
     * @return {String} a base64-encoded image data url with the preview
     */
    IFStyle.prototype.createPreviewImage = function (width, height) {
        // Create a temporary rectangle shape for preview painting
        var previewRect = new IFRectangle();
        previewRect.setProperty('trf', new GTransform(width / 2, 0, 0, height / 2, width / 2, height / 2));

        // Setup canvas and context for painting
        var canvas = new IFPaintCanvas();
        canvas.resize(width, height);
        canvas.prepare(null);
        var context = new IFPaintContext();
        context.canvas = canvas;
        context.configuration = new IFScenePaintConfiguration();

        // Calculate real bounding box
        var bbox = this.getBBox(new GRect(0, 0, width, height));

        // Transform canvas to fit bounding box exactly
        var bboxCenter = bbox.getSide(GRect.Side.CENTER);
        var realCenter = new GPoint(width / 2, height / 2);
        var scaleX = 1.0 / (bbox.getWidth() / width);
        var scaleY = 1.0 / (bbox.getHeight() / height);
        var matrix = new GTransform()
            .translated(-bboxCenter.getX(), -bboxCenter.getY())
            .scaled(scaleX, scaleY)
            .translated(realCenter.getX(), realCenter.getY())
            .getMatrix();

        canvas.setOrigin(new GPoint(-matrix[4], -matrix[5]));
        canvas.setScale(scaleX);

        // Paint rectangle with this style
        previewRect.renderStyle(context, this);

        canvas.finish();
        return canvas.asPNGImage();
    };

    /**
     * Returns the bounding box of the style. This includes only
     * visible style entries
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    IFStyle.prototype.getBBox = function (source) {
        var vEffectPadding = [0, 0, 0, 0];
        var filterPadding = [0, 0, 0, 0];
        var effectPadding = [0, 0, 0, 0];
        var paintPadding = [0, 0, 0, 0];

        for (var child = this.getActualStyle().getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFStyleEntry && child.getProperty('vs') === true) {
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
     * (visible) vector effects within this style
     * @param {IFVertexSource} source
     * @return {IFVertexSource}
     */
    IFStyle.prototype.createVertexSource = function (source) {
        for (var entry = this.getActualStyle().getFirstChild(); entry !== null; entry = entry.getNext()) {
            if (entry instanceof IFVEffectEntry && entry.getProperty('vs') === true) {
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
        for (var entry = this.getActualStyle().getLastChild(); entry !== null; entry = entry.getPrevious()) {
            if (entry instanceof IFPaintEntry && entry.getProperty('vs') === true) {
                var result = entry.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    /**
     * Called to prepare this style for a geometrical change
     */
    IFStyle.prototype.prepareGeometryChange = function () {
        // NO-OP
    };

    /**
     * Called to finish this style from a geometrical change
     */
    IFStyle.prototype.finishGeometryChange = function () {
        // NO-OP
    };

    /**
     * Called to trigger a visual change on this style
     */
    IFStyle.prototype.visualChange = function () {
        // NO-OP
    };

    /** @override */
    IFStyle.prototype.validateInsertion = function (parent, reference) {
        // By default, styles can only be appended to stylesets
        return parent instanceof IFStyleSet;
    };


    /**
     * This will fire a change event for geometry updates on this style
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
    IFStyle.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.BeforePropertiesChange || change == IFNode._Change.AfterPropertiesChange) {
            if (gUtil.containsObjectKey(args.properties, properties)) {
                switch (change) {
                    case IFNode._Change.BeforePropertiesChange:
                        this.prepareGeometryChange();
                        break;
                    case IFNode._Change.AfterPropertiesChange:
                        this.finishGeometryChange();
                        break;
                }
                return true;
            }
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates on this style
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
    IFStyle.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.AfterPropertiesChange) {
            if (gUtil.containsObjectKey(args.properties, properties)) {
                this.visualChange();
                return true;
            }
        }
        return false;
    };

    /** @override */
    IFStyle.prototype.toString = function () {
        return "[IFStyle]";
    };

    _.IFStyle = IFStyle;
})(this);