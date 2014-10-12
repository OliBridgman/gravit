(function (_) {
    /**
     * Mixin to mark something containing a style
     * @class IFStylable
     * @constructor
     * @mixin
     * @extends IFObject
     */
    IFStylable = function () {
    };
    IFObject.inherit(IFStylable, IFObject);

    /**
     * @type {IFStylable.Effects}
     * @private
     */
    IFStylable._effects = null;

    /**
     * Style layer
     * @enum
     */
    IFStylable.StyleLayer = {
        /**
         * Fill Layer
         */
        Fill: 'F',

        /**
         * Border Layer
         */
        Border: 'B'
    };

    /**
     * Localized names for IFStylable.StyleLayer
     */
    IFStylable.StyleLayerName = {
        '' : new IFLocale.Key(IFStylable, 'layer.element'),
        'F': new IFLocale.Key(IFStylable, 'layer.fill'),
        'B': new IFLocale.Key(IFStylable, 'layer.border')
    };

    /**
     * Style layer
     * @enum
     */
    IFStylable.StyleLayer = {
        /**
         * Fill Layer
         */
        Fill: 'F',

        /**
         * Border Layer
         */
        Border: 'B'
    };

    /**
     * Alignment of a border
     * @enum
     */
    IFStylable.BorderAlignment = {
        /**
         * Center alignment
         */
        Center: 'C',

        /**
         * Outside alignment
         */
        Outside: 'O',

        /**
         * Inside alignment
         */
        Inside: 'I'
    };

    /**
     * Alignment of a paragraph
     * @enum
     */
    IFStylable.ParagraphAlignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    IFStylable.ParagraphWrapMode = {
        /**
         * No word-break
         */
        None: 'n',

        /**
         * Break after words only
         */
        Words: 'w',

        /**
         * Break anywhere including characters
         */
        All: 'a'
    };

    /**
     * The property set of a style
     * @enum
     */
    IFStylable.PropertySet = {
        Style: 'S',
        Effects: 'E',
        Fill: 'F',
        Border: 'B',
        Text: 'T',
        Paragraph: 'P'
    };

    IFStylable.PropertySetInfo = {
        'S': {
            visualProperties: {
                /** Internal default style marker */
                _sdf: null,
                /** Blend Mode (IFPaintCanvas.BlendMode|'mask') */
                _sbl: IFPaintCanvas.BlendMode.Normal,
                /** Fill Opacity (= w/o effects) */
                _sfop: 1,
                /** Opacity (= total opacity w/ effects) */
                _stop: 1
            }
        },
        'E': {},
        'F': {
            visualProperties: {
                /** Fill pattern (IFPattern|'bck'|null) */
                _fpt: null,
                /** Fill opacity */
                _fop: 1
            },
            storeFilter: function (property, value) {
                if (value) {
                    if (property === '_fpt') {
                        return IFPattern.serialize(value);
                    }
                }
                return value;
            },
            restoreFilter: function (property, value) {
                if (value) {
                    if (property === '_fpt') {
                        return IFPattern.deserialize(value);
                    }
                }
                return value;
            }
        },
        'B': {
            visualProperties: {
                /** Border opacity */
                _bop: 1
            },
            geometryProperties: {
                /** Border pattern (IFPattern|'bck'|null) */
                _bpt: null,
                /** Border Width */
                _bw: 1,
                /** Border Alignment */
                _ba: IFStylable.BorderAlignment.Center,
                /** Line-Caption */
                _blc: IFPaintCanvas.LineCap.Square,
                /** Line-Join */
                _blj: IFPaintCanvas.LineJoin.Miter,
                /** Miter-Limit */
                _bml: 3
            },
            storeFilter: function (property, value) {
                if (value) {
                    if (property === '_bpt') {
                        return IFPattern.serialize(value);
                    }
                }
                return value;
            },
            restoreFilter: function (property, value) {
                if (value) {
                    if (property === '_bpt') {
                        return IFPattern.deserialize(value);
                    }
                }
                return value;
            }
        },
        'T': {
            geometryProperties: {
                /** The font family */
                _tff: 'Open Sans',
                /** The font size */
                _tfi: 20,
                /** The font-weight (IFFont.Weight) */
                _tfw: IFFont.Weight.Regular,
                /** The font-style (IFFont.Style) */
                _tfs: IFFont.Style.Normal,
                /** The character spacing */
                _tcs: null,
                /** The word spacing */
                _tws: null
            }
        },
        'P': {
            geometryProperties: {
                /** Column count */
                _pcc: null,
                /** Column gap */
                _pcg: null,
                /** Wrap-Mode of a paragraph (IFStylable.ParagraphWrapMode) */
                _pwm: IFStylable.ParagraphWrapMode.Words,
                /** The paragraph's alignment (IFStylable.ParagraphAlignment) */
                _pal: null,
                /** The first line intendation */
                _pin: null,
                /** The line height whereas 1 = 100% */
                _plh: 1
            }
        }
    };

    IFStylable.AllVisualProperties = {};
    IFStylable.AllGeometryProperties = {};

    for (var propertySet in IFStylable.PropertySetInfo) {
        var propertySetInfo = IFStylable.PropertySetInfo[propertySet];
        if (propertySetInfo.visualProperties) {
            for (var property in propertySetInfo.visualProperties) {
                IFStylable.AllVisualProperties[property] = propertySetInfo.visualProperties[property];
            }
        }
        if (propertySetInfo.geometryProperties) {
            for (var property in propertySetInfo.geometryProperties) {
                IFStylable.AllGeometryProperties[property] = propertySetInfo.geometryProperties[property];
            }
        }
    }

    // --------------------------------------------------------------------------------------------
    // IFStylable.Effects Class
    // --------------------------------------------------------------------------------------------
    /**
     * Effects Class
     * @class IFStylable.Effects
     * @inherit IFNode
     * @mixes IFNode.Container
     * @mixes IFNode.Store
     * @constructor
     */
    IFStylable.Effects = function () {
    };
    IFNode.inheritAndMix('effects', IFStylable.Effects, IFNode, [IFNode.Container, IFNode.Store]);

    /**
     * Returns an ordered list of effects for each given layer if any.
     * @param {Array<String>} [layers] the layers to get effects for, defaults to null
     * @param {Boolean} [visibleOnly] if set, only visible effects will be returned.
     * @returns {Array} array keeping an ordered list of layers and their effects
     * array or null if there're no effects for that layer. The last layer is the "null" layer.
     */
    IFStylable.Effects.prototype.getLayersEffects = function (layers, visibleOnly) {
        if (layers && layers.length) {
            var result = [];
            for (var pl = 0; pl <= layers.length; ++pl) {
                var layer = pl < layers.length ? layers[pl] : null;
                result.push(this.getEffectsForLayer(layer, visibleOnly));
            }
            return result;
        } else {
            return [this.getEffectsForLayer(null, visibleOnly)];
        }
    };

    /**
     * Returns all effects for a given layer
     * @param {String} [layer] layer to get effects for, defaults to null
     * @param {Boolean} [visibleOnly] if set, only visible effects will be returned.
     * @returns {Array<IFEffect>} an array of effects or null if there're no effects
     */
    IFStylable.Effects.prototype.getEffectsForLayer = function (layer, visibleOnly) {
        layer = layer || null;
        var result = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFEffect) {
                var childLayer = child.getProperty('ly');
                if (visibleOnly && child.getProperty('vs') === false) {
                    continue;
                }

                if (childLayer === layer) {
                    if (!result) {
                        result = [];
                    }
                    result.push(child);
                }
            }
        }
        return result;
    };

    /** @override */
    IFStylable.Effects.prototype.insertChild = function (child, reference) {
        if (child instanceof IFEffect && child.getEffectType() === IFEffect.Type.PreEffect) {
            for (var prev = reference ? reference : this.getLastChild(); prev !== null; prev = prev.getPrevious()) {
                if (prev instanceof IFEffect) {
                    if (prev.getEffectType() === IFEffect.Type.PreEffect) {
                        reference = prev.getNext();
                        break;
                    } else if (prev.getEffectType() === IFEffect.Type.PostEffect) {
                        reference = prev;
                    }
                }
            }
        }

        IFNode.Container.prototype.insertChild.call(this, child, reference);
    };

    /** @override */
    IFStylable.Effects.prototype._handleChange = function (change, args) {
        var ownerStyle = this.getParent();
        if (ownerStyle && ownerStyle.hasMixin(IFStylable)) {
            if ((change == IFNode._Change.BeforeChildInsert || change === IFNode._Change.BeforeChildRemove) && args instanceof IFEffect) {
                ownerStyle._stylePrepareGeometryChange(true);
            }
            if ((change == IFNode._Change.AfterChildInsert || change === IFNode._Change.AfterChildRemove) && args instanceof IFEffect) {
                ownerStyle._styleFinishGeometryChange(true);
            }
        }
        IFNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Returns an effect bbox
     * @param {IFRect} bbox the source bbox
     * @param {String} [layer] layer to get effects for, defaults to null
     * @returns {Array}
     */
    IFStylable.Effects.prototype.getEffectsBBox = function (bbox, layer) {
        var padding = this.getEffectsPadding(layer);
        if (padding) {
            return bbox.expanded(padding[0], padding[1], padding[2], padding[3]);
        }
        return bbox;
    };

    /**
     * Returns the effects padding
     * @param {String} [layer] layer to get effects for, defaults to null
     * @returns {Array}
     */
    IFStylable.Effects.prototype.getEffectsPadding = function (layer) {
        var effects = this.getEffectsForLayer(layer, true);
        if (!effects) {
            return null;
        }

        var effectPadding = [0, 0, 0, 0];
        var approxEffectPadding = [0, 0, 0, 0];
        var lastEffect = null;

        for (var ef = 0; ef < effects.length; ++ef) {
            var effect = effects[ef];
            var currEffectPadding = effect.getEffectPadding();
            if (!currEffectPadding) {
                continue;
            }

            if (!(currEffectPadding instanceof Array)) {
                currEffectPadding = [currEffectPadding, currEffectPadding, currEffectPadding, currEffectPadding];
            }

            switch (effect.getEffectType()) {
                case IFEffect.Type.PreEffect:
                case IFEffect.Type.PostEffect:
                    // Effects approximate
                    approxEffectPadding = [
                        Math.max(approxEffectPadding[0], currEffectPadding[0]),
                        Math.max(approxEffectPadding[1], currEffectPadding[1]),
                        Math.max(approxEffectPadding[2], currEffectPadding[2]),
                        Math.max(approxEffectPadding[3], currEffectPadding[3])
                    ];
                    break;

                case IFEffect.Type.Filter:
                    // If we had a non-filter effect before this one then
                    // add the approximated sum before our filter padding
                    if (lastEffect && lastEffect.getEffectType() !== IFEffect.Type.Filter) {
                        effectPadding = [
                            effectPadding[0] + approxEffectPadding[0],
                            effectPadding[1] + approxEffectPadding[1],
                            effectPadding[2] + approxEffectPadding[2],
                            effectPadding[3] + approxEffectPadding[3]
                        ];
                        approxEffectPadding = [0, 0, 0, 0];
                    }

                    // Filters sum up
                    effectPadding = [
                        effectPadding[0] + currEffectPadding[0],
                        effectPadding[1] + currEffectPadding[1],
                        effectPadding[2] + currEffectPadding[2],
                        effectPadding[3] + currEffectPadding[3]
                    ];
                    break;
            }

            lastEffect = effect;
        }

        // If we had a non-filter effect as last one then
        // add the approximated sum to our effect paddings
        if (lastEffect && lastEffect.getEffectType() !== IFEffect.Type.Filter) {
            effectPadding = [
                effectPadding[0] + approxEffectPadding[0],
                effectPadding[1] + approxEffectPadding[1],
                effectPadding[2] + approxEffectPadding[2],
                effectPadding[3] + approxEffectPadding[3]
            ];
        }

        return effectPadding;
    };

    // --------------------------------------------------------------------------------------------
    // IFStylable Mixin
    // --------------------------------------------------------------------------------------------

    /**
     * The property-sets this stylable supports
     * @returns {Array<IFStylable.PropertySet>} list of supported
     * property sets
     * @private
     */
    IFStylable.prototype.getStylePropertySets = function () {
        return [IFStylable.PropertySet.Style, IFStylable.PropertySet.Effects];
    };

    /**
     * Returns the style effects. If the style doesn't support effects
     * then this will return null.
     * @returns {IFStylable.Effects}
     */
    IFStylable.prototype.getEffects = function () {
        if (this.getStylePropertySets().indexOf(IFStylable.PropertySet.Effects) >= 0) {
            if (!this._effects) {
                this._effects = new IFStylable.Effects();
                this._effects._parent = this;
                this._effects._setScene(this._scene);
            }
            return this._effects;
        }
    };

    /**
     * Assign style from a source style
     * @param {IFStylable} source
     * @param {*} [diffProperties] If provided, should contain property->value
     * entries that are used for comparing whether to assign a property value or not.
     * If the property value to be assigned doesn't equal the one in this parameter,
     * it will not be overwritten. If this is provided, also only the given properties
     * will be assigned, all others will be ignored.
     */
    IFStylable.prototype.assignStyleFrom = function (source, diffProperties) {
        // Collect union property sets
        var sourcePS = source.getStylePropertySets();
        var myPS = this.getStylePropertySets();
        var unionPS = [];

        for (var i = 0; i < sourcePS.length; ++i) {
            var ps = sourcePS[i];
            for (var j = 0; j < myPS.length; ++j) {
                if (myPS[j] === ps) {
                    unionPS.push(ps);
                    break;
                }
            }
        }

        if (unionPS.length > 0) {
            var sourceProperties = [];
            for (var p = 0; p < unionPS.length; ++p) {
                var propertySetInfo = IFStylable.PropertySetInfo[unionPS[p]];
                var properties = [];
                if (propertySetInfo.visualProperties) {
                    properties = properties.concat(Object.keys(propertySetInfo.visualProperties));
                }
                if (propertySetInfo.geometryProperties) {
                    properties = properties.concat(Object.keys(propertySetInfo.geometryProperties));
                }

                for (var i = 0; i < properties.length; ++i) {
                    var property = properties[i];
                    var addProperty = true;

                    if (diffProperties) {
                        // Only assign property if it is contained in diff properties and
                        // when it has the same value as in diff properties
                        var myPropVal = this.getProperty(property);
                        var diffPropVal = diffProperties[property];
                        var srcPropVal = source.getProperty(property);
                        addProperty = diffProperties.hasOwnProperty(property) && (IFUtil.equals(myPropVal, diffPropVal) || IFUtil.equals(myPropVal, srcPropVal));
                    }

                    if (addProperty && property !== '_sdf') {
                        sourceProperties.push(property);
                    }
                }
            }

            if (sourceProperties.length > 0) {
                var sourceValues = source.getProperties(sourceProperties);
                this.setProperties(sourceProperties, sourceValues, false, true /*force*/);
            }
        }
    };

    /**
     * Returns whether a paintable border is available or not
     * @returns {boolean}
     */
    IFStylable.prototype.hasStyleBorder = function () {
        return !!this.$_bpt && this.$_bw > 0.0 && this.$_bop > 0.0;
    };

    /**
     * Returns whether a paintable fill is available or not
     * @returns {boolean}
     */
    IFStylable.prototype.hasStyleFill = function () {
        return !!this.$_fpt && this.$_fop > 0.0;
    };

    /**
     * Returns the required padding for the currently setup border
     * @returns {Number}
     */
    IFStylable.prototype.getStyleBorderPadding = function () {
        // Padding depends on border-width and alignment and miter limit if miter join is used
        if (this.$_ba === IFStylable.BorderAlignment.Center) {
            return this.$_bw / 2;
        } else if (this.$_ba === IFStylable.BorderAlignment.Outside) {
            return this.$_bw;
        }
        return 0;
    };

    /**
     * Set the style default properties
     */
    IFStylable.prototype._setStyleDefaultProperties = function () {
        var propertySets = this.getStylePropertySets();
        for (var p = 0; p < propertySets.length; ++p) {
            var propertySetInfo = IFStylable.PropertySetInfo[propertySets[p]];
            if (propertySetInfo.visualProperties) {
                this._setDefaultProperties(propertySetInfo.visualProperties);
            }
            if (propertySetInfo.geometryProperties) {
                this._setDefaultProperties(propertySetInfo.geometryProperties);
            }
        }
    };

    /**
     * Change handler for styles
     * @param {Number} change
     * @param {*} args
     */
    IFStylable.prototype._handleStyleChange = function (change, args) {
        if (change === IFNode._Change.BeforePropertiesChange || change === IFNode._Change.AfterPropertiesChange) {
            var visualChange = false;
            var geometryChange = false;
            for (var i = 0; i < args.properties.length; ++i) {
                var property = args.properties[i];
                if (IFStylable.AllGeometryProperties.hasOwnProperty(property)) {
                    geometryChange = true;
                    if (change === IFNode._Change.BeforePropertiesChange) {
                        this._stylePrepareGeometryChange();
                    } else {
                        this._styleFinishGeometryChange();
                        this._stylePropertiesUpdated(args.properties, args.values);
                    }
                    break;
                } else if (IFStylable.AllVisualProperties.hasOwnProperty(property)) {
                    if (change === IFNode._Change.AfterPropertiesChange) {
                        visualChange = true;
                    }
                }
            }

            if (!geometryChange && visualChange) {
                this._styleRepaint();
                this._stylePropertiesUpdated(args.properties, args.values);
            }
        } else if (change === IFNode._Change.Store) {
            var propertySets = this.getStylePropertySets();
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                if (propertySet === IFStylable.PropertySet.Effects) {
                    if (this._effects) {
                        args._eff = IFNode.store(this._effects);
                    }
                } else {
                    var propertySetInfo = IFStylable.PropertySetInfo[propertySet];
                    if (propertySetInfo.visualProperties) {
                        this.storeProperties(args, propertySetInfo.visualProperties, propertySetInfo.storeFilter);
                    }
                    if (propertySetInfo.geometryProperties) {
                        this.storeProperties(args, propertySetInfo.geometryProperties, propertySetInfo.storeFilter);
                    }
                }
            }
        } else if (change === IFNode._Change.Restore) {
            var propertySets = this.getStylePropertySets();
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                if (propertySet === IFStylable.PropertySet.Effects) {
                    if (args._eff) {
                        this._effects = IFNode.restore(args._eff);
                        this._effects._parent = this;
                        this._effects._setScene(this._scene);
                    }
                } else {
                    var propertySetInfo = IFStylable.PropertySetInfo[propertySet];
                    if (propertySetInfo.visualProperties) {
                        this.restoreProperties(args, propertySetInfo.visualProperties, propertySetInfo.restoreFilter);
                    }
                    if (propertySetInfo.geometryProperties) {
                        this.restoreProperties(args, propertySetInfo.geometryProperties, propertySetInfo.restoreFilter);
                    }
                }
            }
        } else if (change === IFNode._Change.Attached) {
            if (this._effects) {
                this._effects._setScene(this._scene);
            }
        } else if (change === IFNode._Change.Detach) {
            if (this._effects) {
                this._effects._setScene(null);
            }
        }
    };

    /**
     * @param {Boolean} [effect] whether the call comes from effects or not
     * @private
     */
    IFStylable.prototype._stylePrepareGeometryChange = function (effect) {
        // NO-OP
    };

    /**
     * @param {Boolean} [effect] whether the call comes from effects or not
     * @private
     */
    IFStylable.prototype._styleFinishGeometryChange = function (effect) {
        // NO-OP
    };

    /** @private */
    IFStylable.prototype._styleRepaint = function () {
        // NO-OP
    };

    /** @private */
    IFStylable.prototype._stylePropertiesUpdated = function (properties, previousValues) {
        // NO-OP
    };

    /** @override */
    IFStylable.prototype.toString = function () {
        return "[Mixin IFStylable]";
    };

    _.IFStylable = IFStylable;
})(this);