(function (_) {

    /**
     * Action for cloning the selection from the current document
     * @class GDuplicateAction
     * @extends GUIAction
     * @constructor
     */
    function GDuplicateAction() {
    };
    IFObject.inherit(GDuplicateAction, GUIAction);

    GDuplicateAction.ID = 'edit.duplicate';
    GDuplicateAction.TITLE = new IFLocale.Key(GDuplicateAction, "title");

    /**
     * @override
     */
    GDuplicateAction.prototype.getId = function () {
        return GDuplicateAction.ID;
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.getTitle = function () {
        return GDuplicateAction.TITLE;
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.getGroup = function () {
        return "selection";
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'D'];
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.getEditor().getSelection() != null;
    };

    /**
     * @override
     */
    GDuplicateAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        editor.beginTransaction();
        try {
            editor.moveSelection(new GPoint(10, 10), false);
            editor.applySelectionTransform(true, true);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Duplicate Selection');
        }
    };

    /** @override */
    GDuplicateAction.prototype.toString = function () {
        return "[Object GDuplicateAction]";
    };

    _.GDuplicateAction = GDuplicateAction;
})(this);