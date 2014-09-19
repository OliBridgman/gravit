(function (_) {
    /**
     * The text tool
     * @class IFTextTool
     * @extends IFShapeTool
     * @constructor
     */
    function IFTextTool() {
        IFShapeTool.call(this, true, true);
    }

    IFObject.inherit(IFTextTool, IFShapeTool);

    /**
     * @type {IFText}
     * @private
     */
    IFTextTool.prototype._textUnderMouse = null;

    /** @override */
    IFTextTool.prototype.getCursor = function () {
        if (this._textUnderMouse) {
            // TODO : Figure a better cursor to indicate editing
            return IFCursor.SelectDot;
        } else if (!this._shape) {
            return IFCursor.Text;
        } else {
            return IFShapeTool.prototype.getCursor.call(this);
        }
    };

    /**
     * @param {IFMouseEvent.Release} event
     * @private
     */
    IFTextTool.prototype._mouseRelease = function (event) {
        if (this._textUnderMouse) {

            // Save as this will be lost after switching tool
            var editor = this._editor;
            var view = this._view;

            // Switch to select tool
            this._manager.activateTool(IFPointerTool);

            // open inline editor
            editor.openInlineEditor(this._textUnderMouse, view, event.client)
        } else {
            IFShapeTool.prototype._mouseRelease.call(this, event);
        }
    };

    /** @override */
    IFTextTool.prototype._mouseMove = function (event) {
        IFShapeTool.prototype._mouseMove.call(this, event);

        if (this._textUnderMouse) {
            this._textUnderMouse = null;
            this.updateCursor();
        }

        if (!this._shape) {
            var elementHits = this._scene.hitTest(event.client, this._view.getWorldTransform(), null,
                false, -1, this._scene.getProperty('pickDist'));

            if (elementHits && elementHits.length && elementHits[0].element instanceof IFText) {
                this._textUnderMouse = elementHits[0].element;
                this.updateCursor();
            }
        }
    };

    /** @override */
    IFTextTool.prototype._createShape = function () {
        return new IFRectangle();
    };

    /** @override */
    IFTextTool.prototype._updateShape = function (shape, area, line, scene) {
        if (scene) {
            shape.setProperty('trf', new IFTransform(area.getWidth(), 0, 0, area.getHeight(), area.getX(), area.getY()));
        } else {
            shape.setProperty('trf',
                new IFTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                    area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
        }
    };

    /** @override */
    IFTextTool.prototype._insertShape = function (shape) {
        // Create our text out of our rectangle here
        var text = new IFText();
        text.setProperties(['aw', 'ah', 'trf'], [false, false, shape.getProperty('trf')]);
        text.useTextBoxAsBase();
        this._insertText(text);
    };

    /** @override */
    IFTextTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    IFTextTool.prototype._createShapeManually = function (position) {
        var text = new IFText();
        text.setProperty('trf', new IFTransform(1, 0, 0, 1, position.getX(), position.getY()));
        this._insertText(text);
    };

    /** @private */
    IFTextTool.prototype._insertText = function (text) {
        // Insert text, first
        IFShapeTool.prototype._insertShape.call(this, text);

        // Save as this will be lost after switching tool
        var editor = this._editor;
        var view = this._view;

        // Switch to select tool
        this._manager.activateTool(IFPointerTool);

        // Open inline editor for text
        editor.openInlineEditor(text, view);
    };

    /** override */
    IFTextTool.prototype.toString = function () {
        return "[Object IFTextTool]";
    };

    _.IFTextTool = IFTextTool;
})(this);