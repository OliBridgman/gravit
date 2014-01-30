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
     * @param {Function} [done] if provided, this callback will be
     * called when the user has setup the page.
     * @override
     */
    GPageSetupAction.prototype.execute = function (pages, done) {
        var pages = this._extractPages(pages);

        var dialog = $('<div></div>')
            .append($('<table></table>')
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO: I18N
                            .text('Title')))
                    .append($('<td></td>')
                        .attr('colspan', '3')
                        .append($('<input>')
                            .attr('data-property', 'title')
                            .css('width', '100%')
                            .val(pages[0].getProperty('title')))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO: I18N
                            .text('Bleed')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .attr('data-property', 'bleed')
                            .val(pages[0].getProperty('bl'))))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO: I18N
                            .text('Color')))
                    .append($('<td></td>')
                        .append($('<div></div>')
                            .attr('data-property', 'color')
                            .exColorBox({
                                globalColor : false
                            })
                            .exColorBox('color', pages[0].getProperty('color'))))))
            //.html('<table>\n    <tr>\n        <td><label>Title</label></td>\n        <td colspan="3"><input data-property="title" style="width:100%"></td>\n    </tr>\n    <tr>\n        <td><label>Bleed</label></td>\n        <td><input data-property="bleed"></td>\n        <td><label>Color</label></td>\n        <td><input data-property="color"></td>\n    </tr>\n    <tr>\n        <td colspan="4"><h1>Size</h1></td>\n    </tr>\n    <tr>\n        <td><label>&nbsp;</label></td>\n        <td colspan="43">\n            <select data-property="size" style="width:100%">\n                <optgroup label="Paper">\n                    <option>A4</option>\n                    <option>A3</option>\n                </optgroup>\n                <optgroup label="Mobile">\n                    <option>iPhone 4</option>\n                    <option>iPad 4</option>\n                </optgroup>\n            </select>\n        </td>\n    </tr>\n    <tr>\n        <td><label>Width</label></td>\n        <td><input data-property="width"></td>\n        <td><label data-property="height">Height</label></td>\n        <td><input></td>\n    </tr>\n    <tr>\n        <td colspan="4"><h1>Margin</h1></td>\n    </tr>\n    <tr>\n        <td><label>Top</label></td>\n        <td><input data-property="margin-top"></td>\n        <td><label>Right</label></td>\n        <td><input data-property="margin-right"></td>\n    </tr>\n    <tr>\n        <td><label>Left</label></td>\n        <td><input data-property="margin-left"></td>\n        <td><label>Bottom</label></td>\n        <td><input data-property="margin-top"></td>\n    </tr>\n    <tr>\n        <td colspan="4"><h1>Grid</h1></td>\n    </tr>\n    <tr>\n        <td><label>Baseline</label></td>\n        <td><input data-property="grid-baseline"></td>\n        <td><label>Gutter</label></td>\n        <td><input data-property="grid-gutter"></td>\n    </tr>\n    <tr>\n        <td><label>Columns</label></td>\n        <td><input data-property="grid-columns"></td>\n        <td><label>Rows</label></td>\n        <td><input data-property="grid-rows"></td>\n    </tr>\n</table>')
            .gDialog({
                // TODO : I18N
                title: 'Page Setup',
                buttons: [
                    {
                        title: GLocale.Constant.Ok,
                        click: function () {
                            var properties = [];
                            var values = [];

                            var title = dialog.find('[data-property="title"]').val();
                            if (title && title.trim() !== "" && title.localeCompare(pages[0].getProperty('title')) !== 0) {
                                properties.push('title');
                                values.push(title);
                            }

                            // TODO : Undo-Group

                            // Assign property values to each page now
                            for (var i = 0; i < pages.length; ++i) {
                                pages[i].setProperties(properties, values);
                            }

                            $(this).gDialog('close');

                            if (done) {
                                done();
                            }
                        }
                    },
                    {
                        title: GLocale.Constant.Cancel,
                        click: function () {
                            $(this).gDialog('close');
                        }
                    }
                ]
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