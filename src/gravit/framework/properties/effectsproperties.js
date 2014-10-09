(function (_) {

    var EFFECTS = [
        {
            clazz: IFBlurEffect,
            group: 'raster',
            // TODO : I18N
            title: 'Blur'
        },
        {
            clazz: IFDropShadowEffect,
            group: 'raster',
            // TODO : I18N
            title: 'Drop Shadow'
        },
        {
            clazz: IFInnerShadowEffect,
            group: 'raster',
            // TODO : I18N
            title: 'Inner Shadow'
        }
    ];

    /**
     * Effects properties panel
     * @class GEffectProperties
     * @extends GProperties
     * @constructor
     */
    function GEffectProperties() {
        this._elements = [];
    };
    IFObject.inherit(GEffectProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GEffectProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GEffectProperties.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GEffectProperties.prototype._elements = null;

    /** @override */
    GEffectProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createEffectItem = function (effect) {
            var item = new GMenuItem();
            item.setCaption(effect.title);
            item.addEventListener(GMenuItem.ActivateEvent, function () {
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    for (var i = 0; i < this._elements.length; ++i) {
                        this._elements[i].getEffects().appendChild(new effect.clazz());
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Add Effect');
                }
            }, this);
            return item;
        }.bind(this);

        var effectMenu = new GMenu();
        var lastGroup = null;
        for (var i = 0; i < EFFECTS.length; ++i) {
            var effect = EFFECTS[i];
            if (lastGroup && effect.group !== lastGroup) {
                effectMenu.addItem(new GMenuItem(GMenuItem.Type.Divider));
                lastGroup = effect.group;
            }

            effectMenu.addItem(_createEffectItem(effect));
        }

        panel
            .css('width', '150px')
            .append($('<div></div>')
                .addClass('g-list')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px',
                    'right': '5px',
                    'bottom': '30px'
                }))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'right': '5px',
                    'bottom': '5px'
                })
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-plus')
                        .gMenuButton({
                            menu: effectMenu,
                            arrow: false
                        })))
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-trash-o'))));
    };

    /** @override */
    GEffectProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(IFStylable) && elements[i].getStylePropertySets().indexOf(IFStylable.PropertySet.Effects) >= 0) {
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
    GEffectProperties.prototype._afterPropertiesChange = function (event) {
        // TODO
    };

    /**
     * @private
     */
    GEffectProperties.prototype._updateProperties = function () {
        // TODO
        var element = this._elements[0];
        var list = this._panel.find('.g-list');
        list.empty();
        for (var child = element.getEffects().getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFEffect) {
                $('<div></div>')
                    .text(child.getNodeNameTranslated())
                    .appendTo(list);
            }
        }
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GEffectProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GEffectProperties.prototype._assignProperties = function (properties, values) {
        /* TODO
         var editor = this._document.getEditor();
         editor.beginTransaction();
         try {
         for (var i = 0; i < this._elements.length; ++i) {
         this._elements[i].setProperties(properties, values);
         }
         } finally {
         // TODO : I18N
         editor.commitTransaction('Modify Ellipse Properties');
         }*/
    };

    /** @override */
    GEffectProperties.prototype.toString = function () {
        return "[Object GEffectProperties]";
    };

    _.GEffectProperties = GEffectProperties;
})(this);