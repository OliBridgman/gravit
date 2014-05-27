(function (_) {

    /**
     * Action creating a new document
     * @class GNewAction
     * @extends GUIAction
     * @constructor
     */
    function GNewAction() {
    };
    IFObject.inherit(GNewAction, GUIAction);

    GNewAction.ID = 'file.new';
    GNewAction.TITLE = new IFLocale.Key(GNewAction, "title");

    /**
     * @override
     */
    GNewAction.prototype.getId = function () {
        return GNewAction.ID;
    };

    /**
     * @override
     */
    GNewAction.prototype.getTitle = function () {
        return GNewAction.TITLE;
    };

    /**
     * @override
     */
    GNewAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GNewAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GNewAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'N'];
    };

    /**
     * @override
     */
    GNewAction.prototype.execute = function () {
        // Create Scene
        var scene = new IFScene();
        scene.setProperty('unit', IFLength.Unit.PX);

        // Execute insert pages action
        gApp.executeAction(GInsertPagesAction.ID, [scene, function () {
            // Add scene as document
            gApp.addDocument(scene);
            var document = gApp.getActiveDocument();

            // TODO
            // Center page
            gApp.executeAction(GOriginalViewAction.ID);
            //var view = document.getActiveWindow();
            //view.zoomAtCenter(page.getPaintBBox().getSide(GRect.Side.CENTER));
        }]);
    };

    /** @override */
    GNewAction.prototype.toString = function () {
        return "[Object GNewAction]";
    };

    _.GNewAction = GNewAction;
})(this);