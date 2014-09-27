(function (_) {

    /**
     * Text properties panel
     * @class GTextProperties
     * @extends GProperties
     * @constructor
     */
    function GTextProperties() {
        this._text = [];
    };
    IFObject.inherit(GTextProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GTextProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GTextProperties.prototype._document = null;

    /**
     * @type {Array<IFText>}
     * @private
     */
    GTextProperties.prototype._text = null;

    /**
     * @type {IFTextEditor}
     * @private
     */
    GTextProperties.prototype._textEditor = null;

    /** @override */
    GTextProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property.indexOf('va-') === 0) {
                var icon = '';
                var align = property.substr('va-'.length);
                switch (align) {
                    case IFText.VerticalAlign.Top:
                        icon = 'fa-align-right fa-rotate-270';
                        break;
                    case IFText.VerticalAlign.Middle:
                        icon = 'fa-align-center fa-rotate-270';
                        break;
                    case IFText.VerticalAlign.Bottom:
                        icon = 'fa-align-left fa-rotate-270';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('va', align);
                    })
                    .append($('<span></span>')
                        .addClass('fa ' + icon));
            } else if (property.indexOf('_pal-') === 0) {
                var iconName = '';
                var alignment = property.substr('_pal-'.length);
                switch (alignment) {
                    case IFStylable.ParagraphAlignment.Left:
                        iconName = 'left';
                        break;
                    case IFStylable.ParagraphAlignment.Center:
                        iconName = 'center';
                        break;
                    case IFStylable.ParagraphAlignment.Right:
                        iconName = 'right';
                        break;
                    case IFStylable.ParagraphAlignment.Justify:
                        iconName = 'justify';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_pal', $(this).hasClass('g-active') ? null : alignment);
                    })
                    .append($('<span></span>')
                        .addClass('fa fa-align-' + iconName));
            } else if (property === 'aw' || property === 'ah') {
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-property', property)
                    .on('change', function () {
                        self._assignProperty(property, $(this).is(':checked'));
                    });
            } else if (property === '_tff') {
                var select = $('<select></select>')
                    .attr('data-property', property)
                    .append(
                        $('<option></option>')
                            .attr('value', '')
                            .text(''))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });

                // TODO : Group local & most used fonts first
                var optGroups = {};

                // Add typefaces
                var families = ifFont.getFamilies();
                for (var i = 0; i < families.length; ++i) {
                    var category = ifFont.getCategory(families[i]);
                    var optGroup = null;
                    if (optGroups.hasOwnProperty(category)) {
                        optGroup = optGroups[category];
                    } else {
                        optGroups[category] = optGroup = $('<optgroup></optgroup>')
                            .attr('label', ifLocale.get(IFFont.CategoryName[category]))
                            .appendTo(select);
                    }

                    $('<option></option>')
                        .attr('value', families[i])
                        .text(families[i])
                        .appendTo(optGroup);
                }

                return select;
            } else if (property === '_tfi' || property === '_tws' || property === '_tcs' || property === '_pin' || property === '_pcg') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value === null || (typeof value === 'number' && value >= 0)) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === '_tfw') {
                var select = $('<select></select>')
                    .attr('data-property', property)
                    .append(
                        $('<option></option>')
                            .attr('value', '')
                            .text(''))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });

                for (var i = 100; i <= 900; i += 100) {
                    $('<option></option>')
                        .attr('value', i)
                        .text(ifLocale.get(IFFont.WeightName[i]))
                        .appendTo(select);
                }

                return select;
            } else if (property === '_tfs') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', '')
                        .text(''))
                    .append($('<option></option>')
                        .attr('value', IFFont.Style.Normal)
                        // TODO : I18N
                        .text('Normal'))
                    .append($('<option></option>')
                        .attr('value', IFFont.Style.Italic)
                        // TODO : I18N
                        .text('Italic'))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === 'fc') {
                return $('<div></div>')
                    .attr('data-property', property)
                    .gColorButton({
                        allowClear: true,
                        scene: this._document.getScene()
                    })
                    .on('colorchange', function (evt, color) {
                        self._assignProperty(property, color);
                    });
            } else if (property === '_pwm') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', '')
                        .text(''))
                    .append($('<option></option>')
                        .attr('value', IFStylable.ParagraphWrapMode.None)
                        // TODO : I18N
                        .text('None'))
                    .append($('<option></option>')
                        .attr('value', IFStylable.ParagraphWrapMode.Words)
                        // TODO : I18N
                        .text('Words'))
                    .append($('<option></option>')
                        .attr('value', IFStylable.ParagraphWrapMode.All)
                        // TODO : I18N
                        .text('All'))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === '_plh') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = $(this).val();
                        value = !value || value === "" ? null : IFLength.parseEquationValue(value);
                        if (value === null || value > 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === '_pcc') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = $(this).val();
                        value = !value || value === "" ? null : parseInt(value);
                        if (value === null || value > 1) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '320px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append(_createInput('_tff')
                    .css({
                        'width': '120px'
                    }))
                .append(_createInput('_tfw')
                    .css({
                        'width': '83px'
                    }))
                .append(_createInput('_tfs')
                    .css({
                        'width': '65px'
                    }))
                .append(_createInput('_tfi')
                    .css({
                        'width': '30px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .html('<span class="fa fa-text-width"></span>')
                .append(_createInput('_tcs')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Character Spacing')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '60px'
                })
                .html('<span class="fa fa-text-width"></span>')
                .append(_createInput('_tws')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Word Spacing')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '115px'
                })
                .html('<span class="fa fa-text-height"></span>')
                .append(_createInput('_plh')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Line Height')))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '215px'
                })
                .append(_createInput('_pal-' + IFStylable.ParagraphAlignment.Left)
                    // TODO : I18N
                    .attr('title', 'Align Left'))
                .append(_createInput('_pal-' + IFStylable.ParagraphAlignment.Center)
                    // TODO : I18N
                    .attr('title', 'Align Centered'))
                .append(_createInput('_pal-' + IFStylable.ParagraphAlignment.Right)
                    // TODO : I18N
                    .attr('title', 'Align Right'))
                .append(_createInput('_pal-' + IFStylable.ParagraphAlignment.Justify)
                    // TODO : I18N
                    .attr('title', 'Justify')))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                .append(_createInput('va-' + IFText.VerticalAlign.Top)
                    // TODO : I18N
                    .attr('title', 'Align Top'))
                .append(_createInput('va-' + IFText.VerticalAlign.Middle)
                    // TODO : I18N
                    .attr('title', 'Align Middle'))
                .append(_createInput('va-' + IFText.VerticalAlign.Bottom)
                    // TODO : I18N
                    .attr('title', 'Align Bottom')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '85px'
                })
                .html('<span class="fa fa-sort-alpha-asc"></span>')
                .append(_createInput('_pwm')
                    .css({
                        'margin-left': '5px',
                        'width': '60px'
                    })
                    // TODO : I18N
                    .attr('title', 'Wrap Mode')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Auto Height:')
                .append(_createInput('ah')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '5px'
                })
                .html('<span class="fa fa-indent"></span>')
                .append(_createInput('_pin')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Indent')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '60px'
                })
                .html('<span class="fa fa-reorder fa-rotate-270"></span>')
                .append(_createInput('_pcc')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Columns')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '115px'
                })
                .html('<span class="fa fa-sort-amount-desc fa-rotate-270"></span>')
                .append(_createInput('_pcg')
                    .css({
                        'margin-left': '5px',
                        'width': '30px'
                    })
                    // TODO : I18N
                    .attr('title', 'Columns Gap')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Auto Width:')
                .append(_createInput('aw')));
    };

    /** @override */
    GTextProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getEditor().removeEventListener(IFEditor.InlineEditorEvent, this._inlineEditorEvent);
            this._document = null;
        }

        // Collect all text elements
        this._text = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFText) {
                this._text.push(elements[i]);
            }
        }

        if (this._text.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getEditor().addEventListener(IFEditor.InlineEditorEvent, this._inlineEditorEvent, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GTextProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first text has changed then update ourself
        if (this._text.length > 0 && (this._text[0] === event.node || this._text[0].getContent() === event.node)) {
            this._updateProperties();
        }
    };

    /**
     * @param {IFEditor.InlineEditorEvent} event
     * @private
     */
    GTextProperties.prototype._inlineEditorEvent = function (event) {
        switch (event.type) {
            case IFEditor.InlineEditorEvent.Type.AfterOpen:
                this._textEditor = event.editor;
                this._updateProperties();
                break;
            case IFEditor.InlineEditorEvent.Type.AfterClose:
                this._textEditor = null;
                this._updateProperties();
                break;
            case IFEditor.InlineEditorEvent.Type.SelectionChanged:
                this._updateProperties();
                break;
            default:
                break;
        }
    };

    /**
     * Defaults to false.
     * @private
     */
    GTextProperties.prototype._updateProperties = function () {
        // Read properties from active editor or first text' editor
        var propertySource = this._textEditor ? this._textEditor : IFElementEditor.getEditor(this._text[0]);

        // Text
        this._panel.find('button[data-property^="va"]').each(function (index, element) {
            var $element = $(element);
            var disabled = this._textEditor && this._textEditor.isInlineEdit() ? true : false;
            $element
                .prop('disabled', disabled)
                .toggleClass('g-active', disabled ? false : ($element.attr('data-property') === 'va-' + propertySource.getProperty('va')));
        }.bind(this));

        this._panel.find('input[data-property="ah"]')
            .prop('disabled', this._textEditor && this._textEditor.isInlineEdit())
            .prop('checked', propertySource.getProperty('ah'));

        this._panel.find('input[data-property="aw"]')
            .prop('disabled', this._textEditor && this._textEditor.isInlineEdit())
            .prop('checked', propertySource.getProperty('aw'));

        // Block
        var fontFamily = propertySource.getProperty('_tff', true);

        this._panel.find('select[data-property="_tff"]').val(propertySource.getProperty('_tff'));
        this._panel.find('input[data-property="_tfi"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('_tfi')));

        var weightSelect = this._panel.find('select[data-property="_tfw"]');
        weightSelect.val(propertySource.getProperty('_tfw'));
        var fontWeights = ifFont.getWeights(fontFamily);
        for (var i = 100; i <= 900; i += 100) {
            weightSelect.find('[value="' + i + '"]').prop('disabled', !fontWeights || fontWeights.indexOf(i) < 0);
        }

        var styleSelect = this._panel.find('select[data-property="_tfs"]');
        styleSelect.val(propertySource.getProperty('_tfs'));
        var fontStyles = ifFont.getStyles(fontFamily);
        styleSelect.find('option').each(function (index, option) {
            var $option = $(option);
            var value = $option.attr('value');
            if (value !== '') {
                $option.prop('disabled', fontStyles && fontStyles.indexOf(value) < 0);
            }
        });

        this._panel.find('input[data-property="_tws"]').val(
            this._document.getScene().pointToString(propertySource.getProperty('_tws')));
        this._panel.find('input[data-property="_tcs"]').val(
            this._document.getScene().pointToString(propertySource.getProperty('_tcs')));


        // Paragraph
        this._panel.find('input[data-property="_pcc"]').val(propertySource.getProperty('_pcc'));
        this._panel.find('input[data-property="_pcg"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('_pcg')));

        var alignVal = propertySource.getProperty('_pal') || '';
        this._panel.find('button[data-property^="_pal"]').each(function (index, element) {
            var $element = $(element);
            $element.toggleClass('g-active', $element.attr('data-property') === '_pal-' + alignVal);
        });

        this._panel.find('select[data-property="_pwm"]').val(propertySource.getProperty('_pwm'));

        this._panel.find('input[data-property="_pin"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('_pin')));

        var lh = propertySource.getProperty('_plh');
        this._panel.find('input[data-property="_plh"]').val(lh !== null ? ifUtil.formatNumber(lh) : "");
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GTextProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GTextProperties.prototype._assignProperties = function (properties, values) {
        if (this._textEditor) {
            this._textEditor.setProperties(properties, values);
        } else {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                for (var i = 0; i < this._text.length; ++i) {
                    var textEditor = IFElementEditor.getEditor(this._text[i]);
                    textEditor.setProperties(properties, values);
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Modify Text Properties');
            }
        }
    };

    /** @override */
    GTextProperties.prototype.toString = function () {
        return "[Object GTextProperties]";
    };

    _.GTextProperties = GTextProperties;
})(this);