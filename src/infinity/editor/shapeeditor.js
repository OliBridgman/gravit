(function (_) {
    /**
     * A base editor for shapes
     * @param {GXShape} shape the shape this editor works on
     * @extends GXBlockEditor
     * @constructor
     */
    function GXShapeEditor(shape) {
        GXBlockEditor.call(this, shape);
    };
    GObject.inherit(GXShapeEditor, GXBlockEditor);

    /** @override */
    GXShapeEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (GXElementEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            // TODO : Styles are supposed to gain their own editors so this should become obsolete
            // TODO : Also support dropping GXSwatch
            if (type === GXElementEditor.DropType.Color) {
                var editor = GXEditor.getEditor(this.getElement().getScene());

                // Either drop on an existing style that was hit if it is a fill style or set the fill on the root styleset of the shape
                editor.beginTransaction();
                try {
                    if (hitData && hitData instanceof GXStyle.HitResult && hitData.style instanceof GXPaintFillStyle) {
                        hitData.style.setColor(source);
                    } else {
                        this.getElement().getStyle(true).setAreaColor(source);
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Drop Color');
                }
                return true;
            }
        }
        return true;
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GXShapeEditor.prototype._hasCenterCross = function () {
        return false;
    };

    /** @override */
    GXShapeEditor.prototype._prePaint = function (transform, context) {
        var element = this.getPaintElement();

        // Work in transformed coordinates to avoid scaling outline
        var transformer = new GXVertexTransformer(element, transform);

        // Don't use alignment here, because alignment here affects how shapes filling and outline is painted.
        // With alignment, outline is always visible only partly, outside of a shape.
        // Especially it is noticeable at zoom.
        context.canvas.putVertices(transformer);

        // Paint either outlined or highlighted (highlighted has a higher precedence)
        if (this.hasFlag(GXElementEditor.Flag.Highlighted)) {
            context.canvas.strokeVertices(context.highlightOutlineColor, 2);
        } else {
            context.canvas.strokeVertices(context.selectionOutlineColor, 1);
        }
    };

    /** @override */
    GXShapeEditor.prototype._postPaint = function (transform, context) {
        // Paint center cross if desired + selected + in detail mode
        if (this.hasFlag(GXElementEditor.Flag.Selected) && this.hasFlag(GXElementEditor.Flag.Detail) && this._hasCenterCross()) {
            var element = this.getPaintElement();
            var sourceTransform = element.getTransform();
            var targetTransform = sourceTransform ? sourceTransform : new GTransform(1, 0, 0, 1, 0, 0);
            targetTransform = transform ? targetTransform.multiplied(transform) : targetTransform;
            var crossHalfSizeMax = GXElementEditor.OPTIONS.centerCrossSize * 2;
            var tMatrix = targetTransform.getMatrix();

            if (Math.abs(tMatrix[0]) * element.getOrigHalfWidth() > crossHalfSizeMax &&
                    Math.abs(tMatrix[3]) * element.getOrigHalfHeight() > crossHalfSizeMax) {

                var center = targetTransform.mapPoint(element.getCenter(false));
                var cx = Math.floor(center.getX()) + 0.5;
                var cy = Math.floor(center.getY()) + 0.5;
                var cs = GXElementEditor.OPTIONS.centerCrossSize / 2;
                context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
            }
        }
    };

    /** @override */
    GXShapeEditor.prototype.toString = function () {
        return "[Object GXShapeEditor]";
    };

    _.GXShapeEditor = GXShapeEditor;
})(this);