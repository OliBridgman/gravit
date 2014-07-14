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
     * @param {IFScene} [scene] specific scene to add pages to,
     * if not provided (default), takes the active document
     * @override
     */
    GInsertPagesAction.prototype.isEnabled = function (scene) {
        var scene = scene ? scene : gApp.getActiveDocument() ? gApp.getActiveDocument().getScene() : null;
        return !!scene;
    };

    /**
     * @param {IFScene} [scene] specific scene to add pages to,
     * if not provided (default), takes the active document
     * @param {Function} [done] if provided, this callback will be
     * called when the user has setup the page(s)
     * @override
     */
    GInsertPagesAction.prototype.execute = function (scene, done) {
        var scene = scene || gApp.getActiveDocument().getScene();
        var insertPos = scene.getPageInsertPosition();

        // Create page
        var page = new IFPage();

        // Assign page properties
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

        // Append child and be done with it
        scene.appendChild(page);

        if (done) {
            done();
        }
    };

    /** @override */
    GInsertPagesAction.prototype.toString = function () {
        return "[Object GInsertPagesAction]";
    };

    _.GInsertPagesAction = GInsertPagesAction;
})(this);