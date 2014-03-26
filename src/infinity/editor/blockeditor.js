(function (_) {
    /**
     * A base editor for shapes
     * @param {GXBlock} block the block this editor works on
     * @class GXBlockEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXBlockEditor(block) {
        GXElementEditor.call(this, block);
    };
    GObject.inherit(GXBlockEditor, GXElementEditor);

    GXBlockEditor.Flag = {
        /**
         * The editor supports edge resize handles
         * @type Number
         */
        ResizeEdges: 1 << 10,

        /**
         * The editor supports center resize handles
         * @type Number
         */
        ResizeCenters: 1 << 11,

        /**
         * The editor supports all resize handles
         * @type Number
         */
        ResizeAll: 1 << 10 | 1 << 11
    };

    GXBlockEditor.TL_SIZE_PART_ID = gUtil.uuid();
    GXBlockEditor.RC_SIZE_PART_ID = gUtil.uuid();

    /** @override */
    GXBlockEditor.prototype.getBBoxMargin = function () {
        if (this._showResizeHandles()) {
            return GXElementEditor.OPTIONS.annotationSizeSmall + 1;
        }
        return GXElementEditor.prototype.getBBoxMargin.call(this);
    };

    /** @override */
    GXBlockEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            // Let descendant classes do some pre-painting
            this._prePaint(targetTransform, context);

            // Paint resize handles if desired
            if (this._showResizeHandles()) {
                /*
                 // paint base annotations
                 this._iterateBaseCorners(true, function (args) {
                 this._paintAnnotation(context, transform, args.position,
                 GXElementEditor.Annotation.Rectangle, false, true);
                 return false;
                 }.bind(this));
                 */
            }

            // Let descendant classes do some post-painting
            this._postPaint(targetTransform, context);
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /**
     * Called for subclasses to do some custom painting beneath of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GXPaintContext} context the paint context to paint on
     * @private
     */
    GXBlockEditor.prototype._prePaint = function (transform, context) {
        // NO-OP
    };

    /**
     * Called for subclasses to do some custom painting on top of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GXPaintContext} context the paint context to paint on
     * @private
     */
    GXBlockEditor.prototype._postPaint = function (transform, context) {
        // NO-OP
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GXBlockEditor.prototype._showResizeHandles = function () {
        return this._showAnnotations() && (this.hasFlag(GXBlockEditor.Flag.ResizeEdges) || this.hasFlag(GXBlockEditor.Flag.ResizeCenters));
    };

    /** @override */
    GXBlockEditor.prototype.toString = function () {
        return "[Object GXBlockEditor]";
    };

    _.GXBlockEditor = GXBlockEditor;
})(this);