(function (_) {

    /**
     * Action for deleting the selection from the current document
     * @class EXDeleteAction
     * @extends GUIAction
     * @constructor
     */
    function EXDeleteAction() {
    };
    GObject.inherit(EXDeleteAction, GUIAction);

    EXDeleteAction.ID = 'edit.delete';
    EXDeleteAction.TITLE = new GLocale.Key(EXDeleteAction, "title");

    /**
     * @override
     */
    EXDeleteAction.prototype.getId = function () {
        return EXDeleteAction.ID;
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.getTitle = function () {
        return EXDeleteAction.TITLE;
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.getGroup = function () {
        return "cut_copy_paste_remove";
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.REMOVE];
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.getEditor().getSelection() != null;
    };

    /**
     * @override
     */
    EXDeleteAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();

        // TODO : Begin / End Undo Group
        var selectedNodes = editor.getSelection();
        for (var i = 0; i < selectedNodes.length; ++i) {
            selectedNodes[i].getParent().removeChild(selectedNodes[i]);
        }
    };

    /** @override */
    EXDeleteAction.prototype.toString = function () {
        return "[Object EXDeleteAction]";
    };

    _.EXDeleteAction = EXDeleteAction;
})(this);