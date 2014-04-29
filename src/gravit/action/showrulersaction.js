(function (_) {

    /**
     * Action for showing / hiding the rulers
     * @class EXShowRulersAction
     * @extends GUIAction
     * @constructor
     */
    function EXShowRulersAction() {
    };
    GObject.inherit(EXShowRulersAction, GUIAction);

    EXShowRulersAction.ID = 'view.show.rulers';
    EXShowRulersAction.TITLE = new GLocale.Key(EXShowRulersAction, "title");

    /**
     * @override
     */
    EXShowRulersAction.prototype.getId = function () {
        return EXShowRulersAction.ID;
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.getTitle = function () {
        return EXShowRulersAction.TITLE;
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.getGroup = function () {
        return "guides";
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, GUIKey.Constant.OPTION, 'R'];
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.isEnabled = function () {
        // TODO
        return false;
    };

    /** @override */
    EXShowRulersAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.isChecked = function () {
        // TODO
        return false;
    };

    /**
     * @override
     */
    EXShowRulersAction.prototype.execute = function () {
        // TODO
        return false;
    };

    /** @override */
    EXShowRulersAction.prototype.toString = function () {
        return "[Object EXShowRulersAction]";
    };

    _.EXShowRulersAction = EXShowRulersAction;
})(this);