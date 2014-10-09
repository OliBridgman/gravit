(function (_) {

    var EFFECTS = [
        {
            clazz: IFBlurEffect,
            group: 'raster'
        },
        {
            clazz: IFDropShadowEffect,
            group: 'raster'
        },
        {
            clazz: IFInnerShadowEffect,
            group: 'raster'
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
            .css('width', '150px')
            .append(this._effectsPanel)
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

        var block = $('<div></div>')
            .addClass('effect-block')
            .data('effect', effect)
            .attr('draggable', 'true')
            .append($('<div></div>')
                .addClass('effect-settings grid-icon')
                // TODO : I18N
                .attr('title', 'Effect Settings')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    alert('TOGGLE SETTINGS');
                })
                .append($('<span></span>')
                    .addClass('fa fa-cog fa-fw')))
            .append($('<div></div>')
                .addClass('effect-title grid-main')
                .text(effect.getNodeNameTranslated()))
            .append($('<div></div>')
                .addClass('effect-layer grid-icon')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    alert('TOGGLE EFFECT LAYER');
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
                                            var insertPos = dragEffect.getScene().getEffectInsertPosition();
                                            var effectClone = dragEffect.clone();
                                            effectClone.setProperties(['x', 'y', 'name'], [insertPos.getX(), insertPos.getY(), effectClone.getProperty('name') + '-copy']);
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
        var effectVisible = effect.getProperty('vs');
        var effectLayer = effect.getProperty('ly');

        this._effectsPanel.find('.effect-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('effect') === effect) {
                $element.toggleClass('g-selected', effect.hasFlag(IFNode.Flag.Selected));

                $element.find('.effect-visibility')
                    .toggleClass('grid-icon-default', effectVisible)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-eye', effectVisible)
                    .toggleClass('fa-eye-slash', !effectVisible);

                // TODO
                $element.find('.effect-layer')
                    .text(effectLayer ? effectLayer : '-');

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
        if (event.node instanceof IFEffect) {
            this._insertEffect(event.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GEffectProperties.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFEffect) {
            this._removeEffect(event.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GEffectProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFEffect && event.node.getParent() === this._elements[0]) {
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