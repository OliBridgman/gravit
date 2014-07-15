(function (_) {

    /**
     * Action for inserting one or more new pages
     * @class GInsertPagesAction
     * @extends GUIAction
     * @constructor
     */
    function GInsertPagesAction() {
    };
    IFObject.inherit(GInsertPagesAction, GUIAction);

    GInsertPagesAction.ID = 'modify.insert-pages';
    GInsertPagesAction.TITLE = new IFLocale.Key(GInsertPagesAction, "title");

    /**
     * @override
     */
    GInsertPagesAction.prototype.getId = function () {
        return GInsertPagesAction.ID;
    };

    /**
     * @override
     */
    GInsertPagesAction.prototype.getTitle = function () {
        return GInsertPagesAction.TITLE;
    };

    /**
     * @override
     */
    GInsertPagesAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GInsertPagesAction.prototype.getGroup = function () {
        return "insert";
    };

    /**
     * @override
     */
    GInsertPagesAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GInsertPagesAction.prototype.execute = function () {
        var scene = gApp.getActiveDocument().getScene();
        var insertPos = scene.getPageInsertPosition();

        // Create page
        var page = new IFPage();
        page.setProperties([
            'name',
            'x',
            'y',
            'w',
            'h'
        ], [
            'Page ' + (scene.queryCount('> page') + 1).toString(),
            insertPos.getX(),
            insertPos.getY(),
            800,
            600
        ]);

        // Add default layer
        var layer = new IFLayer();
        // TODO : I18N
        layer.setProperties(['name'], ['Background']);
        page.appendChild(layer);

        // Append page and mark it active
        scene.appendChild(page);
        scene.setActivePage(page);
    };

    /** @override */
    GInsertPagesAction.prototype.toString = function () {
        return "[Object GInsertPagesAction]";
    };

    _.GInsertPagesAction = GInsertPagesAction;
})(this);