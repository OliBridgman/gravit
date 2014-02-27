(function (_) {
    /**
     * An editor for a group
     * @param {GXGroup} group the group this editor works on
     * @class GXGroupEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXGroupEditor(group) {
        GXElementEditor.call(this, group);
    };
    GObject.inherit(GXGroupEditor, GXElementEditor);
    GXElementEditor.exports(GXGroupEditor, GXGroup);

    /** @override */
    GXGroupEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;
            var element = this.getPaintElement();

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            var box = element.getGeometryBBox();
            box = targetTransform.mapRect(box);

            context.canvas.strokeRect(box.getX(), box.getY(), box.getWidth(), box.getHeight(), 1, context.selectionOutlineColor);
            // TODO : Get right
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /** @override */
    GXGroupEditor.prototype.toString = function () {
        return "[Object GXGroupEditor]";
    };

    _.GXGroupEditor = GXGroupEditor;
})(this);