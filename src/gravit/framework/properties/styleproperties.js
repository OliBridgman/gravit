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
    GObject.inherit(GStyleProperties, GProperties);

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
     * @type {Array<GElement>}
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
                    .append($('<option></option>')
                        .attr('value', 'mask')
                        // TODO : I18N
                        .text('Mask'))
                    // TODO : I18N
                    .append($('<optgroup label="Blending"></optgroup>'))
                    .gBlendMode()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === '_stop' || property === '_sfop') {
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
            } else if (property === 'sref') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .append($('<span></span>'))
                    .append($('<span></span>')
                        .addClass('fa fa-caret-down'));
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
                .append(_createInput('sref')
                    .on('click', function (evt) {
                        $('<div></div>')
                            .css({
                                'width': '250px'
                            })
                            .addClass('g-style-list')
                            .gStylePanel()
                            .gStylePanel('attach', this._document.getScene().getStyleCollection())
                            .gOverlay({
                                releaseOnClose: true
                            })
                            .gOverlay('open', evt.target)
                            .on('close', function () {
                                $(this).gStylePanel('detach');
                            })
                            .on('stylechange', function (evt, style) {
                                $(evt.target).gOverlay('close');

                                // TODO : I18N
                                GEditor.tryRunTransaction(this._elements[0], function () {
                                    for (var i = 0; i < this._elements.length; ++i) {
                                        this._elements[i].assignStyleFrom(style);
                                        this._elements[i].setProperty('sref', style.getProperty('_sdf') !== null ? null : style.getReferenceId());
                                    }
                                }.bind(this), 'Disconnect Style');
                            }.bind(this));
                    }.bind(this))
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
                        .addClass('fa fa-plus'))
                    .on('click', function () {
                        var scene = this._document.getScene();
                        var newStyle = new GStyle();
                        newStyle.setProperty('name', 'Style-' + (scene.getStyleCollection().queryCount('> style')).toString());
                        newStyle.setProperty('ps', this._elements[0].getStylePropertySets().slice());
                        newStyle.assignStyleFrom(this._elements[0]);
                        new GStyleDialog(newStyle).open(function (result, assign) {
                            if (result) {
                                // TODO : I18N
                                GEditor.tryRunTransaction(scene, function () {
                                    assign();
                                    scene.getStyleCollection().appendChild(newStyle);
                                    for (var i = 0; i < this._elements.length; ++i) {
                                        this._elements[i].setProperty('sref', newStyle.getReferenceId());
                                    }
                                }.bind(this), 'Add Style');
                            }
                        }.bind(this));
                    }.bind(this)))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Redefine Style')
                    .attr('data-link-action', 'redefine')
                    .append($('<span></span>')
                        .addClass('fa fa-check'))
                    .on('click', function () {
                        var stylesToUpdate = [];
                        for (var i = 0; i < this._elements.length; ++i) {
                            var style = this._elements[i].getReferencedStyle();
                            if (style && stylesToUpdate.indexOf(style) < 0) {
                                stylesToUpdate.push({style: style, element: this._elements[i]});
                            }
                        }

                        if (stylesToUpdate.length) {
                            // TODO : I18N
                            GEditor.tryRunTransaction(stylesToUpdate[0].element, function () {
                                for (var i = 0; i < stylesToUpdate.length; ++i) {
                                    stylesToUpdate[i].style.assignStyleFrom(stylesToUpdate[i].element);
                                }
                            }.bind(this), 'Update Style');
                        }
                    }.bind(this)))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Remove Style Differences')
                    .attr('data-link-action', 'removediff')
                    .append($('<span></span>')
                        .addClass('fa fa-remove'))
                    .on('click', function () {
                        // TODO : I18N
                        GEditor.tryRunTransaction(this._elements[0], function () {
                            for (var i = 0; i < this._elements.length; ++i) {
                                var style = this._elements[i].getReferencedStyle();
                                if (style) {
                                    this._elements[i].assignStyleFrom(style);
                                }
                            }
                        }.bind(this), 'Reset Style');
                    }.bind(this)))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Disconnect Style')
                    .attr('data-link-action', 'disconnect')
                    .append($('<span></span>')
                        .addClass('fa fa-chain-broken'))
                    .on('click', function () {
                        // TODO : I18N
                        GEditor.tryRunTransaction(this._elements[0], function () {
                            for (var i = 0; i < this._elements.length; ++i) {
                                this._elements[i].setProperty('sref', null);
                            }
                        }.bind(this), 'Disconnect Style');
                    }.bind(this)))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Delete Style')
                    .attr('data-link-action', 'delete')
                    .append($('<span></span>')
                        .addClass('fa fa-trash-o'))
                    .on('click', function () {
                        vex.dialog.confirm({
                            // TODO : I18N
                            message: 'Are you sure you want to delete the selected style?',
                            callback: function (value) {
                                if (value) {
                                    var style = this._elements[0].getReferencedStyle();
                                    if (style) {
                                        // TODO : I18N
                                        GEditor.tryRunTransaction(style, function () {
                                            style.disconnectStyle();
                                            style.getParent().removeChild(style);
                                        }, 'Delete Style');
                                    }
                                }
                            }.bind(this)
                        });
                    }.bind(this)))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Set As Default Style')
                    .append($('<span></span>')
                        .addClass('fa fa-thumb-tack'))
                    .on('click', function () {
                        var defStyle = null;
                        if (this._elements[0] instanceof GText) {
                            defStyle = this._document.getScene().getStyleCollection().querySingle('style[_sdf="text"]');
                        } else if (this._elements[0] instanceof GShape) {
                            defStyle = this._document.getScene().getStyleCollection().querySingle('style[_sdf="shape"]');
                        }

                        if (defStyle) {
                            // TODO : I18N
                            GEditor.tryRunTransaction(defStyle, function () {
                                defStyle.assignStyleFrom(this._elements[0]);
                            }.bind(this), 'Change Default Style');
                        }
                    }.bind(this))));
    };

    /** @override */
    GStyleProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(GElement.Stylable) && elements[i].getStylePropertySets().indexOf(GStylable.PropertySet.Style) >= 0) {
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
        var styledElement = this._elements[0];

        this._panel.find('[data-property="_sbl"]').val(styledElement.getProperty('_sbl'));
        this._panel.find('[data-property="_sfop"]').val(GUtil.formatNumber(styledElement.getProperty('_sfop') * 100, 0));
        this._panel.find('[data-property="_stop"]').val(GUtil.formatNumber(styledElement.getProperty('_stop') * 100, 0));

        var style = styledElement.getReferencedStyle();
        // TODO : I18N
        this._panel.find('[data-property="sref"] > :first-child').text(style ? style.getProperty('name') : 'No Style');

        this._panel.find('button[data-link-action]').prop('disabled', !style);
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