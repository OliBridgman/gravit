(function ($) {
    function createShadowSettings(effect, assign) {
        var scene = effect.getScene();

        var x = scene.pointToString(effect.getProperty('x'));
        var y = scene.pointToString(effect.getProperty('y'));
        var radius = scene.pointToString(effect.getProperty('r'));
        var pattern = effect.getProperty('pat');
        var opacity = effect.getProperty('opc');

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
                        .gPatternPicker({
                            modal: true
                        })
                        .gPatternPicker('types', [IFColor, IFGradient])
                        .gPatternPicker('scene', scene)
                        .gPatternPicker('value', pattern)
                        .gPatternPicker('opacity', opacity)
                        .on('patternchange', function (evt, pattern, opacity) {
                            if (typeof opacity === 'number') {
                                assign(['pat', 'opc'], [pattern, opacity]);
                            } else {
                                assign(['pat'], [pattern]);
                            }
                        }))
                    .append($('<label></label>')
                        .text('Fill'))));
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
            createSettings: createShadowSettings,
            createPreview: function (preview) {
                preview
                    .gPatternTarget({
                        types: [IFColor],
                        allowDrop: false
                    });
            },
            updatePreview: function (preview, effect) {
                var pattern = effect.getProperty('pat');
                var opacity = effect.getProperty('opc');
                preview
                    .gPatternTarget('value', pattern)
                    .css('background', IFPattern.asCSSBackground(pattern, opacity));
            }
        },
        {
            clazz: IFInnerShadowEffect,
            group: 'raster',
            createSettings: createShadowSettings,
            createPreview: function (preview) {
                preview
                    .gPatternTarget({
                        types: [IFColor],
                        allowDrop: false
                    });
            },
            updatePreview: function (preview, effect) {
                var pattern = effect.getProperty('pat');
                var opacity = effect.getProperty('opc');
                preview
                    .gPatternTarget('value', pattern)
                    .css('background', IFPattern.asCSSBackground(pattern, opacity));
            }
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
                    opacity: effect.getProperty('opc'),
                    changeCallback: function (evt, pattern, opacity) {
                        if (typeof opacity === 'number') {
                            assign(['pat', 'opc'], [pattern, opacity]);
                        } else {
                            assign(['pat'], [pattern]);
                        }
                    }
                });
            },
            createPreview: function (preview) {
                preview
                    .gPatternTarget({
                        types: [IFColor, IFGradient],
                        allowDrop: false
                    });
            },
            updatePreview: function (preview, effect) {
                var pattern = effect.getProperty('pat');
                var opacity = effect.getProperty('opc');
                preview
                    .gPatternTarget('value', pattern)
                    .css('background', IFPattern.asCSSBackground(pattern, opacity));
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
                        .attr('accept', '.acv')
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
    };

    var dragEffect = null;
    var dragDeltaX = 0;
    var dragDeltaY = 0;
    var hasDropped = false;

    function canDropEffect(target) {
        if (dragEffect) {
            var targetEffect = $(target).data('effect');

            if (targetEffect && (targetEffect !== dragEffect || ifPlatform.modifiers.shiftKey)) {
                return dragEffect.getParent() === targetEffect.getParent();
            }
        }

        return false;
    };

    var CREATE_EFFECT_MENU = null;

    function getCreateEffectMenu() {
        if (!CREATE_EFFECT_MENU) {
            CREATE_EFFECT_MENU = new GMenu();
            var lastGroup = null;
            for (var i = 0; i < EFFECTS.length; ++i) {
                var effect = EFFECTS[i];
                if (lastGroup && effect.group !== lastGroup) {
                    CREATE_EFFECT_MENU.createAddDivider();
                    lastGroup = effect.group;
                }

                CREATE_EFFECT_MENU.createAddItem(ifLocale.getValue(effect.clazz, "name"))
                    .setData(effect.clazz);
            }
        }

        return CREATE_EFFECT_MENU;
    };

    function iterateEqualEffects (effect, iterator) {
        var $this = $(this);
        var elements = $this.data('geffectpanel').elements;
        var effectIndex = effect.getParent().getIndexOfChild(effect);

        for (var i = 0; i < elements.length; ++i) {
            var elEffects = elements[i].getEffects();
            for (var elEff = elEffects.getFirstChild(); elEff !== null; elEff = elEff.getNext()) {
                if (elEff === effect) {
                    continue;
                }

                if (IFUtil.equals(elEff, effect) || (elEff.constructor === effect.constructor && elEffects.getIndexOfChild(elEff) === effectIndex)) {
                    iterator(elEff);
                }
            }
        }
    };

    function afterInsertEvent(evt) {
        var $this = $(this);
        var elements = $this.data('geffectpanel').elements;
        if (evt.node instanceof IFEffect && evt.node.getOwnerStylable() === elements[0]) {
            insertEffect.call(this, evt.node);
        }
    };

    function beforeRemoveEvent(evt) {
        var $this = $(this);
        var elements = $this.data('geffectpanel').elements;
        if (evt.node instanceof IFEffect && evt.node.getOwnerStylable() === elements[0]) {
            removeEffect.call(this, evt.node);
        }
    };

    function afterPropertiesChangeEvent(evt) {
        var $this = $(this);
        var elements = $this.data('geffectpanel').elements;
        if (evt.node instanceof IFEffect && evt.node.getOwnerStylable() === elements[0]) {
            updateEffect.call(this, evt.node);
        }
    };

    function insertEffect(effect) {
        var self = this;
        var $this = $(this);
        var data = $this.data('geffectpanel');

        var layer = $this.find('[data-action="style-layer"]').val() || null;
        if (layer !== '*' && effect.getProperty('ly') !== layer) {
            return;
        }

        // We'll always insert in reverse-order (last=top)
        var insertBefore = null;
        var previous = effect.getPrevious();
        if (previous) {
            $this.find('.effect-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('effect') === previous) {
                    insertBefore = $element;
                    return false;
                }
            });
        }

        var effectInfo = getEffectInfo(effect);
        var settingsPreview = null;

        if (effectInfo.createPreview) {
            settingsPreview = $('<div></div>')
                .addClass('preview');
            effectInfo.createPreview(settingsPreview);
        } else {
            settingsPreview = $('<span></span>')
                .addClass('fa fa-cog fa-fw');
        }

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
                            iterateEqualEffects.call(self, effect, function (e) {
                                e.setProperties(properties, values);
                            });
                            
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
                .append(settingsPreview))
            .append($('<div></div>')
                .addClass('effect-title grid-main')
                .text(effect.getNodeNameTranslated()))
            .append($('<div></div>')
                .addClass('effect-layer grid-icon')
                // TODO : I18N
                .on('click', function (evt) {
                    evt.stopPropagation();

                    var effectLayer = effect.getProperty('ly');

                    var element = data.elements && data.elements.length ? data.elements[0] : null;
                    var styleLayers = element ? element.getStyleLayers() : null;

                    if (styleLayers && styleLayers.length) {
                        var panel = $('<div></div>')
                            .gOverlay({
                                releaseOnClose: true
                            });

                        styleLayers.unshift('');

                        for (var i = 0; i < styleLayers.length; ++i) {
                            var layer = styleLayers[i];
                            $('<button></button>')
                                .addClass('g-flat')
                                .toggleClass('g-active', effectLayer === layer)
                                .css('display', 'block')
                                .data('layer', layer)
                                .text(ifLocale.get(IFStylable.StyleLayerName[layer ? layer : '']))
                                .on('click', function (evt) {
                                    var layer = $(evt.target).data('layer') || null;
                                    IFEditor.tryRunTransaction(effect, function () {
                                        iterateEqualEffects.call(self, effect, function (e) {
                                            e.setProperty('ly', layer);
                                        });

                                        effect.setProperty('ly', layer);
                                    }, 'Change Effect Layer');
                                    panel.gOverlay('close');
                                })
                                .appendTo(panel);
                        }

                        panel.gOverlay('open', this);
                    }
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .append($('<div></div>')
                .addClass('effect-visibility grid-icon')
                // TODO : I18N
                .attr('title', 'Toggle Effect Visibility')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    // TODO : I18N
                    IFEditor.tryRunTransaction(effect, function () {
                        iterateEqualEffects.call(self, effect, function (e) {
                            e.setProperty('vs', !effect.getProperty('vs'));
                        });
                        effect.setProperty('vs', !effect.getProperty('vs'));
                    }, 'Toggle Effect Visibility');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .on('dragstart', function (evt) {
                var $target = $(this);
                var offset = $target.offset();

                var event = evt.originalEvent;
                event.stopPropagation();

                dragEffect = $target.data('effect');
                hasDropped = false;
                dragDeltaX = event.pageX - offset.left;
                dragDeltaY = event.pageY - offset.top;

                // Setup our drag-event now
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', 'dummy_data');

                // Add drag overlays
                $this.find('.effect-block').each(function (index, element) {
                    $(element)
                        .append($('<div></div>')
                            .addClass('grid-drag-overlay')
                            .on('dragenter', function () {
                                if (canDropEffect(this.parentNode)) {
                                    $(this).parent().addClass('g-drop');
                                }
                            })
                            .on('dragleave', function () {
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
                            .on('drop', function () {
                                var $parent = $(this.parentNode);

                                $parent.removeClass('g-drop');

                                $this.find('.grid-drag-overlay').remove();

                                hasDropped = true;

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
                var event = evt.originalEvent;
                event.stopPropagation();

                // Remove drag overlays
                $this.find('.grid-drag-overlay').remove();

                // Delete our effect when not dropped and cursor is outside
                if (!hasDropped) {
                    var offset = $this.offset();
                    var x1 = offset.left;
                    var y1 = offset.top;
                    var x2 = x1 + $this.outerWidth();
                    var y2 = y1 + $this.outerHeight();
                    var px = event.pageX + dragDeltaX;
                    var py = event.pageY + dragDeltaY;

                    if (px < x1 || px > x2 || py < y1 || py > y2) {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(dragEffect, function () {
                            iterateEqualEffects.call(self, dragEffect, function (e) {
                                e.getParent().removeChild(e);
                            });

                            dragEffect.getParent().removeChild(dragEffect);
                        }, 'Remove Effect');
                    }
                }

                dragEffect = null;
                hasDropped = false;
            });

        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo($this.find('.effects'));
        }

        updateEffect.call(this, effect);
    };

    function updateEffect(effect) {
        var $this = $(this);

        $this.find('.effect-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('effect') === effect) {
                var effectInfo = getEffectInfo(effect);
                var effectVisible = effect.getProperty('vs');
                var effectLayer = effect.getProperty('ly');

                $element.toggleClass('g-selected', effect.hasFlag(IFNode.Flag.Selected));

                if (effectInfo.updatePreview) {
                    effectInfo.updatePreview($element.find(".effect-settings>:first-child"), effect);
                }

                $element.find('.effect-visibility')
                    .toggleClass('grid-icon-default', effectVisible)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-eye', effectVisible)
                    .toggleClass('fa-eye-slash', !effectVisible);

                $element.find('.effect-layer')
                    .toggleClass('grid-icon-default', !effectLayer)
                    // TODO : I18N
                    .attr('title', 'Applies to ' + ifLocale.get(IFStylable.StyleLayerName[effectLayer ? effectLayer : '']))
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-circle', !effectLayer)
                    .toggleClass('gicon-fill', effectLayer === IFStylable.StyleLayer.Fill)
                    .toggleClass('gicon-stroke', effectLayer === IFStylable.StyleLayer.Border)

                return false;
            }
        });
    };

    function removeEffect(effect) {
        var $this = $(this);
        $this.find('.effect-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('effect') === effect) {
                $element.remove();
                return false;
            }
        });
    };


    function clear() {
        var $this = $(this);
        var data = $this.data('geffectpanel');
        $this.find('.effects').empty();

        if (data.elements) {
            var effects = data.elements[0].getEffects();
            for (var child = effects.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFEffect) {
                    insertEffect.call(this, child);
                }
            }
        }
    };

    function updateStyleLayers() {
        var $this = $(this);
        var data = $this.data('geffectpanel');

        var styleLayer = $this.find('[data-action="style-layer"]');

        styleLayer
            .empty()
            .css('display', 'none')
            .append($('<option></option>')
                .attr('value', '*')
                // TODO : I18N
                .text('All Effects'))
            .append($('<option></option>')
                .attr('value', '')
                .text(ifLocale.get(IFStylable.StyleLayerName[''])));

        styleLayer.val('*');

        var element = data.elements && data.elements.length ? data.elements[0] : null;
        var styleLayers = element ? element.getStyleLayers() : null;

        if (styleLayers) {
            styleLayer.css('display', '');
            for (var i = 0; i < styleLayers.length; ++i) {
                var layer = styleLayers[i];
                styleLayer.append($('<option></option>')
                    .attr('value', layer)
                    .text(ifLocale.get(IFStylable.StyleLayerName[layer])))
            }
        }
    };

    var methods = {
        init: function (options) {
            options = $.extend({}, options);

            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .addClass('g-effect-panel')
                    .data('geffectpanel', {
                        elements: null,
                        options: options
                    })
                    .append($('<div></div>')
                        .addClass('g-grid effects'))
                    .append($('<select></select>')
                        .attr('data-action', 'style-layer')
                        .css({
                            'position': 'absolute',
                            'left': '0px',
                            'bottom': '5px'
                        })
                        .on('change', function (evt) {
                            var val = $(evt.target).val();
                            methods.layer.call(self, val ? val : null);
                        }))
                    .append($('<div></div>')
                        .css({
                            'position': 'absolute',
                            'right': '0px',
                            'bottom': '5px'
                        })
                        .append($('<button></button>')
                            .attr('data-action', 'create')
                            .append($('<span></span>')
                                .addClass('fa fa-plus'))
                            .gMenuButton({
                                menu: getCreateEffectMenu(),
                                arrow: false
                            })
                            .on('menuitemactivate', function (evt, menuItem) {
                                var layer = methods.layer.call(self);
                                var effectClass = menuItem.getData();
                                var elements = $this.data('geffectpanel').elements;
                                if (elements && elements.length) {
                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(elements[0], function () {
                                        for (var i = 0; i < elements.length; ++i) {
                                            var effect = new effectClass();
                                            effect.setProperty('ly', layer);
                                            elements[i].getEffects().appendChild(effect);
                                        }
                                    }, 'Add Effect');
                                }
                            }))
                        .append($('<button></button>')
                            .attr('data-action', 'delete')
                            .attr('title', 'Remove hidden effects')
                            .on('click', function () {
                                var elements = $this.data('geffectpanel').elements;
                                if (elements && elements.length) {
                                    var effects = elements[0].getEffects();

                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(effects, function () {
                                        for (var effect = effects.getFirstChild(); effect !== null; effect = effect.getNext()) {
                                            if (effect.getProperty('vs') === false) {
                                                iterateEqualEffects.call(self, effect, function (e) {
                                                    e.getParent().removeChild(e);
                                                });
                                                effect.getParent().removeChild(effect);
                                            }
                                        }
                                    }, 'Remove Hidden Effects');
                                }
                            })
                            .append($('<span></span>')
                                .addClass('fa fa-trash-o'))));
            });
        },

        elements: function (elements) {
            var $this = $(this);
            var data = $this.data('geffectpanel');

            if (!arguments.length || arguments.length == 1 && arguments[0] === null) {
                if (data.elements && data.elements.length) {
                    var scene = data.scene;
                    if (scene) {
                        scene.removeEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                        scene.removeEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                        scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                    }

                    data.scene = null;
                    data.afterInsertHandler = null;
                    data.beforeRemoveHandler = null;
                    data.afterPropertiesChangeHandler = null;
                }
                data.elements = null;
                updateStyleLayers.call(this);
                clear.call(this);
                return data.elements;
            } else {
                if (data.elements && data.elements.length) {
                    var scene = data.scene;
                    if (scene) {
                        scene.removeEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                        scene.removeEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                        scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                    }

                    data.scene = null;
                    data.afterInsertHandler = null;
                    data.beforeRemoveHandler = null;
                    data.afterPropertiesChangeHandler = null;
                }

                data.elements = elements;


                if (data.elements && data.elements.length) {
                    var scene = data.elements[0].getScene();
                    if (scene) {
                        data.scene = scene;
                        data.afterInsertHandler = afterInsertEvent.bind(this);
                        data.beforeRemoveHandler = beforeRemoveEvent.bind(this);
                        data.afterPropertiesChangeHandler = afterPropertiesChangeEvent.bind(this);
                        scene.addEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                        scene.addEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                        scene.addEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                    }
                }

                updateStyleLayers.call(this);
                clear.call(this);

                return this;
            }
        },

        layer: function (layer) {
            var $this = $(this);
            var data = $this.data('geffectpanel');

            if (!arguments.length || arguments.length == 1 && arguments[0] === null) {
                var val = $this.find('[data-action="style-layer"]').val();
                return val && val !== '*' ? val : null;
            } else {
                $this.find('[data-action="style-layer"]').val(layer ? layer : '');
                clear.call(this);

                return this;
            }
        }
    };

    /**
     * Block to transform divs to effect panels
     */
    $.fn.gEffectPanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));