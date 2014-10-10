(function (_) {

    function createShadowSettings(effect, assign) {
        var scene = effect.getScene();

        var x = scene.pointToString(effect.getProperty('x'));
        var y = scene.pointToString(effect.getProperty('y'));
        var radius = scene.pointToString(effect.getProperty('r'));
        var color = effect.getProperty('cls');
        var opacity = Math.round(effect.getProperty('opc') * 100);

        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .val(x)
                        .on('change', function () {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number') {
                                assign(['x'], [value]);
                            }
                        }))
                    .append($('<label></label>')
                        .text('X')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .val(y)
                        .on('change', function () {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number') {
                                assign(['y'], [value]);
                            }
                        }))
                    .append($('<label></label>')
                        .text('Y')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .val(radius)
                        .on('change', function () {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number' && value >= 0) {
                                assign(['r'], [value]);
                            }
                        }))
                    .append($('<label></label>')
                        .text('Blur')))
                .append($('<div></div>')
                    .css('text-align', 'center')
                    .append($('<button></button>')
                        .gPatternPicker()
                        .gPatternPicker('types', [IFColor])
                        .gPatternPicker('scene', scene)
                        .gPatternPicker('value', color)
                        .on('patternchange', function (evt, color) {
                            assign(['cls'], [color]);
                        }))
                    .append($('<label></label>')
                        .text('Color')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .val(opacity)
                        .on('change', function () {
                            var value = parseInt($(this).val());
                            if (!isNaN(value) && value >= 0 && value <= 100) {
                                assign(['opc'], [value / 100.0]);
                            }
                        }))
                    .append($('<label></label>')
                        .text('Opacity'))));
    };

    var EFFECTS = [
        {
            clazz: IFBlurEffect,
            group: 'raster',
            createSettings: function (effect, assign) {
                var scene = effect.getScene();
                var radius = scene.pointToString(effect.getProperty('r'));

                return $('<div></div>')
                    .append($('<input>')
                        .attr('type', 'range')
                        .attr('min', '0')
                        .attr('max', '50')
                        .attr('data-property', 'r')
                        .val(radius)
                        .on('input', function (evt) {
                            var $this = $(this);
                            $this.parents('.settings').find('[data-property="r"]:not([type="range"])')
                                .val($this.val())
                                .trigger('change');
                        }))
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'r')
                        .val(radius)
                        .on('change', function (evt) {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number' && value >= 0) {
                                assign(['r'], [value]);
                            }
                        }));
            }
        },
        {
            clazz: IFDropShadowEffect,
            group: 'raster',
            createSettings: createShadowSettings
        },
        {
            clazz: IFInnerShadowEffect,
            group: 'raster',
            createSettings: createShadowSettings
        },
        {
            clazz: IFOverlayEffect,
            group: 'filter',
            openSettings: function (effect, assign, element) {
                $.gPatternPicker.open({
                    target: element,
                    scene: effect.getScene(),
                    types: [IFColor, IFGradient],
                    value: effect.getProperty('pat'),
                    changeCallback: function (evt, pattern) {
                        assign(['pat'], [pattern]);
                    }
                });
            }
        },
        {
            clazz: IFColorGradingEffect,
            group: 'filter',
            createSettings: function (effect, assign) {
                // TODO : Share ACV files, import, export, create custom w/ curve editor
                return $('<div></div>')
                    .append($('<input>')
                        .attr('type', 'file')
                        .css({
                         'position': 'absolute',
                         'left': '-10000px'
                         })
                        .on('change', function (evt) {
                            var files = $(evt.target)[0].files;
                            if (files && files.length) {
                                var reader = new FileReader();
                                reader.onload = function (event) {
                                    try {
                                        assign(['cp'], [IFColorGradingFilter.parseACV(event.target.result)]);
                                    } catch (e) {
                                    }
                                }
                                reader.readAsArrayBuffer(files[0]);
                            }
                        }))
                    .append($('<select></select>')
                        .append($('<option></option>')
                            .attr('value', '')
                            // TODO : I18N
                            .text('None'))
                        .append($('<optgroup label="Instagram"></optgroup>')
                            .append($('<option></option>')
                                .attr('value', '1977')
                                .text('1977'))
                            .append($('<option></option>')
                                .attr('value', 'Brannan')
                                .text('Brannan'))
                            .append($('<option></option>')
                                .attr('value', 'Gotham')
                                .text('Gotham'))
                            .append($('<option></option>')
                                .attr('value', 'Hefe')
                                .text('Hefe'))
                            .append($('<option></option>')
                                .attr('value', 'Lord Kelvin')
                                .text('Lord Kelvin'))
                            .append($('<option></option>')
                                .attr('value', 'Nashville')
                                .text('Nashville'))
                            .append($('<option></option>')
                                .attr('value', 'X-PRO II')
                                .text('X-PRO II')))
                        .on('change', function (evt) {
                            var $target = $(evt.target);
                            var val = $target.val();
                            if (!val) {
                                assign(['cp'], [null]);
                            } else {
                                $.ajax({
                                    url: 'acv/' + val + '.acv',
                                    async: false,
                                    dataType: 'arraybuffer',
                                    success: function (data) {
                                        assign(['cp'], [IFColorGradingFilter.parseACV(data)]);
                                    }
                                });
                            }
                        }))
                    .append($('<button></button>')
                        // TODO : I18N
                        .text('Load ACV...')
                        .on('click', function (evt) {
                            $(evt.target).parents('.settings').find('input[type="file"]').focus().trigger('click');
                        }));
            }
        }
    ];

    // TODO : I18N
    var STYLE_LAYERS = [
        {
            layer: null,
            title: 'All'
        },
        {
            layer: IFStylable.Layer.Background,
            title: 'Background'
        },
        {
            layer: IFStylable.Layer.Content,
            title: 'Content'
        },
        {
            layer: IFStylable.Layer.Foreground,
            title: 'Foreground'
        }
    ];

    function getEffectInfo(effectInstOrClass) {
        var clazz = null;
        if (effectInstOrClass instanceof IFEffect) {
            clazz = effectInstOrClass.constructor;
        } else {
            clazz = effectInstOrClass;
        }

        for (var i = 0; i < EFFECTS.length; ++i) {
            if (EFFECTS[i].clazz === clazz) {
                return EFFECTS[i];
            }
        }

        throw new Error('Invalid effect/class');
    }

    var dragEffect = null;

    function canDropEffect(target) {
        if (dragEffect) {
            var targetEffect = $(target).data('effect');

            if (targetEffect && (targetEffect !== dragEffect || ifPlatform.modifiers.shiftKey)) {
                return dragEffect.getParent() === targetEffect.getParent();
            }
        }

        return false;
    };

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

    /**
     * @type {Array<JQuery>}
     * @private
     */
    GEffectProperties.prototype._effectsPanel = null;

    /** @override */
    GEffectProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createEffectItem = function (effect) {
            var item = new GMenuItem();
            item.setCaption(ifLocale.getValue(effect.clazz, "name"));
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

        this._effectsPanel = $('<div></div>')
            .addClass('g-grid effects')
            .css({
                'position': 'absolute',
                'top': '5px',
                'left': '5px',
                'right': '5px',
                'bottom': '30px'
            });

        panel
            .css('width', '175px')
            .append(this._effectsPanel)
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'right': '5px',
                    'bottom': '5px'
                })
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-plus'))
                    .gMenuButton({
                        menu: effectMenu,
                        arrow: false
                    }))
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-trash-o'))));
    };

    /** @override */
    GEffectProperties.prototype.update = function (document, elements) {
        if (this._document) {
            var scene = this._document.getScene();
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._clear();
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
            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            this._clear();
            return true;
        } else {
            return false;
        }
    };

    /** @private */
    GEffectProperties.prototype._clear = function () {
        this._effectsPanel.empty();
        if (this._document) {
            var effects = this._elements[0].getEffects();
            for (var child = effects.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFEffect) {
                    this._insertEffect(child);
                }
            }
        }
    };

    /** @private */
    GEffectProperties.prototype._insertEffect = function (effect) {
        var insertBefore = null;

        if (effect.getNext()) {
            this._effectsPanel.find('.effect-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('effect') === effect.getNext()) {
                    insertBefore = $element;
                    return false;
                }
            });
        }

        var effectInfo = getEffectInfo(effect);

        var block = $('<div></div>')
            .addClass('effect-block')
            .data('effect', effect)
            .attr('draggable', 'true')
            .append($('<div></div>')
                .addClass('effect-settings grid-icon')
                // TODO : I18N
                .attr('title', 'Effect Settings')
                .css('visibility', effectInfo.createSettings || effectInfo.openSettings ? '' : 'hidden')
                .on('click', function (evt) {
                    evt.stopPropagation();

                    var assign = function (properties, values) {
                        IFEditor.tryRunTransaction(effect, function () {
                            effect.setProperties(properties, values);
                        }, 'Change Effect Properties');
                    };

                    if (effectInfo.openSettings) {
                        effectInfo.openSettings(effect, assign, evt.target);
                    } else {
                        var settings = effectInfo.createSettings(effect, assign);
                        if (settings) {
                            settings
                                .addClass('settings')
                                .css({
                                    'display': 'inline-block',
                                    'padding': '5px'
                                })
                                .gOverlay({
                                    releaseOnClose: true
                                })
                                .gOverlay('open', evt.target)
                        }
                    }
                })
                .append($('<span></span>')
                    .addClass('fa fa-cog fa-fw')))
            .append($('<div></div>')
                .addClass('effect-title grid-main')
                .text(effect.getNodeNameTranslated()))
            .append($('<div></div>')
                .addClass('effect-layer grid-icon')
                // TODO : I18N
                .attr('title', 'The layer this effects applies to')
                .on('click', function (evt) {
                    evt.stopPropagation();

                    var panel = $('<div></div>')
                        .gOverlay({
                            releaseOnClose: true
                        });

                    var effectLayer = effect.getProperty('ly');

                    for (var i = 0; i < STYLE_LAYERS.length; ++i) {
                        $('<button></button>')
                            .addClass('g-flat')
                            .toggleClass('g-active', effectLayer === STYLE_LAYERS[i].layer)
                            .css('display', 'block')
                            .data('layer', STYLE_LAYERS[i].layer)
                            .text(STYLE_LAYERS[i].title)
                            .on('click', function (evt) {
                                IFEditor.tryRunTransaction(effect, function () {
                                    effect.setProperty('ly', $(evt.target).data('layer'));
                                }, 'Change Effect Layer');
                                panel.gOverlay('close');
                            })
                            .appendTo(panel);
                    }

                    panel.gOverlay('open', this);
                }))
            .append($('<div></div>')
                .addClass('effect-visibility grid-icon')
                // TODO : I18N
                .attr('title', 'Toggle Effect Visibility')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    // TODO : I18N
                    IFEditor.tryRunTransaction(effect, function () {
                        effect.setProperty('vs', !effect.getProperty('vs'));
                    }, 'Toggle Effect Visibility');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .on('mousedown', function () {
                // TODO
            })
            .on('click', function () {
                effect.getScene().setActiveEffect(effect);
            })
            .on('dragstart', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                dragEffect = $this.data('effect');

                // Setup our drag-event now
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', 'dummy_data');

                // Add drag overlays
                $this.closest('.effects').find('.effect-block').each(function (index, element) {
                    $(element)
                        .append($('<div></div>')
                            .addClass('grid-drag-overlay')
                            .on('dragenter', function (evt) {
                                if (canDropEffect(this.parentNode)) {
                                    $(this).parent().addClass('g-drop');
                                }
                            })
                            .on('dragleave', function (evt) {
                                if (canDropEffect(this.parentNode)) {
                                    $(this).parent().removeClass('g-drop');
                                }
                            })
                            .on('dragover', function (evt) {
                                var event = evt.originalEvent;
                                if (canDropEffect(this.parentNode)) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    event.dataTransfer.dropEffect = 'move';
                                }
                            })
                            .on('drop', function (evt) {
                                var $this = $(this);
                                var $parent = $(this.parentNode);

                                $parent.removeClass('g-drop');

                                // Remove drag overlays
                                $parent.closest('.effects').find('.grid-drag-overlay').remove();

                                var targetEffect = $parent.data('effect');
                                if (dragEffect && dragEffect.getParent() === targetEffect.getParent()) {
                                    var parent = dragEffect.getParent();
                                    var sourceIndex = parent.getIndexOfChild(dragEffect);
                                    var targetIndex = parent.getIndexOfChild(targetEffect);

                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(parent, function () {
                                        if (ifPlatform.modifiers.shiftKey) {
                                            // Clone effect
                                            var effectClone = dragEffect.clone();
                                            parent.insertChild(effectClone, sourceIndex < targetIndex ? targetEffect.getNext() : targetEffect);
                                        } else {
                                            // Move effect
                                            parent.removeChild(dragEffect);
                                            parent.insertChild(dragEffect, sourceIndex < targetIndex ? targetEffect.getNext() : targetEffect);
                                        }
                                    }, ifPlatform.modifiers.shiftKey ? 'Duplicate Effect' : 'Move Effect');
                                }
                            }));
                });
            })
            .on('dragend', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                // Remove drag overlays
                $this.closest('.effects').find('.grid-drag-overlay').remove();

                dragEffect = null;
            });

        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo(this._effectsPanel);
        }

        this._updateEffect(effect);
    };

    /** @private */
    GEffectProperties.prototype._updateEffect = function (effect) {

        this._effectsPanel.find('.effect-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('effect') === effect) {
                var effectVisible = effect.getProperty('vs');
                var effectLayer = effect.getProperty('ly');

                $element.toggleClass('g-selected', effect.hasFlag(IFNode.Flag.Selected));

                $element.find('.effect-visibility')
                    .toggleClass('grid-icon-default', effectVisible)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-eye', effectVisible)
                    .toggleClass('fa-eye-slash', !effectVisible);

                // TODO
                $element.find('.effect-layer')
                    .text(effectLayer ? effectLayer : 'A');

                return false;
            }
        });
    };

    /** @private */
    GEffectProperties.prototype._removeEffect = function (effect) {
        this._effectsPanel.find('.effect-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('effect') === effect) {
                $element.remove();
                return false;
            }
        });
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GEffectProperties.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._insertEffect(event.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GEffectProperties.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._removeEffect(event.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GEffectProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._updateEffect(event.node);
        }
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