(function (_) {

    /**
     * Action saving all documents
     * @class EXSaveAllAction
     * @extends GUIAction
     * @constructor
     */
    function EXSaveAllAction() {
    };
    GObject.inherit(EXSaveAllAction, GUIAction);

    EXSaveAllAction.ID = 'file.save-all';
    EXSaveAllAction.TITLE = new GLocale.Key(EXSaveAllAction, "title");

    /**
     * @override
     */
    EXSaveAllAction.prototype.getId = function () {
        return EXSaveAllAction.ID;
    };

    /**
     * @override
     */
    EXSaveAllAction.prototype.getTitle = function () {
        return EXSaveAllAction.TITLE;
    };

    /**
     * @override
     */
    EXSaveAllAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXSaveAllAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    EXSaveAllAction.prototype.isEnabled = function () {
        var documents = gApp.getDocuments();
        for (var i = 0; i < documents.length; ++i) {
            if (documents[i].isSaveable()) {
                return true;
            }
        }
        return false;
    };

    /**
     * @override
     */
    EXSaveAllAction.prototype.execute = function () {
        var documents = gApp.getDocuments();
        for (var i = 0; i < documents.length; ++i) {
            if (documents[i].isSaveable()) {
                documents[i].save();
            }
        }
    };

    /** @override */
    EXSaveAllAction.prototype.toString = function () {
        return "[Object EXSaveAllAction]";
    };

    _.EXSaveAllAction = EXSaveAllAction;
})(this);