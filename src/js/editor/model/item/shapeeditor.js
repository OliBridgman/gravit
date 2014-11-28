(function (_) {
    /**
     * A base editor for shapes
     * @param {GShape} shape the shape this editor works on
     * @extends GBlockEditor
     * @constructor
     */
    function GShapeEditor(shape) {
        GBlockEditor.call(this, shape);
    };
    GObject.inherit(GShapeEditor, GBlockEditor);

    /** @override */
    GShapeEditor.prototype.initialSetup = function () {
        var element = this.getElement();
        var defStyle = element.getWorkspace().getStyles().querySingle('style[_sdf="shape"]');
        if (defStyle) {
            element.assignStyleFrom(defStyle);
        }
    };

    /** @override */
    GShapeEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (GElementEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            if (source instanceof GPattern && hitData instanceof GShape.HitResult) {
                    var editor = GEditor.getEditor(this.getElement().getScene());
                    editor.beginTransaction();
                    try {
                        switch (hitData.type) {
                            case GShape.HitResult.Type.Border:
                                this.getElement().setProperty('_bpt', source);
                                break;
                            default:
                                this.getElement().setProperty('_fpt', source);
                                break;
                        }
                    } finally {
                        editor.commitTransaction('Drop Pattern');
                    }
            }
            return true;
        }
        return true;
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GShapeEditor.prototype._hasCenterCross = function () {
        return false;
    };

    /** @override */
    GShapeEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            var element = this.getPaintElement();

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new GVertexTransformer(element, transform);
            context.canvas.putVertices(new GVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            context.canvas.strokeVertices(this.hasFlag(GElementEditor.Flag.Highlighted) ? context.highlightOutlineColor : context.selectionOutlineColor, 1);
        }
    };

    /** @override */
    GShapeEditor.prototype._postPaint = function (transform, context) {
        // Paint center cross if desired + selected + in detail mode
        if (this.hasFlag(GElementEditor.Flag.Selected) && this.hasFlag(GElementEditor.Flag.Detail) && this._hasCenterCross()) {
            var element = this.getPaintElement();
            var sourceTransform = element.getTransform();
            var targetTransform = sourceTransform ? sourceTransform : new GTransform(1, 0, 0, 1, 0, 0);
            targetTransform = transform ? targetTransform.multiplied(transform) : targetTransform;
            var crossHalfSizeMax = GElementEditor.OPTIONS.centerCrossSize * 2;
            var tMatrix = targetTransform.getMatrix();

            if (Math.abs(tMatrix[0]) * element.getOrigHalfWidth() > crossHalfSizeMax &&
                Math.abs(tMatrix[3]) * element.getOrigHalfHeight() > crossHalfSizeMax) {

                var center = targetTransform.mapPoint(element.getCenter(false));
                var cx = Math.floor(center.getX()) + 0.5;
                var cy = Math.floor(center.getY()) + 0.5;
                var cs = GElementEditor.OPTIONS.centerCrossSize / 2;
                context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
            }
        }
    };

    /** @override */
    GShapeEditor.prototype.toString = function () {
        return "[Object GShapeEditor]";
    };

    _.GShapeEditor = GShapeEditor;
})(this);