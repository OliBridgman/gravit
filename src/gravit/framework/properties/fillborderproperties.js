(function (_) {

    /**
     * Shape properties panel
     * @class GFillBorderProperties
     * @extends GProperties
     * @constructor
     */
    function GFillBorderProperties() {
        this._elements = [];
    };
    GObject.inherit(GFillBorderProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GFillBorderProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GFillBorderProperties.prototype._document = null;

    /**
     * @type {Array<GStylable>}
     * @private
     */
    GFillBorderProperties.prototype._elements = null;

    /** @override */
    GFillBorderProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === '_fpt' || property === '_bpt') {
                return $('<div></div>')
                    .attr('data-property', property)
                    .gPatternPicker()
                    .on('patternchange', function (evt, pattern, opacity) {
                        if (typeof opacity === 'number') {
                            self._assignProperties([property, property === '_fpt' ? '_fop' : '_bop'], [pattern, opacity]);
                        } else {
                            self._assignProperty(property, pattern);
                        }
                    });
            } else if (property === 'fill-type') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .gPatternTypePicker()
                    .on('patterntypechange', function (evt, patternClass) {
                        self._assignProperty('_fpt', GPattern.smartCreate(patternClass, self._panel.find('[data-property="_fpt"]').gPatternPicker('value')));
                        if (patternClass && patternClass !== GBackground) {
                            self._panel.find('[data-property="_fpt"]').gPatternPicker('open');
                        }
                    });
            } else if (property === '_fop') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var opacity = GLength.parseEquationValue($(this).val());
                        if (opacity !== null && opacity >= 0.0 && opacity <= 100) {
                            self._assignProperty(property, opacity / 100);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === '_bw' || property === '_bml') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var value = GLength.parseEquationValue($(this).val());
                        if (value !== null && value >= 0.0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property.indexOf('_ba-') === 0) {
                var icon = '';
                var align = property.substr('_ba-'.length);
                switch (align) {
                    case GStylable.BorderAlignment.Inside:
                        icon = 'gicon-stroke-inside';
                        break;
                    case GStylable.BorderAlignment.Center:
                        icon = 'gicon-stroke-center';
                        break;
                    case GStylable.BorderAlignment.Outside:
                        icon = 'gicon-stroke-outside';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_ba', align);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('_blc-') === 0) {
                var icon = '';
                var cap = property.substr('_blc-'.length);
                switch (cap) {
                    case GPaintCanvas.LineCap.Butt:
                        icon = 'gicon-line-cap-butt';
                        break;
                    case GPaintCanvas.LineCap.Round:
                        icon = 'gicon-line-cap-round';
                        break;
                    case GPaintCanvas.LineCap.Square:
                        icon = 'gicon-line-cap-square';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_blc', cap);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('_blj-') === 0) {
                var icon = '';
                var join = property.substr('_blj-'.length);
                switch (join) {
                    case GPaintCanvas.LineJoin.Bevel:
                        icon = 'gicon-line-join-bevel';
                        break;
                    case GPaintCanvas.LineJoin.Round:
                        icon = 'gicon-line-join-round';
                        break;
                    case GPaintCanvas.LineJoin.Miter:
                        icon = 'gicon-line-join-miter';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_blj', join);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '170px')
            // -- Fill
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append($('<span></span>')
                    .addClass('gicon-fill')
                    .css({
                        'width': '16px',
                        'text-align': 'center'
                    }))
                .append(_createInput('_fpt')
                    .css({
                        'margin-left': '5px',
                        'width': '20px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '50px'
                })
                .append(_createInput('fill-type')
                    .css({
                        'width': '80px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '134px'
                })
                .append(_createInput('_fop')
                    .css({
                        'width': '30px'
                    })))
            // -- Stroke
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .append($('<span></span>')
                    .addClass('gicon-stroke')
                    .css({
                        'width': '16px',
                        'text-align': 'center'
                    }))
                .append(_createInput('_bpt')
                    .css({
                        'margin-left': '5px',
                        'width': '20px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '50px'
                })
                .append(_createInput('_bw')
                    .css({
                        'width': '30px'
                    })))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '86px'
                })
                .append(_createInput('_ba-' + GStylable.BorderAlignment.Inside)
                    // TODO : I18N
                    .attr('title', 'Border Inside'))
                .append(_createInput('_ba-' + GStylable.BorderAlignment.Center)
                    // TODO : I18N
                    .attr('title', 'Border Centered'))
                .append(_createInput('_ba-' + GStylable.BorderAlignment.Outside)
                    // TODO : I18N
                    .attr('title', 'Border Outside')))
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
                    'top': '65px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Ending:'))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '50px'
                })
                .append(_createInput('_blc-' + GPaintCanvas.LineCap.Butt)
                    // TODO : I18N
                    .attr('title', 'Butt'))
                .append(_createInput('_blc-' + GPaintCanvas.LineCap.Round)
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('_blc-' + GPaintCanvas.LineCap.Square)
                    // TODO : I18N
                    .attr('title', 'Square')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Join:'))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '50px'
                })
                .append(_createInput('_blj-' + GPaintCanvas.LineJoin.Bevel)
                    // TODO : I18N
                    .attr('title', 'Bevel'))
                .append(_createInput('_blj-' + GPaintCanvas.LineJoin.Round)
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('_blj-' + GPaintCanvas.LineJoin.Miter)
                    // TODO : I18N
                    .attr('title', 'Miter'))
                .append(_createInput('_bml')
                    // TODO : I18N
                    .attr('title', 'Miter-Limit')
                    .css('width', '30px')));
    };

    /** @override */
    GFillBorderProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(GStylable) && elements[i].getStylePropertySets().indexOf(GStylable.PropertySet.Fill) >= 0) {
                this._elements.push(elements[i]);
            }
        }

        if (this._elements.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
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
    GFillBorderProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._elements[0]) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GFillBorderProperties.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        var stylable = this._elements[0];

        var fillPattern = stylable.getProperty('_fpt');

        this._panel.find('[data-property="_fpt"]')
            .gPatternPicker('value', fillPattern)
            .gPatternPicker('opacity', stylable.getProperty('_fop'))
            .gPatternPicker('scene', scene);

        this._panel.find('[data-property="fill-type"]').gPatternTypePicker('value', !fillPattern ? null : fillPattern.constructor);

        this._panel.find('[data-property="_fop"]').val(GUtil.formatNumber(stylable.getProperty('_fop') * 100, 0));

        this._panel.find('[data-property="_bpt"]')
            .gPatternPicker('value', stylable.getProperty('_bpt'))
            .gPatternPicker('opacity', stylable.getProperty('_bop'))
            .gPatternPicker('scene', scene);

        this._panel.find('[data-property="_bw"]').val(GUtil.formatNumber(stylable.getProperty('_bw')));

        this._panel.find('[data-property^="_ba"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_ba-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_ba') === value);
        });

        this._panel.find('[data-property^="_blc"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_blc-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_blc') === value);
        });

        this._panel.find('[data-property^="_blj"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_blj-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_blj') === value);
        });

        this._panel.find('[data-property="_bml"]')
            .css('display', stylable.getProperty('_blj') === GPaintCanvas.LineJoin.Miter ? '' : ' none')
            .val(GUtil.formatNumber(stylable.getProperty('_bml')));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GFillBorderProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GFillBorderProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._elements.length; ++i) {
                this._elements[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Fill/Border Properties');
        }
    };

    /** @override */
    GFillBorderProperties.prototype.toString = function () {
        return "[Object GFillBorderProperties]";
    };

    _.GFillBorderProperties = GFillBorderProperties;
})(this);