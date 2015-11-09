(function (_) {

    /**
     * Page properties panel
     * @class GPageProperties
     * @extends GProperties
     * @constructor
     */
    function GPageProperties() {
    };
    GObject.inherit(GPageProperties, GProperties);

    GPageProperties.SIZE_PRESETS = [
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
    ];

    /**
     * @type {JQuery}
     * @private
     */
    GPageProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GPageProperties.prototype._document = null;

    /**
     * @type {GPage}
     * @private
     */
    GPageProperties.prototype._page = null;

    /** @override */
    GPageProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'msref') {
                return $('<select></select>')
                    .attr('data-property', 'msref')
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === 'size-preset') {
                var result = $('<select></select>')
                    .attr('data-property', 'size-preset')
                    .on('change', function () {
                        var scene = self._document.getScene();
                        var val = $(this).val();
                        if (val.indexOf(',') >= 0) {
                            var val2 = val.split(',');
                            var sz = GPageProperties.SIZE_PRESETS[parseInt(val2[0])].sizes[parseInt(val2[1])];
                            var wp = scene.stringToPoint(sz.width);
                            var hp = scene.stringToPoint(sz.height);
                            self._panel.find('[name="w"]').val(scene.pointToString(wp));
                            self._panel.find('[name="h"]').val(scene.pointToString(hp));
                            self._assignProperties(['w', 'h'], [wp, hp]);
                        }
                    });

                result.append($('<option></option>')
                    .attr('value', 'x')
                    // TODO : I18N
                    .text('Custom Size'));

                for (var i = 0; i < GPageProperties.SIZE_PRESETS.length; ++i) {
                    var group = GPageProperties.SIZE_PRESETS[i];
                    var groupEl = $('<optgroup></optgroup>')
                        .attr('label', group.name);

                    result.append(groupEl);

                    for (var k = 0; k < group.sizes.length; ++k) {
                        var size = group.sizes[k];
                        $('<option></option>')
                            .attr('value', i.toString() + ',' + k.toString())
                            .text(size.name)
                            .appendTo(groupEl);
                    }
                }

                return result;
            } else if (property === 'bck') {
                return $('<div></div>')
                    .attr('data-property', property)
                    .gPatternPicker()
                    .gPatternPicker('types', [null, GColor, GGradient])
                    .on('patternchange', function (evt, pattern, opacity) {
                        if (typeof opacity === 'number') {
                            self._assignProperties([property, 'bop'], [pattern, opacity]);
                        } else {
                            self._assignProperty(property, pattern);
                        }
                    });
            } else if (property === 'w' || property === 'h') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                        self._selectSizePreset();
                    });
            } else if (property === 'bl') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'mt' || property === 'mb' || property === 'ml' || property === 'mr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            var lockMargins = self._panel.find('button[data-lock-margin]').hasClass('g-active');
                            if (lockMargins) {
                                self._assignProperties(['mt', 'mb', 'ml', 'mr'], [value, value, value, value]);
                            } else {
                                self._assignProperty(property, value);
                            }
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '250px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px',
                })
                .append(_createInput('size-preset')
                    .css({
                        'width': '110px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '125px'
                })
                .html('<span class="fa fa-link"></span>')
                .append(_createInput('msref')
                    .css({
                        'margin-left': '5px',
                        'width': '102px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .text('W:')
                .append(_createInput('w')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '65px'
                })
                .text('H:')
                .append(_createInput('h')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '125px'
                })
                .text('Bleed:')
                .append(_createInput('bl')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'right': '5px'
                })
                .append(_createInput('bck')))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '5px',
                    'top': '65px'
                })
                .text('L:')
                .append(_createInput('ml')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '5px',
                    'top': '89px'
                })
                .text('T:')
                .append(_createInput('mt')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '65px',
                    'top': '65px'
                })
                .text('R:')
                .append(_createInput('mr')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '65px',
                    'top': '89px'
                })
                .text('B:')
                .append(_createInput('mb')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<button></button>')
                .css({

                    'position': 'absolute',
                    'left': '123px',
                    'top': '77px',
                    'padding': '0px',
                    'font-size': '10px'
                })
                .on('click', function (evt) {
                    var $me = $(this);
                    $me.toggleClass('g-active', !$me.hasClass('g-active'));
                })
                .addClass('g-flat fa fa-lock g-active')
                // TODO : I18N
                .attr('title', 'Equal Margins')
                .attr('data-lock-margin', ''));
    };

    /** @override */
    GPageProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().removeEventListener(GNode.AfterInsertEvent, this._updatePage, this);
            this._document.getScene().removeEventListener(GNode.AfterRemoveEvent, this._updatePage, this);
            this._document = null;
        }

        this._page = null;
        if (elements.length == 1 && elements[0] instanceof GPage) {
            this._page = elements[0];
        }

        if (this._page) {
            this._document = document;
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().addEventListener(GNode.AfterInsertEvent, this._updatePage, this);
            this._document.getScene().addEventListener(GNode.AfterRemoveEvent, this._updatePage, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPageProperties.prototype._afterPropertiesChange = function (event) {
        if (this._page === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GPageProperties.prototype._updateProperties = function () {
        // We'll always read properties of first page
        var scene = this._document.getScene();

        this._updatePage();

        this._panel.find('select[data-property="msref"]').val(this._page.getProperty('msref'));
        this._panel.find('input[data-property="bl"]').val(this._page.getProperty('bl'));
        this._panel.find('[data-property="bck"]')
            .gPatternPicker('value', this._page.getProperty('bck'))
            .gPatternPicker('opacity', this._page.getProperty('bop'))
            .gPatternPicker('swatches', this._page.getWorkspace().getSwatches());
        this._panel.find('input[data-property="w"]').val(scene.pointToString(this._page.getProperty('w')));
        this._panel.find('input[data-property="h"]').val(scene.pointToString(this._page.getProperty('h')));
        this._panel.find('input[data-property="mt"]').val(scene.pointToString(this._page.getProperty('mt')));
        this._panel.find('input[data-property="mb"]').val(scene.pointToString(this._page.getProperty('mb')));
        this._panel.find('input[data-property="ml"]').val(scene.pointToString(this._page.getProperty('ml')));
        this._panel.find('input[data-property="mr"]').val(scene.pointToString(this._page.getProperty('mr')));

        this._selectSizePreset();
    };

    /**
     * @private
     */
    GPageProperties.prototype._updatePage = function () {
        var scene = this._document.getScene();

        var select = this._panel.find('select[data-property="msref"]');
        var oldVal = select.val();
        select.val(null);
        select.empty();

        $('<option></option>')
            .attr('value', '')
            .text('')
            .appendTo(select);

        // TODO : Add master page references from project

        var project = gApp.getActiveProject();
        var pages = project.getPages();
        for (var i = 0; i < pages.length; ++i) {
            if (pages[i] !== this._page.getReferenceId()) {
                $('<option></option>')
                    .attr('value', pages[i])
                    .text(project.getPageName(pages[i]))
                    .appendTo(select);
            }
        }

        select.val(oldVal);
    };

    GPageProperties.prototype._selectSizePreset = function () {
        var foundPreset = false;
        var presetSelector = this._panel.find('[data-property="size-preset"]');

        var w = this._page.getProperty('w');
        var h = this._page.getProperty('h');

        for (var i = 0; i < GPageProperties.SIZE_PRESETS.length; ++i) {
            var group = GPageProperties.SIZE_PRESETS[i];
            for (var k = 0; k < group.sizes.length; ++k) {
                var size = group.sizes[k];
                var sw = this._page.getScene().stringToPoint(size.width);
                var sh = this._page.getScene().stringToPoint(size.height);
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

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPageProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPageProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            this._page.setProperties(properties, values);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Page Properties');
        }
    };

    /** @override */
    GPageProperties.prototype.toString = function () {
        return "[Object GPageProperties]";
    };

    _.GPageProperties = GPageProperties;
})(this);