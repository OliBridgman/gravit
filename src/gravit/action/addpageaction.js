(function (_) {

    /**
     * Action for inserting one or more new pages
     * @class GAddPageAction
     * @extends GUIAction
     * @constructor
     */
    function GAddPageAction() {
    };
    IFObject.inherit(GAddPageAction, GUIAction);

    GAddPageAction.ID = 'modify.add-pages';
    GAddPageAction.TITLE = new IFLocale.Key(GAddPageAction, "title");

    /**
     * @override
     */
    GAddPageAction.prototype.getId = function () {
        return GAddPageAction.ID;
    };

    /**
     * @override
     */
    GAddPageAction.prototype.getTitle = function () {
        return GAddPageAction.TITLE;
    };

    /**
     * @override
     */
    GAddPageAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GAddPageAction.prototype.getGroup = function () {
        return "page";
    };

    /**
     * @override
     */
    GAddPageAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @param {Boolean} [noUndo] if set, no undo takes place for adding the page
     * @override
     */
    GAddPageAction.prototype.execute = function (noUndo) {
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

        var addPageFunc = function () {
            scene.appendChild(page);
            scene.setActiveLayer(layer);
        }

        if (!noUndo) {
            // TODO : I18N
            IFEditor.tryRunTransaction(scene, addPageFunc, 'Add Page');
        } else {
            addPageFunc();
        }
    };

    /** @override */
    GAddPageAction.prototype.toString = function () {
        return "[Object GAddPageAction]";
    };

    _.GAddPageAction = GAddPageAction;
})(this);