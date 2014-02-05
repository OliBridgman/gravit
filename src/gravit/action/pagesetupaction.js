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
            var title = dialog.find('[name="title"]').val();
            if (title !== "") {
                if (pages.length === 1) {
                    _assignPagesProperties(['title'], [title]);
                } else {
                    var mode = dialog.find('[name="title-mode"]:checked').val();
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

        var _selectSizePreset = function () {
            var foundPreset = false;
            var presetSelector = dialog.find('[name="size-preset"]');

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
            .gForm({
                sections: [
                    {
                        rows: [
                            {
                                // TODO : I18N
                                label: 'Title',
                                stretch: true,
                                input: {
                                    type: 'text',
                                    name: 'title',
                                    width: '100%',
                                    value: activePage.getProperty('title'),
                                    onInput: _updatePageTitles
                                }
                            },
                            {
                                stretch: true,
                                input: function () {
                                    var result = [];
                                    var modes = ['ignore', 'append', 'prepend', 'replace'];
                                    // TODO : I18N
                                    var titles = ['Ignore', 'Append', 'Prepend', 'Replace'];
                                    for (var i = 0; i < modes.length; ++i) {
                                        result.push({
                                            type: 'check',
                                            name: 'title-mode',
                                            unique: true,
                                            label: titles[i],
                                            value: modes[i],
                                            checked: i === 0,
                                            available: pages.length > 1,
                                            onChange: _updatePageTitles
                                        });
                                    }
                                    return result;
                                }
                            },
                            [
                                {
                                    // TODO : I18N
                                    label: 'Bleed',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('bl')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('bl', $(this));
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Color',
                                    input: {
                                        type: 'color',
                                        value: activePage.getProperty('color'),
                                        onChange: function (evt, color) {
                                            _assignPagesProperties(['color'], [color ? color.asString() : null]);
                                        }
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        // TODO : I18N
                        label: 'Dimensions',
                        rows: [
                            {
                                stretch: true,
                                input: {
                                    type: 'select',
                                    name: 'size-preset',
                                    width: '100%',
                                    options: function () {
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
                                    },
                                    onChange: function () {
                                        var val = $(this).val();
                                        if (val.indexOf(',') >= 0) {
                                            var val2 = val.split(',');
                                            var sz = GPageSetupAction.options.sizePresets[parseInt(val2[0])].sizes[parseInt(val2[1])];
                                            var wp = scene.stringToPoint(sz.width);
                                            var hp = scene.stringToPoint(sz.height);
                                            dialog.find('[name="width"]').val(scene.pointToString(wp));
                                            dialog.find('[name="height"]').val(scene.pointToString(hp));
                                            _assignPagesProperties(['w', 'h'], [wp, hp]);
                                        }
                                    }
                                }
                            },
                            [
                                {
                                    // TODO : I18N
                                    label: 'Width',
                                    input: {
                                        type: 'text',
                                        name: 'width',
                                        value: scene.pointToString(activePage.getProperty('w')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('w', $(this));
                                            _selectSizePreset();
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Height',
                                    input: {
                                        type: 'text',
                                        name: 'height',
                                        value: scene.pointToString(activePage.getProperty('h')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('h', $(this));
                                            _selectSizePreset();
                                        }
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        // TODO : I18N
                        label: 'Margins',
                        checkable: true,
                        rows: [
                            [
                                {
                                    // TODO : I18N
                                    label: 'Top',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('mt')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('mt', $(this));
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Right',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('mr')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('mr', $(this));
                                        }
                                    }
                                }
                            ],
                            [
                                {
                                    // TODO : I18N
                                    label: 'Left',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('ml')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('ml', $(this));
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Bottom',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('mb')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('mb', $(this));
                                        }
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        // TODO : I18N
                        label: 'Grid',
                        rows: [
                            [
                                {
                                    // TODO : I18N
                                    label: 'Baseline',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('gb')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('gb', $(this));
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Gutter',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('gw')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('gw', $(this));
                                        }
                                    }
                                }
                            ],
                            [
                                {
                                    // TODO : I18N
                                    label: 'Columns',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('gc')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('gc', $(this));
                                        }
                                    }
                                },
                                {
                                    // TODO : I18N
                                    label: 'Rows',
                                    input: {
                                        type: 'text',
                                        value: scene.pointToString(activePage.getProperty('gr')),
                                        onChange: function () {
                                            _assignOrResetInputPointProperty('gr', $(this));
                                        }
                                    }
                                }
                            ]
                        ]
                    }
                ]

            })
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