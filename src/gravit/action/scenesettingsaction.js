(function (_) {

    /**
     * Action for document / scene settings setup
     * @class EXSceneSettingsAction
     * @extends GUIAction
     * @constructor
     */
    function EXSceneSettingsAction() {
    };
    GObject.inherit(EXSceneSettingsAction, GUIAction);

    EXSceneSettingsAction.ID = 'file.scene-settings';
    EXSceneSettingsAction.TITLE = new GLocale.Key(EXSceneSettingsAction, "title");

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.getId = function () {
        return EXSceneSettingsAction.ID;
    };

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.getTitle = function () {
        return EXSceneSettingsAction.TITLE;
    };

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.getGroup = function () {
        return "document";
    };

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    EXSceneSettingsAction.prototype.execute = function () {
        var settings = new EXSceneSettingsDialog(gApp.getActiveDocument().getScene());
        settings.open();
    };

    /** @override */
    EXSceneSettingsAction.prototype.toString = function () {
        return "[Object EXSceneSettingsAction]";
    };

    _.EXSceneSettingsAction = EXSceneSettingsAction;
})(this);