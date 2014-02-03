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
        var result = gLocale.get(EXUndoAction.TITLE);
        var document = gApp.getActiveDocument();
        if (document && document.getEditor().hasUndoState()) {
            result += " " + document.getEditor().getUndoStateName();
        }
        return result;
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
        return (document && document.getEditor().hasUndoState());
    };

    /**
     * @override
     */
    EXUndoAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().undoState();
    };

    /** @override */
    EXUndoAction.prototype.toString = function () {
        return "[Object EXUndoAction]";
    };

    _.EXUndoAction = EXUndoAction;
})(this);