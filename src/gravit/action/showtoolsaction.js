(function (_) {

    /**
     * Action for showing / hiding the tool panel
     * @class EXShowToolsAction
     * @extends GUIAction
     * @constructor
     */
    function EXShowToolsAction() {
    };
    GObject.inherit(EXShowToolsAction, GUIAction);

    EXShowToolsAction.ID = 'window.tools';
    EXShowToolsAction.TITLE = new GLocale.Key(EXShowToolsAction, "title");

    /**
     * @override
     */
    EXShowToolsAction.prototype.getId = function () {
        return EXShowToolsAction.ID;
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.getTitle = function () {
        return EXShowToolsAction.TITLE;
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.getGroup = function () {
        return "parts";
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'F2'];
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.isChecked = function () {
        return gApp.isPartVisible(EXApplication.Part.Toolpanel);
    };

    /**
     * @override
     */
    EXShowToolsAction.prototype.execute = function () {
        gApp.setPartVisible(EXApplication.Part.Toolpanel, !gApp.isPartVisible(EXApplication.Part.Toolpanel));
    };

    /** @override */
    EXShowToolsAction.prototype.toString = function () {
        return "[Object EXShowToolsAction]";
    };

    _.EXShowToolsAction = EXShowToolsAction;
})(this);