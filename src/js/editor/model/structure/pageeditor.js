(function (_) {
    /**
     * An editor for a page
     * @param {GGroup} group the group this editor works on
     * @class GPageEditor
     * @extends GBlockEditor
     * @constructor
     */
    function GPageEditor(group) {
        GBlockEditor.call(this, group);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GPageEditor, GBlockEditor);
    GPageEditor.exports(GPageEditor, GPage);

    /** @override */
    GPageEditor.prototype.canApplyTransform = function () {
        // Page transforms can be applied only if the page doesn't
        // intersect with any other page
        if (this._transform && !this._transform.isIdentity() && !this.getElement().hasFlag(GElement.Flag.Locked)) {
            var pageRect = this._transform.mapRect(new GRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));

            if (this._element.getScene().willPageIntersectWithOthers(this._element, pageRect)) {
                return false;
            }

            return true;
        }
        return false;
    };

    /** @override */
    GPageEditor.prototype.applyTransform = function () {
        if (this._transform && !this._transform.isIdentity()) {
            var pageRect = this._transform.mapRect(new GRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));
            this._element.setProperties(['x', 'y', 'w', 'h'], [pageRect.getX(), pageRect.getY(), pageRect.getWidth(), pageRect.getHeight()]);
            this._transform = null;
        }
        this.resetTransform();
    };

    /** @override */
    GPageEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        GBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    GPageEditor.prototype.toString = function () {
        return "[Object GPageEditor]";
    };

    _.GPageEditor = GPageEditor;
})(this);