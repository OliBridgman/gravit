(function (_) {

    /**
     * Style properties panel
     * @class GStyleProperties
     * @extends GProperties
     * @constructor
     */
    function GStyleProperties() {
        this._elements = [];
    };
    IFObject.inherit(GStyleProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GStyleProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GStyleProperties.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GStyleProperties.prototype._elements = null;

    /** @override */
    GStyleProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === '_sbl') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .gBlendMode()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === '_stop' || property === '_sfop') {
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
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '142px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px',
                    'right': '5px'
                })
                .append(_createInput('_sbl')
                    .css({
                        'width': '100%'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Opacity:')
                .append(_createInput('_stop')
                    .css({
                        'margin-left': '3px',
                        'width': '30px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '86px'
                })
                // TODO : I18N
                .text('Fill:')
                .append(_createInput('_sfop')
                    .css({
                        'margin-left': '3px',
                        'width': '30px'
                    })))
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
                    'left': '5px',
                    'right': '5px'
                })
                .append($('<select></select>')
                    .append($('<option>No Style</option>'))
                    .css({
                        'width': '100%'
                    })))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '5px'
                })
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'New Style')
                    .append($('<span></span>')
                        .addClass('fa fa-plus')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Redefine Style')
                    .append($('<span></span>')
                        .addClass('fa fa-check')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Remove Style Differences')
                    .append($('<span></span>')
                        .addClass('fa fa-remove')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Disconnect Style')
                    .append($('<span></span>')
                        .addClass('fa fa-chain-broken')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Delete Style')
                    .append($('<span></span>')
                        .addClass('fa fa-trash-o')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Set As Default Style')
                    .append($('<span></span>')
                        .addClass('fa fa-thumb-tack'))
                    .on('click', function () {
                        this._document.getScene().getStyleCollection().getFirstChild().assignStyleFrom(this._elements[0]);
                    }.bind(this))));
    };

    /** @override */
    GStyleProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(IFStylable) && elements[i].getStylePropertySets().indexOf(IFStyleDefinition.PropertySet.Style) >= 0) {
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
    GStyleProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._elements[0]) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GStyleProperties.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        var stylable = this._elements[0];

        this._panel.find('[data-property="_sbl"]').val(stylable.getProperty('_sbl'));
        this._panel.find('[data-property="_sfop"]').val(ifUtil.formatNumber(stylable.getProperty('_sfop') * 100, 0));
        this._panel.find('[data-property="_stop"]').val(ifUtil.formatNumber(stylable.getProperty('_stop') * 100, 0));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GStyleProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GStyleProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._elements.length; ++i) {
                this._elements[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Style');
        }
    };

    /** @override */
    GStyleProperties.prototype.toString = function () {
        return "[Object GStyleProperties]";
    };

    _.GStyleProperties = GStyleProperties;
})(this);