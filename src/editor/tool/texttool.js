(function (_) {
    /**
     * The text tool
     * @class GTextTool
     * @extends GShapeTool
     * @constructor
     */
    function GTextTool() {
        GShapeTool.call(this, true, true);
    }

    GObject.inherit(GTextTool, GShapeTool);

    /**
     * @type {GText}
     * @private
     */
    GTextTool.prototype._textUnderMouse = null;

    /** @override */
    GTextTool.prototype.getCursor = function () {
        if (this._textUnderMouse) {
            // TODO : Figure a better cursor to indicate editing
            return GCursor.SelectDot;
        } else if (!this._shape) {
            return GCursor.Text;
        } else {
            return GShapeTool.prototype.getCursor.call(this);
        }
    };

    /**
     * @param {GMouseEvent.Release} event
     * @private
     */
    GTextTool.prototype._mouseRelease = function (event) {
        if (this._textUnderMouse) {

            // Save as this will be lost after switching tool
            var editor = this._editor;
            var view = this._view;

            // Switch to select tool
            this._manager.activateTool(GPointerTool);

            // open inline editor
            editor.openInlineEditor(this._textUnderMouse, view, event.client)
        } else {
            GShapeTool.prototype._mouseRelease.call(this, event);
        }
    };

    /** @override */
    GTextTool.prototype._mouseMove = function (event) {
        GShapeTool.prototype._mouseMove.call(this, event);

        if (this._textUnderMouse) {
            this._textUnderMouse = null;
            this.updateCursor();
        }

        if (!this._shape) {
            var elementHits = this._scene.hitTest(event.client, this._view.getWorldTransform(), null,
                false, -1, this._scene.getProperty('pickDist'));

            if (elementHits && elementHits.length && elementHits[0].element instanceof GText) {
                this._textUnderMouse = elementHits[0].element;
                this.updateCursor();
            }
        }
    };

    /** @override */
    GTextTool.prototype._createShape = function () {
        return new GRectangle();
    };

    /** @override */
    GTextTool.prototype._updateShape = function (shape, area, line, scene) {
        if (scene) {
            shape.setProperty('trf', new GTransform(area.getWidth(), 0, 0, area.getHeight(), area.getX(), area.getY()));
        } else {
            shape.setProperty('trf',
                new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                    area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
        }
    };

    /** @override */
    GTextTool.prototype._insertShape = function (shape) {
        // Create our text out of our rectangle here
        var text = new GText();
        text.setProperties(['aw', 'ah', 'trf'], [false, false, shape.getProperty('trf')]);
        text.useTextBoxAsBase();
        this._insertText(text);
    };

    /** @override */
    GTextTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GTextTool.prototype._createShapeManually = function (position) {
        var text = new GText();
        text.setProperty('trf', new GTransform(1, 0, 0, 1, position.getX(), position.getY()));
        this._insertText(text);
    };

    /** @private */
    GTextTool.prototype._insertText = function (text) {
        // Insert text, first
        GShapeTool.prototype._insertShape.call(this, text);

        // Save as this will be lost after switching tool
        var editor = this._editor;
        var view = this._view;

        // Switch to select tool
        this._manager.activateTool(GPointerTool);

        // Open inline editor for text
        editor.openInlineEditor(text, view);
    };

    /** override */
    GTextTool.prototype.toString = function () {
        return "[Object GTextTool]";
    };

    _.GTextTool = GTextTool;
})(this);