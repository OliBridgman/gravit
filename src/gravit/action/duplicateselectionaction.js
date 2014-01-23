(function (_) {

    /**
     * Action for cloning the selection from the current document
     * @class EXDuplicateSelectionAction
     * @extends GUIAction
     * @constructor
     */
    function EXDuplicateSelectionAction() {
    };
    GObject.inherit(EXDuplicateSelectionAction, GUIAction);

    EXDuplicateSelectionAction.ID = 'edit.duplicate';
    EXDuplicateSelectionAction.TITLE = new GLocale.Key(EXDuplicateSelectionAction, "title");

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.getId = function () {
        return EXDuplicateSelectionAction.ID;
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.getTitle = function () {
        return EXDuplicateSelectionAction.TITLE;
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.getGroup = function () {
        return "selection";
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'D'];
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.getEditor().getSelection() != null;
    };

    /**
     * @override
     */
    EXDuplicateSelectionAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        editor.moveSelection(new GPoint(10, 10), false);
        editor.applySelectionTransform(true);
    };

    /** @override */
    EXDuplicateSelectionAction.prototype.toString = function () {
        return "[Object EXDuplicateSelectionAction]";
    };

    _.EXDuplicateSelectionAction = EXDuplicateSelectionAction;
})(this);