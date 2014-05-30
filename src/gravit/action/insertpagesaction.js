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

    GInsertPagesAction.options = {
        sizePresets: [
            {
                // TODO : I18N
                name: 'Paper',
                sizes: [
                    {
                        name: 'A0',
                        width: '841mm',
                        height: '1189mm'
                    },
                    {
                        name: 'A1',
                        width: '594mm',
                        height: '841mm'
                    },
                    {
                        name: 'A2',
                        width: '420mm',
                        height: '594mm'
                    },
                    {
                        name: 'A3',
                        width: '297mm',
                        height: '420mm'
                    },
                    {
                        name: 'A4',
                        width: '210mm',
                        height: '297mm'
                    },
                    {
                        name: 'A5',
                        width: '148,5mm',
                        height: '210mm'
                    }
                ]
            },
            {
                // TODO : I18N
                name: 'Phone',
                sizes: [
                    {
                        name: 'Apple iPhone 4 (S)',
                        width: '640px',
                        height: '960px'
                    },
                    {
                        name: 'Apple iPhone 5',
                        width: '640px',
                        height: '1136px'
                    }
                ]
            },
            {
                // TODO : I18N
                name: 'Tablet',
                sizes: [
                    {
                        name: 'Apple iPad 1 & 2 & Mini',
                        width: '768px',
                        height: '1024px'
                    },
                    {
                        name: 'Apple iPad 3 & 4',
                        width: '1536px',
                        height: '2048px'
                    }
                ]
            }
        ]
    };

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
            'h',
            'cls'
        ], [
            'Page ' + (scene.queryCount('> page') + 1).toString(),
            insertPos.getX(),
            insertPos.getY(),
            800,
            600,
            IFColor.parseCSSColor('white')
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