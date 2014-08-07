(function (_) {
    /**
     * A base editor for shapes
     * @param {IFShape} shape the shape this editor works on
     * @extends IFBlockEditor
     * @constructor
     */
    function IFShapeEditor(shape) {
        IFBlockEditor.call(this, shape);
    };
    IFObject.inherit(IFShapeEditor, IFBlockEditor);

    /** @override */
    IFShapeEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (IFElementEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            // Support dropping colors, gradients and swatches
            // TODO : Support dropping IFTexture as well
            if (hitData instanceof IFStyle.HitResult && hitData.entry instanceof IFPatternPaint) {
                if (source instanceof IFPattern) {
                    var editor = IFEditor.getEditor(this.getElement().getScene());
                    editor.beginTransaction();
                    try {
                        hitData.entry.setProperty('pat', source);
                    } finally {
                        editor.commitTransaction('Drop Pattern');
                    }
                }
            }
            // NO-OP
            return false;
        }
        return true;
    };

    /** @override */
    IFShapeEditor.prototype.initialSetup = function () {
        // Add a default style with a default fill
        var style = new IFInlineStyle();
        style.appendChild(new IFStrokePaint());
        this.getElement().getStyleSet().appendChild(style);
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    IFShapeEditor.prototype._hasCenterCross = function () {
        return false;
    };

    /** @override */
    IFShapeEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
            var element = this.getPaintElement();

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new IFVertexTransformer(element, transform);
            context.canvas.putVertices(new IFVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            context.canvas.strokeVertices(this.hasFlag(IFElementEditor.Flag.Highlighted) ? context.highlightOutlineColor : context.selectionOutlineColor, 1);
        }
    };

    /** @override */
    IFShapeEditor.prototype._postPaint = function (transform, context) {
        // Paint center cross if desired + selected + in detail mode
        if (this.hasFlag(IFElementEditor.Flag.Selected) && this.hasFlag(IFElementEditor.Flag.Detail) && this._hasCenterCross()) {
            var element = this.getPaintElement();
            var sourceTransform = element.getTransform();
            var targetTransform = sourceTransform ? sourceTransform : new IFTransform(1, 0, 0, 1, 0, 0);
            targetTransform = transform ? targetTransform.multiplied(transform) : targetTransform;
            var crossHalfSizeMax = IFElementEditor.OPTIONS.centerCrossSize * 2;
            var tMatrix = targetTransform.getMatrix();

            if (Math.abs(tMatrix[0]) * element.getOrigHalfWidth() > crossHalfSizeMax &&
                Math.abs(tMatrix[3]) * element.getOrigHalfHeight() > crossHalfSizeMax) {

                var center = targetTransform.mapPoint(element.getCenter(false));
                var cx = Math.floor(center.getX()) + 0.5;
                var cy = Math.floor(center.getY()) + 0.5;
                var cs = IFElementEditor.OPTIONS.centerCrossSize / 2;
                context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
            }
        }
    };

    /** @override */
    IFShapeEditor.prototype.toString = function () {
        return "[Object IFShapeEditor]";
    };

    _.IFShapeEditor = IFShapeEditor;
})(this);