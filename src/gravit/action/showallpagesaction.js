(function (_) {

    /**
     * Action for switching between single and multi page view
     * @class GShowAllPagesAction
     * @extends GUIAction
     * @constructor
     */
    function GShowAllPagesAction() {
    };
    IFObject.inherit(GShowAllPagesAction, GUIAction);

    GShowAllPagesAction.ID = 'view.show-all-pages';
    GShowAllPagesAction.TITLE = new IFLocale.Key(GShowAllPagesAction, 'title');

    /**
     * @override
     */
    GShowAllPagesAction.prototype.getId = function () {
        return GShowAllPagesAction.ID;
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.getTitle = function () {
        return GShowAllPagesAction.TITLE;
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.getGroup = function () {
        return "show";
    };

    /** @override */
    GShowAllPagesAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.isChecked = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            return !document.getScene().getProperty('singlePage');
        }
        return false;
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GShowAllPagesAction.prototype.execute = function () {
        var scene = gApp.getActiveDocument().getScene();
        scene.setProperty('singlePage', !scene.getProperty('singlePage'));
    };

    /** @override */
    GShowAllPagesAction.prototype.toString = function () {
        return "[Object GShowAllPagesAction]";
    };

    _.GShowAllPagesAction = GShowAllPagesAction;
})(this);