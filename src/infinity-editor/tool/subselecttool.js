(function (_) {
    /**
     * The sub selection tool
     * @class GSubSelectTool
     * @extends GSelectTool
     * @constructor
     * @version 1.0
     */
    function GSubSelectTool() {
        GSelectTool.call(this);
    };

    GObject.inherit(GSubSelectTool, GSelectTool);

    /** @override */
    GSubSelectTool.prototype.getCursor = function () {
        var result = GSelectTool.prototype.getCursor.call(this);
        if (result === GCursor.Select) {
            return GCursor.SelectInverse;
        } else if (result === GCursor.SelectDot) {
            return GCursor.SelectDotInverse;
        } else {
            return result;
        }
    };

    /** @override */
    GSubSelectTool.prototype.activate = function (view) {
        GSelectTool.prototype.activate.call(this, view);

        // Set detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(true);
    };

    /** @override */
    GSubSelectTool.prototype.deactivate = function (view) {
        // Remove detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(false);

        GSelectTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    GSubSelectTool.prototype._mouseDragStart = function (event) {
        if (this._mode == GSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(GSelectTool._Mode.Moving);

            if (this._editorMovePartInfo) {
                if (this._editorMovePartInfo.isolated) {
                    this._editorMovePartInfo =
                        this._editorMovePartInfo.editor.subSelectDragStartAction(this._editorMovePartInfo);
                } else {
                    var selection = this._editor.getSelection();
                    if (selection && selection.length) {
                        for (var i = 0; i < selection.length; ++i) {
                            var editor = GElementEditor.getEditor(selection[i]);
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
        } else {
            GSelectTool.prototype._mouseDragStart.call(this, event);
        }
    };

    /** @override */
    GSubSelectTool.prototype._getSelectableElement = function (element) {
        return element instanceof GItem ? element : null;
    };

    /** override */
    GSubSelectTool.prototype.toString = function () {
        return "[Object GSubSelectTool]";
    };

    _.GSubSelectTool = GSubSelectTool;
})(this);