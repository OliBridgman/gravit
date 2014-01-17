(function (_) {
    /**
     * A base editor for shapes
     * @param {GXShape} shape the shape this editor works on
     * @class GXShapeEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXShapeEditor(shape) {
        GXElementEditor.call(this, shape);
    };
    GObject.inherit(GXShapeEditor, GXElementEditor);

    /** @override */
    GXShapeEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;
            var element = this.getPaintElement();

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            // Calculate transformed geometry bbox
            var bbox = element.getGeometryBBox();
            var transformedBBox = bbox ? targetTransform.mapRect(bbox) : null;

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new GXVertexTransformer(element, targetTransform);

            // Add vertices with pixel alignment for (hopefully) sharper outlines
            context.canvas.putVertices(new GXVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            if (this.hasFlag(GXElementEditor.Flag.Highlighted)) {
                context.canvas.strokeVertices(context.highlightOutlineColor, 2);
            } else {
                context.canvas.strokeVertices(context.selectionOutlineColor, 1);
            }

            // Let sub classes paint custom stuff here
            this._paintCustom(targetTransform, context);

            // Paint center cross if desired + selected + in detail mode
            if (this.hasFlag(GXElementEditor.Flag.Selected) && this.hasFlag(GXElementEditor.Flag.Detail) && this._hasCenterCross()) {
                var crossSizeMax = GXElementEditor.OPTIONS.centerCrossSize * 4;

                if (transformedBBox && transformedBBox.getWidth() > crossSizeMax && transformedBBox.getHeight() > crossSizeMax) {
                    var center = transformedBBox.getSide(GRect.Side.CENTER);
                    var cx = Math.floor(center.getX()) + 0.5;
                    var cy = Math.floor(center.getY()) + 0.5;
                    var cs = GXElementEditor.OPTIONS.centerCrossSize / 2;
                    context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                    context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
                }
            }
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GXShapeEditor.prototype._hasCenterCross = function () {
        return false;
    };

    /**
     * Called for subclasses to do some custom painting on top of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GXPaintContext} context the paint context to paint on
     * @private
     */
    GXShapeEditor.prototype._paintCustom = function (transform, context) {
        // NO-OP
    };

    /** @override */
    GXShapeEditor.prototype.toString = function () {
        return "[Object GXShapeEditor]";
    };

    _.GXShapeEditor = GXShapeEditor;
})(this);