(function (_) {
    /**
     * The sub selection tool
     * @class IFSubSelectTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
    function IFSubSelectTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFSubSelectTool, IFSelectTool);

    /** @override */
    IFSubSelectTool.prototype.getCursor = function () {
        var result = IFSelectTool.prototype.getCursor.call(this);
        if (result === IFCursor.Select) {
            return IFCursor.SelectInverse;
        } else if (result === IFCursor.SelectDot) {
            return IFCursor.SelectDotInverse;
        } else {
            return result;
        }
    };

    /** @override */
    IFSubSelectTool.prototype.activate = function (view) {
        IFSelectTool.prototype.activate.call(this, view);

        // Set detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(true);
    };

    /** @override */
    IFSubSelectTool.prototype.deactivate = function (view) {
        // Remove detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(false);

        IFSelectTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    IFSubSelectTool.prototype._mouseDragStart = function (event) {
        if (this._mode == IFSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(IFSelectTool._Mode.Moving);

            if (this._editorMovePartInfo) {
                if (this._editorMovePartInfo.isolated) {
                    this._editorMovePartInfo =
                        this._editorMovePartInfo.editor.subSelectDragStartAction(this._editorMovePartInfo);
                } else {
                    var selection = this._editor.getSelection();
                    if (selection && selection.length) {
                        for (var i = 0; i < selection.length; ++i) {
                            var editor = IFElementEditor.getEditor(selection[i]);
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
            IFSelectTool.prototype._mouseDragStart.call(this, event);
        }
    };

    /** override */
    IFSubSelectTool.prototype.toString = function () {
        return "[Object IFSubSelectTool]";
    };

    _.IFSubSelectTool = IFSubSelectTool;
})(this);