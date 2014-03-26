(function (_) {
    /**
     * An editor for a page
     * @param {GXGroup} group the group this editor works on
     * @class GXPageEditor
     * @extends GXBlockEditor
     * @constructor
     */
    function GXPageEditor(group) {
        GXBlockEditor.call(this, group);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXPageEditor, GXBlockEditor);
    GXPageEditor.exports(GXPageEditor, GXPage);

    /** @override */
    GXPageEditor.prototype.canApplyTransform = function () {
        // Page transforms can be applied only if the page doesn't
        // intersect with any other page
        if (this._transform && !this._transform.isIdentity() && !this.getElement().hasFlag(GXElement.Flag.Locked)) {
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
    GXPageEditor.prototype.applyTransform = function () {
        if (this._transform && !this._transform.isIdentity()) {
            var pageRect = this._transform.mapRect(new GRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));

            // If new page rect somewhat intersects any other pages including spacing
            // then ignore the transformation aka don't assign it
            var allPages = this._element.getScene().queryAll('page');
            if (allPages) {
                for (var i = 0; i < allPages.length; ++i) {
                    if (allPages[i] === this._element) {
                        continue;
                    }

                    var geoBBox = allPages[i].getGeometryBBox();
                    if (geoBBox && geoBBox.expanded(GXScene.PAGE_SPACING, GXScene.PAGE_SPACING, GXScene.PAGE_SPACING, GXScene.PAGE_SPACING).intersectsRect(pageRect)) {
                        // Reset transform and be done here
                        this.resetTransform();
                        return;
                    }
                }
            }

            this._element.setProperties(['x', 'y', 'w', 'h'], [pageRect.getX(), pageRect.getY(), pageRect.getWidth(), pageRect.getHeight()]);
            this._transform = null;
        }
    };

    /** @override */
    GXPageEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (GXBlockEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            // TODO : Make optional as most of the time this sucks
            /*
             // We can handle colors so check for a color
             if (type === GXElementEditor.DropType.Color) {
             this.getElement().setProperty('color', source ? source.asString() : null);
             return true;
             }
             */
        }
        return true;
    };

    /** @override */
    GXPageEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected)) {
            // Calculate transformed geometry bbox
            var pageRect = this._element.getGeometryBBox();
            var transformedRect = transform.mapRect(pageRect);

            // Ensure to pixel-align the rect
            var x = Math.floor(transformedRect.getX());
            var y = Math.floor(transformedRect.getY());
            var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
            var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

            context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1.0, context.selectionOutlineColor);
        }
        GXBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    GXPageEditor.prototype.toString = function () {
        return "[Object GXPageEditor]";
    };

    _.GXPageEditor = GXPageEditor;
})(this);