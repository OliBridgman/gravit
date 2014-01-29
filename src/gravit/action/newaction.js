(function (_) {

    /**
     * Action creating a new document
     * @class EXNewAction
     * @extends GUIAction
     * @constructor
     */
    function EXNewAction() {
    };
    GObject.inherit(EXNewAction, GUIAction);

    EXNewAction.ID = 'file.new';
    EXNewAction.TITLE = new GLocale.Key(EXNewAction, "title");

    /**
     * @override
     */
    EXNewAction.prototype.getId = function () {
        return EXNewAction.ID;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getTitle = function () {
        return EXNewAction.TITLE;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    EXNewAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'M'];
    };

    /**
     * @param {String} [mode] Either null to show a dialog or one of 'screen', 'print'
     * @override
     */
    EXNewAction.prototype.execute = function (mode) {
        if (mode) {
            // Create Scene and add a default page
            var scene = new GXScene();
            var page = new GXPage();
            page.setProperties(['title'], ['Page-1']);
            scene.getPageSet().appendChild(page);

            // Do scene setup
            if (mode === 'screen') {
                scene.setProperty('unit', GXLength.Unit.PX);
                page.setProperties(['w', 'h', 'gb', 'gw', 'gc', 'gr'], [822, 960, 18, 18, 10, 4]);
            } else if (mode === 'print') {
                page.setProperties(['w', 'h', 'mt', 'mr', 'mb', 'ml'], [210, 297, 12.5, 12.5, 12.5, 12.5]);
                scene.setProperty('unit', GXLength.Unit.MM);
            }

            // Show page properties
            gApp.executeAction(GPageSetupAction.ID, [page, function () {
                gApp.addDocument(scene);

                // Do view setup
                var view = gApp.getWindows().getActiveWindow().getView();
                if (mode === 'screen') {
                    var cfg = view.getViewConfiguration();
                    cfg.singlePageMode = true;
                    cfg.pixelMode = true;

                    // Center on page with 100% for screen mode
                    view.zoomAtCenter(page.getPaintBBox().getSide(GRect.Side.CENTER));
                } else {
                    // Fit to page for print mode
                    view.zoomAll(page.getPaintBBox(), false);
                }
            }]);
        } else {
            var self = this;

            $('<div></div>')
                .append($('<button></button>')
                    .css('width', '100%')
                    .append($('<span></span>')
                        .addClass('fa fa-laptop fa-3x'))
                    .append($('<h2></h2>')
                        // TODO : I18N
                        .text('Screen Design'))
                    .append($('<p></p>')
                        .css('padding', '7px 10px')
                        // TODO : I18N
                        .text('Creates a new Document optimized for Screen-Design with pixel accuracy, pixel preview and single page editing mode.'))
                    .on('click', function () {
                        self.execute('screen');
                        $(this).gDialog('close');
                    }))
                .append($('<button></button>')
                    .css('width', '100%')
                    .append($('<span></span>')
                        .addClass('fa fa-print fa-3x'))
                    .append($('<h2></h2>')
                        // TODO : I18N
                        .text('Print Design'))
                    .append($('<p></p>')
                        .css('padding', '7px 10px')
                        // TODO : I18N
                        .text('Creates a new Document optimized for Print-Design with multiple page mode, CMYK support and color management.'))
                    .on('click', function () {
                        self.execute('print');
                        $(this).gDialog('close');
                    }))
                .gDialog({
                    // TODO : I18N
                    title: 'New Document',
                    width: 350,
                    buttons: [
                        {
                            title: GLocale.Constant.Cancel,
                            click: function () {
                                $(this).gDialog('close');
                            }
                        }
                    ]
                })
                .gDialog('open');
        }
    };

    /** @override */
    EXNewAction.prototype.toString = function () {
        return "[Object EXNewAction]";
    };

    _.EXNewAction = EXNewAction;
})(this);