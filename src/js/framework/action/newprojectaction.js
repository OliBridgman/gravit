(function (_) {

    /**
     * Action creating a new document
     * @class GNewProjectAction
     * @extends GAction
     * @constructor
     */
    function GNewProjectAction() {
    };
    GObject.inherit(GNewProjectAction, GAction);

    GNewProjectAction.ID = 'file.new';
    GNewProjectAction.TITLE = new GLocale.Key(GNewProjectAction, "title");

    /**
     * @override
     */
    GNewProjectAction.prototype.getId = function () {
        return GNewProjectAction.ID;
    };

    /**
     * @override
     */
    GNewProjectAction.prototype.getTitle = function () {
        return GNewProjectAction.TITLE;
    };

    /**
     * @override
     */
    GNewProjectAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GNewProjectAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GNewProjectAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'N'];
    };

    /**
     * @override
     */
    GNewProjectAction.prototype.execute = function () {
        gHost.openDirectoryPrompt(function (directory, name) {
            // TODO : Check and query for empty directory
            gApp.addProject(new GProject(directory, name));
        });
    };

    /** @override */
    GNewProjectAction.prototype.toString = function () {
        return "[Object GNewProjectAction]";
    };

    _.GNewProjectAction = GNewProjectAction;
})(this);