(function (_) {

    /**
     * Action saving a document
     * @class EXSaveAction
     * @extends GUIAction
     * @constructor
     */
    function EXSaveAction() {
    };
    GObject.inherit(EXSaveAction, GUIAction);

    EXSaveAction.ID = 'file.save';
    EXSaveAction.TITLE = new GLocale.Key(EXSaveAction, "title");

    /**
     * @override
     */
    EXSaveAction.prototype.getId = function () {
        return EXSaveAction.ID;
    };

    /**
     * @override
     */
    EXSaveAction.prototype.getTitle = function () {
        return EXSaveAction.TITLE;
    };

    /**
     * @override
     */
    EXSaveAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXSaveAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    EXSaveAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'S'];
    };

    /**
     * @override
     */
    EXSaveAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.isSaveable();
    };

    /**
     * @override
     */
    EXSaveAction.prototype.execute = function () {
        gApp.getActiveDocument().save();
    };

    /** @override */
    EXSaveAction.prototype.toString = function () {
        return "[Object EXSaveAction]";
    };

    _.EXSaveAction = EXSaveAction;
})(this);