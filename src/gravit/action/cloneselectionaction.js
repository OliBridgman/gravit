(function (_) {

    /**
     * Action for cloning the selection from the current document
     * @class EXCloneSelectionAction
     * @extends GUIAction
     * @constructor
     */
    function EXCloneSelectionAction() {
    };
    GObject.inherit(EXCloneSelectionAction, GUIAction);

    EXCloneSelectionAction.ID = 'edit.clone';
    EXCloneSelectionAction.TITLE = new GLocale.Key(EXCloneSelectionAction, "title");

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.getId = function () {
        return EXCloneSelectionAction.ID;
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.getTitle = function () {
        return EXCloneSelectionAction.TITLE;
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.getGroup = function () {
        return "selection";
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, GUIKey.Constant.SHIFT, 'D'];
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.getEditor().getSelection() != null;
    };

    /**
     * @override
     */
    EXCloneSelectionAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().cloneSelection();
    };

    /** @override */
    EXCloneSelectionAction.prototype.toString = function () {
        return "[Object EXCloneSelectionAction]";
    };

    _.EXCloneSelectionAction = EXCloneSelectionAction;
})(this);