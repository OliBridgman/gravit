(function (_) {

    /**
     * Action saving all documents
     * @class GSaveAllAction
     * @extends GAction
     * @constructor
     */
    function GSaveAllAction() {
    };
    IFObject.inherit(GSaveAllAction, GAction);

    GSaveAllAction.ID = 'file.save-all';
    GSaveAllAction.TITLE = new IFLocale.Key(GSaveAllAction, "title");

    /**
     * @override
     */
    GSaveAllAction.prototype.getId = function () {
        return GSaveAllAction.ID;
    };

    /**
     * @override
     */
    GSaveAllAction.prototype.getTitle = function () {
        return GSaveAllAction.TITLE;
    };

    /**
     * @override
     */
    GSaveAllAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GSaveAllAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GSaveAllAction.prototype.isEnabled = function () {
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
    GSaveAllAction.prototype.execute = function () {
        var documents = gApp.getDocuments();
        for (var i = 0; i < documents.length; ++i) {
            if (documents[i].isSaveable()) {
                documents[i].save();
            }
        }
    };

    /** @override */
    GSaveAllAction.prototype.toString = function () {
        return "[Object GSaveAllAction]";
    };

    _.GSaveAllAction = GSaveAllAction;
})(this);