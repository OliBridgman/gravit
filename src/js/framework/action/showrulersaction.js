(function (_) {

    /**
     * Action for showing / hiding the rulers
     * @class GShowRulersAction
     * @extends GAction
     * @constructor
     */
    function GShowRulersAction() {
    };
    GObject.inherit(GShowRulersAction, GAction);

    GShowRulersAction.ID = 'view.show-rulers';
    GShowRulersAction.TITLE = new GLocale.Key(GShowRulersAction, "title");

    /**
     * @override
     */
    GShowRulersAction.prototype.getId = function () {
        return GShowRulersAction.ID;
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.getTitle = function () {
        return GShowRulersAction.TITLE;
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.getGroup = function () {
        return "show";
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, GKey.Constant.OPTION, 'R'];
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.isEnabled = function () {
        // TODO
        return false;
    };

    /** @override */
    GShowRulersAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.isChecked = function () {
        // TODO
        return false;
    };

    /**
     * @override
     */
    GShowRulersAction.prototype.execute = function () {
        // TODO
        return false;
    };

    /** @override */
    GShowRulersAction.prototype.toString = function () {
        return "[Object GShowRulersAction]";
    };

    _.GShowRulersAction = GShowRulersAction;
})(this);