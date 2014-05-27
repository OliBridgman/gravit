(function (_) {

    /**
     * Action for undo on the current document
     * @class GUndoAction
     * @extends GUIAction
     * @constructor
     */
    function GUndoAction() {
    };
    IFObject.inherit(GUndoAction, GUIAction);

    GUndoAction.ID = 'edit.undo';
    GUndoAction.TITLE = new IFLocale.Key(GUndoAction, "title");

    /**
     * @override
     */
    GUndoAction.prototype.getId = function () {
        return GUndoAction.ID;
    };

    /**
     * @override
     */
    GUndoAction.prototype.getTitle = function () {
        var result = ifLocale.get(GUndoAction.TITLE);
        var document = gApp.getActiveDocument();
        if (document && document.getEditor().hasUndoState()) {
            result += " " + document.getEditor().getUndoStateName();
        }
        return result;
    };

    /**
     * @override
     */
    GUndoAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GUndoAction.prototype.getGroup = function () {
        return "undo_redo";
    };

    /**
     * @override
     */
    GUndoAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'z'];
    };

    /**
     * @override
     */
    GUndoAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return (document && document.getEditor().hasUndoState());
    };

    /**
     * @override
     */
    GUndoAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().undoState();
    };

    /** @override */
    GUndoAction.prototype.toString = function () {
        return "[Object GUndoAction]";
    };

    _.GUndoAction = GUndoAction;
})(this);