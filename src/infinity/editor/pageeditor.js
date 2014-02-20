(function (_) {
    /**
     * An editor for a page
     * @param {GXGroup} group the group this editor works on
     * @class GXPageEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXPageEditor(group) {
        GXElementEditor.call(this, group);
    };
    GObject.inherit(GXPageEditor, GXElementEditor);
    GXPageEditor.exports(GXPageEditor, GXPage);


    /** @override */
    GXPageEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected)) {
            var targetTransform = transform;

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            // Calculate transformed geometry bbox
            var pageRect = this._element.getGeometryBBox();
            var transformedRect = targetTransform.mapRect(pageRect);

            // Ensure to pixel-align the rect
            var x = Math.floor(transformedRect.getX());
            var y = Math.floor(transformedRect.getY());
            var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
            var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

            context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1.0, context.selectionOutlineColor);
        }

        // Paint our children
        this._paintChildren(transform, context);
    };

    /** @override */
    GXPageEditor.prototype.getBBox = function (transform) {
        if (this.hasFlag(GXElementEditor.Flag.Selected)) {
            var targetTransform = transform;
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            return targetTransform.mapRect(this._element.getGeometryBBox()).expanded(1, 1, 1, 1);
        }
        return null;
    };

    /** @override */
    GXPageEditor.prototype.transform = function (transform) {
        if (!GTransform.equals(this._transform, transform)) {
            this.requestInvalidation();
            this._transform = transform;
            // TODO : Lock rotation to 0° and 90°
            this.requestInvalidation();
        }
    };

    /** @override */
    GXPageEditor.prototype.applyTransform = function () {
        if (this._transform && !this._transform.isIdentity()) {
            var pageRect = this._transform.mapRect(new GRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));

            this._element.setProperties(['x', 'y', 'w', 'h'], [pageRect.getX(), pageRect.getY(), pageRect.getWidth(), pageRect.getHeight()]);
            this._transform = null;
        }
    };

    /** @override */
    GXPageEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (GXElementEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
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
    GXPageEditor.prototype.toString = function () {
        return "[Object GXPageEditor]";
    };

    _.GXPageEditor = GXPageEditor;
})(this);