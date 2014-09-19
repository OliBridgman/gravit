(function (_) {

    /**
     * Shape properties panel
     * @class GFillStrokeProperties
     * @extends GProperties
     * @constructor
     */
    function GFillStrokeProperties() {
        this._elements = [];
    };
    IFObject.inherit(GFillStrokeProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GFillStrokeProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GFillStrokeProperties.prototype._document = null;

    /**
     * @type {Array<IFStylable>}
     * @private
     */
    GFillStrokeProperties.prototype._elements = null;

    /** @override */
    GFillStrokeProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === '_fpt' || property === '_spt') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .gColorButton({
                        allowClear: true
                    })
                    .on('colorchange', function (evt, color) {
                        self._assignProperty(property, color);
                    });
            } else if (property === 'tp') {
                return $('<select></select>')
                    .append($('<option></option>')
                        .text('None'))
                    .append($('<option></option>')
                        .text('Color'))
                    .append($('<option></option>')
                        .text('Linear'))
                    .append($('<option></option>')
                        .text('Radial'))
                    .append($('<option></option>')
                        .text('Texture'))
                    .append($('<option></option>')
                        .text('Noise'));
            } else if (property === '_fop') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var opacity = IFLength.parseEquationValue($(this).val());
                        if (opacity !== null && opacity >= 0.0 && opacity <= 100) {
                            self._assignProperty(property, opacity / 100);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === '_sw') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var strokeWidth = IFLength.parseEquationValue($(this).val());
                        if (strokeWidth !== null && strokeWidth >= 0.0) {
                            self._assignProperty(property, strokeWidth);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property.indexOf('_sa-') === 0) {
                var icon = '';
                var align = property.substr('_sa-'.length);
                switch (align) {
                    case IFStyle.StrokeAlignment.Inside:
                        icon = 'gicon-stroke-inside';
                        break;
                    case IFStyle.StrokeAlignment.Center:
                        icon = 'gicon-stroke-center';
                        break;
                    case IFStyle.StrokeAlignment.Outside:
                        icon = 'gicon-stroke-outside';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_sa', align);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('_slc-') === 0) {
                var icon = '';
                var cap = property.substr('_slc-'.length);
                switch (cap) {
                    case IFPaintCanvas.LineCap.Butt:
                        icon = 'gicon-line-cap-butt';
                        break;
                    case IFPaintCanvas.LineCap.Round:
                        icon = 'gicon-line-cap-round';
                        break;
                    case IFPaintCanvas.LineCap.Square:
                        icon = 'gicon-line-cap-square';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_slc', cap);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('_slj-') === 0) {
                var icon = '';
                var join = property.substr('_slj-'.length);
                switch (join) {
                    case IFPaintCanvas.LineJoin.Bevel:
                        icon = 'gicon-line-join-bevel';
                        break;
                    case IFPaintCanvas.LineJoin.Round:
                        icon = 'gicon-line-join-round';
                        break;
                    case IFPaintCanvas.LineJoin.Miter:
                        icon = 'gicon-line-join-miter';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignProperty('_slj', join);
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
                .append(_createInput('tp')
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
                .append(_createInput('_spt')
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
                .append(_createInput('_sw')
                    .css({
                        'width': '30px'
                    })))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '86px'
                })
                .append(_createInput('_sa-' + IFStyle.StrokeAlignment.Inside)
                    // TODO : I18N
                    .attr('title', 'Stroke Inside'))
                .append(_createInput('_sa-' + IFStyle.StrokeAlignment.Center)
                    // TODO : I18N
                    .attr('title', 'Stroke Centered'))
                .append(_createInput('_sa-' + IFStyle.StrokeAlignment.Outside)
                    // TODO : I18N
                    .attr('title', 'Stroke Outside')))
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
                    'right': '86px'
                })
                // TODO : I18N
                .text('Ending:'))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'right': '5px'
                })
                .append(_createInput('_slc-' + IFPaintCanvas.LineCap.Butt)
                    // TODO : I18N
                    .attr('title', 'Butt'))
                .append(_createInput('_slc-' + IFPaintCanvas.LineCap.Round)
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('_slc-' + IFPaintCanvas.LineCap.Square)
                    // TODO : I18N
                    .attr('title', 'Square')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'right': '86px'
                })
                // TODO : I18N
                .text('Join:'))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'right': '5px'
                })
                .append(_createInput('_slj-' + IFPaintCanvas.LineJoin.Bevel)
                    // TODO : I18N
                    .attr('title', 'Bevel'))
                .append(_createInput('_slj-' + IFPaintCanvas.LineJoin.Round)
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('_slj-' + IFPaintCanvas.LineJoin.Miter)
                    // TODO : I18N
                    .attr('title', 'Miter')));
    };

    /** @override */
    GFillStrokeProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(IFStylable) && elements[i].getStylePropertySets().indexOf(IFStyle.PropertySet.Fill) >= 0) {
                this._elements.push(elements[i]);
            }
        }

        if (this._elements.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
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
    GFillStrokeProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._elements[0]) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GFillStrokeProperties.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        var stylable = this._elements[0];

        this._panel.find('[data-property="_fpt"]')
            .gColorButton('value', stylable.getProperty('_fpt'))
            .gColorButton('scene', scene);

        this._panel.find('[data-property="_fop"]').val(ifUtil.formatNumber(stylable.getProperty('_fop') * 100, 0));

        this._panel.find('[data-property="_spt"]')
            .gColorButton('value', stylable.getProperty('_spt'))
            .gColorButton('scene', scene);

        this._panel.find('[data-property="_sw"]').val(ifUtil.formatNumber(stylable.getProperty('_sw')));

        this._panel.find('[data-property^="_sa"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_sa-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_sa') === value);
        });

        this._panel.find('[data-property^="_slc"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_slc-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_slc') === value);
        });

        this._panel.find('[data-property^="_slj"]').each(function (index, element) {
            var $element = $(element);
            var value = $element.attr('data-property').substr('_slj-'.length);
            $element.toggleClass('g-active', stylable.getProperty('_slj') === value);
        });
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GFillStrokeProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GFillStrokeProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._elements.length; ++i) {
                this._elements[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Fill/Stroke Properties');
        }
    };

    /** @override */
    GFillStrokeProperties.prototype.toString = function () {
        return "[Object GFillStrokeProperties]";
    };

    _.GFillStrokeProperties = GFillStrokeProperties;
})(this);