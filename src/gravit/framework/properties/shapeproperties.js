(function (_) {

    /**
     * Shape properties panel
     * @class GShapeProperties
     * @extends GProperties
     * @constructor
     */
    function GShapeProperties() {
        this._shapes = [];
    };
    IFObject.inherit(GShapeProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GShapeProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GShapeProperties.prototype._document = null;

    /**
     * @type {Array<IFShape>}
     * @private
     */
    GShapeProperties.prototype._shapes = null;

    /** @override */
    GShapeProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'fpt' || property === 'spt') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .gColorButton({
                        allowClear: true
                    })
                    .on('colorchange', function (evt, color) {
                        self._assignStyleProperty(property, color);
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
            } else if (property === 'opc') {
                return $('<input>');
            } else if (property === 'sw') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var strokeWidth = IFLength.parseEquationValue($(this).val());
                        if (strokeWidth !== null && strokeWidth >= 0.0) {
                            self._assignStyleProperty(property, strokeWidth);
                        } else {
                            self._updateStyleProperties();
                        }
                    });
            } else if (property.indexOf('sa-') === 0) {
                var icon = '';
                var align = property.substr('sa-'.length);
                switch (align) {
                    case 'i':
                        icon = 'gicon-stroke-inside';
                        break;
                    case 'c':
                        icon = 'gicon-stroke-center';
                        break;
                    case 'o':
                        icon = 'gicon-stroke-outside';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignStyleProperty(property, align);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('lc-') === 0) {
                var icon = '';
                var cap = property.substr('lc-'.length);
                switch (cap) {
                    case 'b':
                        icon = 'gicon-line-cap-butt';
                        break;
                    case 'r':
                        icon = 'gicon-line-cap-round';
                        break;
                    case 's':
                        icon = 'gicon-line-cap-square';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignStyleProperty(property, cap);
                    })
                    .append($('<span></span>')
                        .addClass(icon));
            } else if (property.indexOf('lj-') === 0) {
                var icon = '';
                var join = property.substr('lj-'.length);
                switch (join) {
                    case 'b':
                        icon = 'gicon-line-join-bevel';
                        break;
                    case 'r':
                        icon = 'gicon-line-join-round';
                        break;
                    case 'm':
                        icon = 'gicon-line-join-miter';
                        break;
                    default:
                        break;
                }

                return $('<button></button>')
                    .attr('data-property', property)
                    .on('click', function () {
                        self._assignStyleProperty(property, join);
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
                .append(_createInput('fpt')
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
                .append(_createInput('opc')
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
                .append(_createInput('spt')
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
                .append(_createInput('sw')
                    .css({
                        'width': '30px'
                    })))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '86px'
                })
                .append(_createInput('sa-' + 'i')
                    // TODO : I18N
                    .attr('title', 'Stroke Inside'))
                .append(_createInput('sa-' + 'c')
                    // TODO : I18N
                    .attr('title', 'Stroke Centered'))
                .append(_createInput('sa-' + 'o')
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
                .append(_createInput('lc-' + 'b')
                    // TODO : I18N
                    .attr('title', 'Bevel'))
                .append(_createInput('lc-' + 'r')
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('lc-' + 's')
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
                .append(_createInput('lj-' + 'b')
                    // TODO : I18N
                    .attr('title', 'Bevel'))
                .append(_createInput('lj-' + 'r')
                    // TODO : I18N
                    .attr('title', 'Round'))
                .append(_createInput('lj-' + 'm')
                    // TODO : I18N
                    .attr('title', 'Miter')));
    };

    /** @override */
    GShapeProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all shape elements
        this._shapes = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFShape) {
                this._shapes.push(elements[i]);
            }
        }

        if (this._shapes.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateStyleProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GShapeProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._shapes[0].getStyle()) {
            this._updateStyleProperties();
        }
    };

    /**
     * @private
     */
    GShapeProperties.prototype._updateStyleProperties = function () {
        var scene = this._document.getScene();
        var style = this._shapes[0].getStyle();

        this._panel.find('[data-property="fpt"]')
            .gColorButton('value', style.getProperty('fpt'))
            .gColorButton('scene', scene);

        this._panel.find('[data-property="spt"]')
            .gColorButton('value', style.getProperty('spt'))
            .gColorButton('scene', scene);

        this._panel.find('[data-property="sw"]').val(ifUtil.formatNumber(style.getProperty('sw')));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GShapeProperties.prototype._assignStyleProperty = function (property, value) {
        this._assignStyleProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GShapeProperties.prototype._assignStyleProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._shapes.length; ++i) {
                this._shapes[i].getStyle().setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Style Properties');
        }
    };

    /** @override */
    GShapeProperties.prototype.toString = function () {
        return "[Object GShapeProperties]";
    };

    _.GShapeProperties = GShapeProperties;
})(this);