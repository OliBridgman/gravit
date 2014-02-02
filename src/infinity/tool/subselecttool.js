(function (_) {
    /**
     * The sub selection tool
     * @class GXSubSelectTool
     * @extends GXSelectTool
     * @constructor
     * @version 1.0
     */
    function GXSubSelectTool() {
        GXSelectTool.call(this);
    };

    GObject.inherit(GXSubSelectTool, GXSelectTool);

    /** @override */
    GXSubSelectTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXSubSelectTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z M7.5,27.5l-3,4.5V20.5l9,7H7.5z"/>\n</svg>\n';
    };

    /** @override */
    GXSubSelectTool.prototype.getHint = function () {
        return GXSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXSubSelectTool, "title"));
    };

    /** @override */
    GXSubSelectTool.prototype.getActivationCharacters = function () {
        return ['A', '1'];
    };

    /** @override */
    GXSubSelectTool.prototype.getCursor = function () {
        var result = GXSelectTool.prototype.getCursor.call(this);
        if (result === GUICursor.Select) {
            return GUICursor.SelectInverse;
        } else if (result === GUICursor.SelectDot) {
            return GUICursor.SelectDotInverse;
        } else {
            return result;
        }
    };

    /** @override */
    GXSubSelectTool.prototype.activate = function (view, layer) {
        GXSelectTool.prototype.activate.call(this, view, layer);

        // Set detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(true);
    };

    /** @override */
    GXSubSelectTool.prototype.deactivate = function (view, layer) {
        // Remove detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(false);

        GXSelectTool.prototype.deactivate.call(this, view, layer);
    };

    /** @override */
    GXSubSelectTool.prototype._mouseDragStart = function (event) {
        // When Path point is drag with SubSelect Tool:
        // - if a point was not selected, it gets the only selected, and drag it
        // - if a point was selected and didn't have right handle - create right handle (correct projection for connector)
        // - if a point was selected and had the right handle,
        //      but not the left - create left (& rotate right handle for smooth point)
        // - if a point was selected and had both handles - drag the point together with other selected points
        // If Shift is pressed, new coordinate is constrained against the original point's position
        // If a point is drag, and Alt is pressed in the last mouse move position, then the path is cloned

        if (this._mode == GXSelectTool._Mode.Move) {
            // Save start
            this._moveStart = this._view.getViewTransform().mapPoint(event.client);

            // Switch to moving mode
            this._updateMode(GXSelectTool._Mode.Moving);

            if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
                this._editorMovePartInfo =
                    this._editorMovePartInfo.editor.subSelectDragStartAction(this._editorMovePartInfo);
            } else {
                var selection = this._editor.getSelection();
                if (selection && selection.length) {
                    for (var i = 0; i < selection.length; ++i) {
                        var editor = GXElementEditor.getEditor(selection[i]);
                        if (editor) {
                            var partInfo = editor.subSelectDragStartAction(this._editorMovePartInfo);
                            if (partInfo) {
                                this._editorMovePartInfo = partInfo;
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    /** override */
    GXSubSelectTool.prototype.toString = function () {
        return "[Object GXSubSelectTool]";
    };

    _.GXSubSelectTool = GXSubSelectTool;
})(this);