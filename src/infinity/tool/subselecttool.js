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

    GObject.inherit(IFSubSelectTool, IFSelectTool);

    /** @override */
    IFSubSelectTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    IFSubSelectTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z M7.5,27.5l-3,4.5V20.5l9,7H7.5z"/>\n</svg>\n';
    };

    /** @override */
    IFSubSelectTool.prototype.getHint = function () {
        return IFSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(IFSubSelectTool, "title"));
    };

    /** @override */
    IFSubSelectTool.prototype.getActivationCharacters = function () {
        return ['A', '1'];
    };

    /** @override */
    IFSubSelectTool.prototype.getCursor = function () {
        var result = IFSelectTool.prototype.getCursor.call(this);
        if (result === GUICursor.Select) {
            return GUICursor.SelectInverse;
        } else if (result === GUICursor.SelectDot) {
            return GUICursor.SelectDotInverse;
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

    /** @override */
    IFSubSelectTool.prototype._getSelectableElement = function (element) {
        return element instanceof IFShape ? element : null;
    };

    /** override */
    IFSubSelectTool.prototype.toString = function () {
        return "[Object IFSubSelectTool]";
    };

    _.IFSubSelectTool = IFSubSelectTool;
})(this);