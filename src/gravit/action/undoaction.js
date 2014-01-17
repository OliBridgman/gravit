(function (_) {

    /**
     * Action for undo on the current document
     * @class EXUndoAction
     * @extends GUIAction
     * @constructor
     */
    function EXUndoAction() {
    };
    GObject.inherit(EXUndoAction, GUIAction);

    EXUndoAction.ID = 'edit.undo';
    EXUndoAction.TITLE = new GLocale.Key(EXUndoAction, "title");

    /**
     * @override
     */
    EXUndoAction.prototype.getId = function () {
        return EXUndoAction.ID;
    };

    /**
     * @override
     */
    EXUndoAction.prototype.getTitle = function () {
        return EXUndoAction.TITLE;
    };

    /**
     * @override
     */
    EXUndoAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    EXUndoAction.prototype.getGroup = function () {
        return "undo_redo";
    };

    /**
     * @override
     */
    EXUndoAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'z'];
    };

    /**
     * @override
     */
    EXUndoAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return (document && document.getEditor().getUndoList().hasUndo());
    };

    /**
     * @override
     */
    EXUndoAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().getUndoList().undo();
    };

    /** @override */
    EXUndoAction.prototype.toString = function () {
        return "[Object EXUndoAction]";
    };

    _.EXUndoAction = EXUndoAction;
})(this);