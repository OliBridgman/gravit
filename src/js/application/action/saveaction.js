(function (_) {

    /**
     * Action saving a document
     * @class GSaveAction
     * @extends GAction
     * @constructor
     */
    function GSaveAction() {
    };
    GObject.inherit(GSaveAction, GAction);

    GSaveAction.ID = 'file.save';
    GSaveAction.TITLE = new GLocale.Key(GSaveAction, "title");

    /**
     * @override
     */
    GSaveAction.prototype.getId = function () {
        return GSaveAction.ID;
    };

    /**
     * @override
     */
    GSaveAction.prototype.getTitle = function () {
        return GSaveAction.TITLE;
    };

    /**
     * @override
     */
    GSaveAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GSaveAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GSaveAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'S'];
    };

    /**
     * @override
     */
    GSaveAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.isSaveable();
    };

    /**
     * @override
     */
    GSaveAction.prototype.execute = function () {
        gApp.getActiveDocument().save();
    };

    /** @override */
    GSaveAction.prototype.toString = function () {
        return "[Object GSaveAction]";
    };

    _.GSaveAction = GSaveAction;
})(this);