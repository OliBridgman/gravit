(function (_) {

    /**
     * Action opening a document via the system storage
     * @class GOpenProjectAction
     * @extends GAction
     * @constructor
     */
    function GOpenProjectAction() {
    };
    GObject.inherit(GOpenProjectAction, GAction);

    GOpenProjectAction.ID = 'file.open-project';
    GOpenProjectAction.TITLE = new GLocale.Key(GOpenProjectAction, "title");

    /**
     * @override
     */
    GOpenProjectAction.prototype.getId = function () {
        return GOpenProjectAction.ID;
    };

    /**
     * @override
     */
    GOpenProjectAction.prototype.getTitle = function () {
        return GOpenProjectAction.TITLE;
    };

    /**
     * @override
     */
    GOpenProjectAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GOpenProjectAction.prototype.getGroup = function () {
        return 'file';
    };

    /**
     * @override
     */
    GOpenProjectAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'O'];
    };

    /**
     * @override
     */
    GOpenProjectAction.prototype.execute = function () {
        gHost.openDirectoryPrompt(function (directory, name) {
            var project = new GProject(directory, name);
            project.open(function () {
                gApp.addProject(project);
            });
        });
    };

    /** @override */
    GOpenProjectAction.prototype.toString = function () {
        return "[Object GOpenProjectAction]";
    };

    _.GOpenProjectAction = GOpenProjectAction;
})(this);