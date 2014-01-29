(function (_) {

    /**
     * Action setting up one or more pages
     * @class GPageSetupAction
     * @extends GUIAction
     * @constructor
     */
    function GPageSetupAction() {
    };
    GObject.inherit(GPageSetupAction, GUIAction);

    GPageSetupAction.ID = 'file.page-setup';
    GPageSetupAction.TITLE = new GLocale.Key(GPageSetupAction, "title");

    /**
     * @override
     */
    GPageSetupAction.prototype.getId = function () {
        return GPageSetupAction.ID;
    };

    /**
     * @override
     */
    GPageSetupAction.prototype.getTitle = function () {
        return GPageSetupAction.TITLE;
    };

    /**
     * @override
     */
    GPageSetupAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GPageSetupAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GPageSetupAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.META, 'P'];
    };

    /**
     * @param {*} [pages] Either null to setup active page or an array
     * of one or more page(s) to be setup or a single page instance
     * to be setup
     * @override
     */
    GPageSetupAction.prototype.isEnabled = function (pages) {
        return this._extractPages(pages).length > 0;
    };

    /**
     * @param {*} [pages] Either null to setup active page or an array
     * of one or more page(s) to be setup or a single page instance
     * to be setup
     * @param {Boolean} [force] if true, user is forced to to setup
     * the page(s) and cannot cancel the dialog
     * @override
     */
    GPageSetupAction.prototype.execute = function (pages, force) {
        var pages = this._extractPages(pages);
        var buttons = [{
            title: GLocale.Constant.Ok,
            click: function () {
                // TODO : Assign
                for (var i = 0; i < pages.length; ++i) {
                    pages[i].setProperties(['w', 'h'], [640, 480]);
                }

                $(this).gDialog('close');
            }
        }];

        if (!force) {
            buttons.push({
                title: GLocale.Constant.Cancel,
                click: function () {
                    $(this).gDialog('close');
                }
            });
        }

        $('<div></div>')
            .text('PAGE_SETUP')
            .gDialog({
                // TODO : I18N
                title: 'Page Setup',
                width: 450,
                closeable: !force,
                buttons: buttons
            })
            .gDialog('open');
    };

    /** @override */
    GPageSetupAction.prototype._extractPages = function (pages) {
        var result = [];
        if (pages) {
            if (pages instanceof GXPage) {
                result.push(pages);
            } else if (pages instanceof Array) {
                result = result.concat(pages);
            }
        } else {
            if (gApp.getActiveDocument()) {
                var activePage = gApp.getActiveDocument().getScene().querySingle('page:active');
                if (activePage) {
                    result.push(activePage);
                }
            }
        }
        return result;
    };

    /** @override */
    GPageSetupAction.prototype.toString = function () {
        return "[Object GPageSetupAction]";
    };

    _.GPageSetupAction = GPageSetupAction;
})(this);