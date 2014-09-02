(function (_) {

    /**
     * Shape properties panel
     * @class GShapeAttrProperties
     * @extends GProperties
     * @constructor
     */
    function GShapeAttrProperties() {
        this._shapes = [];
    };
    IFObject.inherit(GShapeAttrProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GShapeAttrProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GShapeAttrProperties.prototype._document = null;

    /**
     * @type {Array<IFShape>}
     * @private
     */
    GShapeAttrProperties.prototype._shapes = null;

    /** @override */
    GShapeAttrProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'pat') {
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
            } else if (property === 'opc') {
                return $('<input>');
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
                        self._assignProperty(property, align);
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
                        self._assignProperty(property, cap);
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
                        self._assignProperty(property, join);
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
                    .addClass('fa fa-tint')
                    .css({
                        'width': '16px',
                        'text-align': 'center'
                    }))
                .append(_createInput('pat')
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
                    .addClass('fa fa-pencil')
                    .css({
                        'width': '16px',
                        'text-align': 'center'
                    }))
                .append(_createInput('pat')
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
                .append(_createInput('opc')
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
                    'right': '5px'
                })
                // TODO : I18N
                .text('Ending:')
                .append($('<div></div>')
                    .css({
                        'display': 'inline-block',
                        'margin-left': '3px'
                    })
                    .append(_createInput('lc-' + 'b')
                        // TODO : I18N
                        .attr('title', 'Bevel'))
                    .append(_createInput('lc-' + 'r')
                        // TODO : I18N
                        .attr('title', 'Round'))
                    .append(_createInput('lc-' + 's')
                        // TODO : I18N
                        .attr('title', 'Square'))))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Join:')
                .append($('<div></div>')
                    .css({
                        'display': 'inline-block',
                        'margin-left': '3px'
                    })
                    .append(_createInput('lj-' + 'b')
                        // TODO : I18N
                        .attr('title', 'Bevel'))
                    .append(_createInput('lj-' + 'r')
                        // TODO : I18N
                        .attr('title', 'Round'))
                    .append(_createInput('lj-' + 'm')
                        // TODO : I18N
                        .attr('title', 'Miter'))));
    };

    /** @override */
    GShapeAttrProperties.prototype.update = function (document, elements) {
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
    GShapeAttrProperties.prototype._afterPropertiesChange = function (event) {
        // TODO
    };

    /**
     * @private
     */
    GShapeAttrProperties.prototype._updateProperties = function () {
        // TODO
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GShapeAttrProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GShapeAttrProperties.prototype._assignProperties = function (properties, values) {
        /* TODO
         var editor = this._document.getEditor();
         editor.beginTransaction();
         try {
         for (var i = 0; i < this._shapes.length; ++i) {
         this._shapes[i].setProperties(properties, values);
         }
         } finally {
         // TODO : I18N
         editor.commitTransaction('Modify Ellipse Properties');
         }*/
    };

    /** @override */
    GShapeAttrProperties.prototype.toString = function () {
        return "[Object GShapeAttrProperties]";
    };

    _.GShapeAttrProperties = GShapeAttrProperties;
})(this);