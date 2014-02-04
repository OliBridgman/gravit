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

    GPageSetupAction.options = {
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

    var propertiesToStore = ['title', 'bl', 'color', 'w', 'h', 'ml', 'mt', 'mr', 'mb', 'gb', 'gw', 'gc', 'gr'];

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
        var activePage = pages[0];
        // Find the active page if any
        for (var i = 0; i < pages.length; ++i) {
            if (pages[i].hasFlag(GXNode.Flag.Active)) {
                activePage = pages[i];
                break;
            }
        }

        var scene = activePage.getScene();

        // Store source properties for any reset
        var sourceValues = [];
        for (var i = 0; i < pages.length; ++i) {
            sourceValues.push(pages[i].getProperties(propertiesToStore));
        }

        var _assignPagesProperties = function (properties, values) {
            for (var i = 0; i < pages.length; ++i) {
                pages[i].setProperties(properties, values);
            }
        };

        var _assignOrResetInputPointProperty = function (propertyName, input) {
            var value = scene.stringToPoint(input.val());
            if (value !== null && typeof value === 'number' && value >= 0) {
                _assignPagesProperties([propertyName], [value]);
                input.val(scene.pointToString(value));
            } else {
                input.val(scene.pointToString(activePage.getProperty(propertyName)));
            }
        };

        var _updatePageTitles = function () {
            var title = dialog.find('[data-property="title"]').val();
            if (title !== "") {
                if (pages.length === 1) {
                    _assignPagesProperties(['title'], [title]);
                } else {
                    var mode = dialog.find('[data-property="title-mode"]:checked').val();
                    for (var i = 0; i < pages.length; ++i) {
                        var newTitle = title.replace('%n', (i + 1).toString());
                        var srcVal = sourceValues[i][propertiesToStore.indexOf('title')];
                        if (mode === 'ignore') {
                            pages[i].setProperty('title', srcVal);
                        } else if (mode === 'replace') {
                            pages[i].setProperty('title', newTitle);
                        } else if (mode === 'append') {
                            pages[i].setProperty('title', srcVal + newTitle);
                        } else if (mode === 'prepend') {
                            pages[i].setProperty('title', newTitle + srcVal);
                        }
                    }
                }
            }
        };

        var _createSizePresets = function () {
            var result = [];

            result.push($('<option></option>')
                .attr('value', 'x')
                // TODO : I18N
                .text('Custom Size'));

            for (var i = 0; i < GPageSetupAction.options.sizePresets.length; ++i) {
                var group = GPageSetupAction.options.sizePresets[i];
                var groupEl = $('<optgroup></optgroup>')
                    .attr('label', group.name);

                result.push(groupEl);

                for (var k = 0; k < group.sizes.length; ++k) {
                    var size = group.sizes[k];
                    $('<option></option>')
                        .attr('value', i.toString() + ',' + k.toString())
                        .text(size.name)
                        .appendTo(groupEl);
                }
            }

            return result;
        };

        var _selectSizePreset = function () {
            var foundPreset = false;
            var presetSelector = dialog.find('[data-property="size-preset"]');

            var w = activePage.getProperty('w');
            var h = activePage.getProperty('h');

            for (var i = 0; i < GPageSetupAction.options.sizePresets.length; ++i) {
                var group = GPageSetupAction.options.sizePresets[i];
                for (var k = 0; k < group.sizes.length; ++k) {
                    var size = group.sizes[k];
                    var sw = activePage.getScene().stringToPoint(size.width);
                    var sh = activePage.getScene().stringToPoint(size.height);
                    if (sw === w && sh === h) {
                        presetSelector.val(i.toString() + ',' + k.toString());
                        foundPreset = true;
                        break;
                    }
                }
            }

            if (!foundPreset) {
                presetSelector.val('x');
            }
        };

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
                            .val(activePage.getProperty('title'))
                            .exAutoBlur()
                            .on('input', _updatePageTitles))
                        .append($('<div></div>')
                            .css('display', pages.length === 1 ? 'none' : '')
                            .append($('<label>')
                                .append($('<input>')
                                    .attr('type', 'radio')
                                    .attr('data-property', 'title-mode')
                                    .attr('name', 'title-mode')
                                    .attr('value', 'ignore')
                                    .prop('checked', true)
                                    .on('change', _updatePageTitles))
                                .append($('<span></span>')
                                    // TODO : I18N
                                    .text('Ignore')))
                            .append($('<label>')
                                .append($('<input>')
                                    .attr('type', 'radio')
                                    .attr('data-property', 'title-mode')
                                    .attr('name', 'title-mode')
                                    .attr('value', 'append')
                                    .on('change', _updatePageTitles))
                                .append($('<span></span>')
                                    // TODO : I18N
                                    .text('Append')))
                            .append($('<label>')
                                .append($('<input>')
                                    .attr('type', 'radio')
                                    .attr('data-property', 'title-mode')
                                    .attr('name', 'title-mode')
                                    .attr('value', 'prepend')
                                    .on('change', _updatePageTitles))
                                .append($('<span></span>')
                                    // TODO : I18N
                                    .text('Prepend')))
                            .append($('<label>')
                                .append($('<input>')
                                    .attr('type', 'radio')
                                    .attr('data-property', 'title-mode')
                                    .attr('name', 'title-mode')
                                    .attr('value', 'replace')
                                    .on('change', _updatePageTitles))
                                .append($('<span></span>')
                                    // TODO : I18N
                                    .text('Replace'))))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO: I18N
                            .text('Bleed')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .css('width', '100%')
                            .val(scene.pointToString(activePage.getProperty('bl')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('bl', $(evt.target));
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO: I18N
                            .text('Color')))
                    .append($('<td></td>')
                        .append($('<button></button>')
                            .gColorButton()
                            .gColorButton('color', activePage.getProperty('color'))
                            .on('g-color-change', function (evt, color) {
                                _assignPagesProperties(['color'], [color ? color.asString() : null]);
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .attr('colspan', '4')
                        .append($('<h1></h1>')
                            // TODO : I18N
                            .text('Dimensions'))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            .html('&nbsp;')))
                    .append($('<td></td>')
                        .attr('colspan', '3')
                        .append($('<select></select>')
                            .css('width', '100%')
                            .attr('data-property', 'size-preset')
                            .append(_createSizePresets())
                            .on('change', function () {
                                var val = $(this).val();
                                if (val.indexOf(',') >= 0) {
                                    var val2 = val.split(',');
                                    var sz = GPageSetupAction.options.sizePresets[parseInt(val2[0])].sizes[parseInt(val2[1])];
                                    var wp = scene.stringToPoint(sz.width);
                                    var hp = scene.stringToPoint(sz.height);
                                    dialog.find('[data-property="width"]').val(scene.pointToString(wp));
                                    dialog.find('[data-property="height"]').val(scene.pointToString(hp));
                                    _assignPagesProperties(['w', 'h'], [wp, hp]);
                                }
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Width')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .attr('data-property', 'width')
                            .val(scene.pointToString(activePage.getProperty('w')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('w', $(evt.target));
                                _selectSizePreset();
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Height')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .attr('data-property', 'height')
                            .val(scene.pointToString(activePage.getProperty('h')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('h', $(evt.target));
                                _selectSizePreset();
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .attr('colspan', '4')
                        .append($('<h1></h1>')
                            // TODO : I18N
                            .text('Margins'))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Top')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('mt')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('mt', $(evt.target));
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Right')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('mr')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('mr', $(evt.target));
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Left')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('ml')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('ml', $(evt.target));
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Bottom')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('mb')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('mb', $(evt.target));
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .attr('colspan', '4')
                        .append($('<h1></h1>')
                            // TODO : I18N
                            .text('Grid'))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Baseline')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('gb')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('gb', $(evt.target));
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Gutter')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('gw')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('gw', $(evt.target));
                            }))))
                .append($('<tr></tr>')
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Columns')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('gc')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('gc', $(evt.target));
                            })))
                    .append($('<td></td>')
                        .append($('<label></label>')
                            // TODO : I18N
                            .text('Rows')))
                    .append($('<td></td>')
                        .append($('<input>')
                            .val(scene.pointToString(activePage.getProperty('gr')))
                            .exAutoBlur()
                            .on('change', function (evt) {
                                _assignOrResetInputPointProperty('gr', $(evt.target));
                            }))))
            )
            .gDialog({
                // TODO : I18N
                title: 'Page Setup',
                buttons: [
                    {
                        title: GLocale.Constant.Ok,
                        click: function () {
                            var targetValues = [];
                            for (var i = 0; i < pages.length; ++i) {
                                targetValues.push(pages[i].getProperties(propertiesToStore));
                            }

                            var action = function () {
                                // Assign property values to each page now
                                for (var i = 0; i < pages.length; ++i) {
                                    pages[i].setProperties(propertiesToStore, targetValues[i]);
                                }
                            };

                            var revert = function () {
                                // Reset all properties
                                for (var i = 0; i < pages.length; ++i) {
                                    pages[i].setProperties(propertiesToStore, sourceValues[i]);
                                }
                            };

                            var editor = GXEditor.getEditor(scene)
                            if (editor) {
                                // TODO : I18N
                                editor.pushState(action, revert, "Page Settings");
                            } else {
                                action();
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
                            // Reset all properties
                            for (var i = 0; i < pages.length; ++i) {
                                pages[i].setProperties(propertiesToStore, sourceValues[i]);
                            }

                            $(this).gDialog('close');
                        }
                    }
                ]
            })
            .gDialog('open');

        _selectSizePreset();
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
                /*
                 var activePage = gApp.getActiveDocument().getScene().querySingle('page:active');
                 if (activePage) {
                 result.push(activePage);
                 }
                 */
                result = gApp.getActiveDocument().getScene().queryAll('page');
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