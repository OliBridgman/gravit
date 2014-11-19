(function (_) {
    /**
     * Mixin to mark something containing a style
     * @class GStylable
     * @constructor
     * @mixin
     * @extends GObject
     */
    GStylable = function () {
    };
    GObject.inherit(GStylable, GObject);

    /**
     * @type {GStylable.Effects}
     * @private
     */
    GStylable._effects = null;

    /**
     * Style layer
     * @enum
     */
    GStylable.StyleLayer = {
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
     * Localized names for GStylable.StyleLayer
     */
    GStylable.StyleLayerName = {
        '': new GLocale.Key(GStylable, 'layer.element'),
        'F': new GLocale.Key(GStylable, 'layer.fill'),
        'B': new GLocale.Key(GStylable, 'layer.border')
    };

    /**
     * Style layer
     * @enum
     */
    GStylable.StyleLayer = {
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
    GStylable.BorderAlignment = {
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
    GStylable.ParagraphAlignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    GStylable.ParagraphWrapMode = {
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
    GStylable.PropertySet = {
        Style: 'S',
        Effects: 'E',
        Fill: 'F',
        Border: 'B',
        Text: 'T',
        Paragraph: 'P'
    };

    GStylable.PropertySetInfo = {
        'S': {
            visualProperties: {
                /** Internal default style marker */
                _sdf: null,
                /** Blend Mode (GPaintCanvas.BlendMode|'m'=mask|'!m'=inverse mask) */
                _sbl: GPaintCanvas.BlendMode.Normal,
                /** Fill Opacity (= w/o effects) */
                _sfop: 1,
                /** Opacity (= total opacity w/ effects) */
                _stop: 1
            }
        },
        'E': {},
        'F': {
            visualProperties: {
                /** Fill pattern (GPattern) */
                _fpt: null,
                /** Fill opacity */
                _fop: 1
            },
            geometryProperties: {
                /** Fill pattern transformation (GTransform) */
                _fpx: null
            },
            storeFilter: function (property, value) {
                if (value) {
                    if (property === '_fpt') {
                        return GPattern.serialize(value);
                    } else if (property === '_fpx') {
                        return GTransform.serialize(value);
                    }
                }
                return value;
            },
            restoreFilter: function (property, value) {
                if (value) {
                    if (property === '_fpt') {
                        return GPattern.deserialize(value);
                    } else if (property === '_fpx') {
                        return GTransform.deserialize(value);
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
                /** Border pattern (GPattern) */
                _bpt: null,
                /** Border pattern transformation (GTransform) */
                _bpx: null,
                /** Border Width */
                _bw: 1,
                /** Border Alignment */
                _ba: GStylable.BorderAlignment.Center,
                /** Line-Caption */
                _blc: GPaintCanvas.LineCap.Square,
                /** Line-Join */
                _blj: GPaintCanvas.LineJoin.Miter,
                /** Miter-Limit */
                _bml: 3
            },
            storeFilter: function (property, value) {
                if (value) {
                    if (property === '_bpt') {
                        return GPattern.serialize(value);
                    } else if (property === '_bpx') {
                        return GTransform.serialize(value);
                    }
                }
                return value;
            },
            restoreFilter: function (property, value) {
                if (value) {
                    if (property === '_bpt') {
                        return GPattern.deserialize(value);
                    } else if (property === '_bpx') {
                        return GTransform.deserialize(value);
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
                /** The font-weight (GFont.Weight) */
                _tfw: GFont.Weight.Regular,
                /** The font-style (GFont.Style) */
                _tfs: GFont.Style.Normal,
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
                /** Wrap-Mode of a paragraph (GStylable.ParagraphWrapMode) */
                _pwm: GStylable.ParagraphWrapMode.Words,
                /** The paragraph's alignment (GStylable.ParagraphAlignment) */
                _pal: null,
                /** The first line intendation */
                _pin: null,
                /** The line height whereas 1 = 100% */
                _plh: 1
            }
        }
    };

    GStylable.AllVisualProperties = {};
    GStylable.AllGeometryProperties = {};

    for (var propertySet in GStylable.PropertySetInfo) {
        var propertySetInfo = GStylable.PropertySetInfo[propertySet];
        if (propertySetInfo.visualProperties) {
            for (var property in propertySetInfo.visualProperties) {
                GStylable.AllVisualProperties[property] = propertySetInfo.visualProperties[property];
            }
        }
        if (propertySetInfo.geometryProperties) {
            for (var property in propertySetInfo.geometryProperties) {
                GStylable.AllGeometryProperties[property] = propertySetInfo.geometryProperties[property];
            }
        }
    }

    // --------------------------------------------------------------------------------------------
    // GStylable.Effects Class
    // --------------------------------------------------------------------------------------------
    /**
     * Effects Class
     * @class GStylable.Effects
     * @inherit GNode
     * @mixes GNode.Container
     * @mixes GNode.Store
     * @constructor
     */
    GStylable.Effects = function () {
    };
    GNode.inheritAndMix('effects', GStylable.Effects, GNode, [GNode.Container, GNode.Store]);

    /**
     * Returns an ordered list of effects for each given layer if any.
     * @param {Array<String>} [layers] the layers to get effects for, defaults to null
     * @param {Boolean} [visibleOnly] if set, only visible effects will be returned.
     * @returns {Array} array keeping an ordered list of layers and their effects
     * array or null if there're no effects for that layer. The last layer is the "null" layer.
     */
    GStylable.Effects.prototype.getLayersEffects = function (layers, visibleOnly) {
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
     * @returns {Array<GEffect>} an array of effects or null if there're no effects
     */
    GStylable.Effects.prototype.getEffectsForLayer = function (layer, visibleOnly) {
        layer = layer || null;
        var result = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GEffect) {
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
    GStylable.Effects.prototype.insertChild = function (child, reference) {
        if (child instanceof GEffect && child.getEffectType() === GEffect.Type.PreEffect) {
            for (var prev = reference ? reference : this.getLastChild(); prev !== null; prev = prev.getPrevious()) {
                if (prev instanceof GEffect) {
                    if (prev.getEffectType() === GEffect.Type.PreEffect) {
                        reference = prev.getNext();
                        break;
                    } else if (prev.getEffectType() === GEffect.Type.PostEffect) {
                        reference = prev;
                    }
                }
            }
        }

        GNode.Container.prototype.insertChild.call(this, child, reference);
    };

    /** @override */
    GStylable.Effects.prototype._handleChange = function (change, args) {
        var ownerStyle = this.getParent();
        if (ownerStyle && ownerStyle.hasMixin(GStylable)) {
            if ((change == GNode._Change.BeforeChildInsert || change === GNode._Change.BeforeChildRemove) && args instanceof GEffect) {
                ownerStyle._stylePrepareGeometryChange(true);
            }
            if ((change == GNode._Change.AfterChildInsert || change === GNode._Change.AfterChildRemove) && args instanceof GEffect) {
                ownerStyle._styleFinishGeometryChange(true);
            }
        }
        GNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Returns an effect bbox
     * @param {GRect} bbox the source bbox
     * @param {String} [layer] layer to get effects for, defaults to null
     * @returns {Array}
     */
    GStylable.Effects.prototype.getEffectsBBox = function (bbox, layer) {
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
    GStylable.Effects.prototype.getEffectsPadding = function (layer) {
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
                case GEffect.Type.PreEffect:
                case GEffect.Type.PostEffect:
                    // Effects approximate
                    approxEffectPadding = [
                        Math.max(approxEffectPadding[0], currEffectPadding[0]),
                        Math.max(approxEffectPadding[1], currEffectPadding[1]),
                        Math.max(approxEffectPadding[2], currEffectPadding[2]),
                        Math.max(approxEffectPadding[3], currEffectPadding[3])
                    ];
                    break;

                case GEffect.Type.Filter:
                    // If we had a non-filter effect before this one then
                    // add the approximated sum before our filter padding
                    if (lastEffect && lastEffect.getEffectType() !== GEffect.Type.Filter) {
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
        if (lastEffect && lastEffect.getEffectType() !== GEffect.Type.Filter) {
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
    // GStylable Mixin
    // --------------------------------------------------------------------------------------------

    /**
     * The property-sets this stylable supports
     * @returns {Array<GStylable.PropertySet>} list of supported
     * property sets
     * @private
     */
    GStylable.prototype.getStylePropertySets = function () {
        return [GStylable.PropertySet.Style, GStylable.PropertySet.Effects];
    };

    /**
     * Returns the style effects. If the style doesn't support effects
     * then this will return null.
     * @returns {GStylable.Effects}
     */
    GStylable.prototype.getEffects = function () {
        if (this.getStylePropertySets().indexOf(GStylable.PropertySet.Effects) >= 0) {
            if (!this._effects) {
                this._effects = new GStylable.Effects();
                this._effects._parent = this;
                this._effects._setScene(this._scene);
            }
            return this._effects;
        }
    };

    /**
     * Assign style from a source style
     * @param {GStylable} source
     * @param {GStylable} [compare] a compare style, defaults to null
     */
    GStylable.prototype.assignStyleFrom = function (source, compare) {
        // Collect union property sets
        var sourcePS = source.getStylePropertySets();
        var myPS = this.getStylePropertySets();
        var comparePS = compare ? compare.getStylePropertySets() : null;
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
            // Handle effects
            if (unionPS.indexOf(GStylable.PropertySet.Effects) >= 0) {
                var myEffects = this.getEffects();
                var srcEffects = source.getEffects();
                var sentEffectPrepare = false;
                myEffects._beginBlockChanges([GNode._Change.BeforeChildRemove, GNode._Change.AfterChildRemove, GNode._Change.BeforeChildInsert, GNode._Change.AfterChildInsert]);

                try {
                    if (compare && comparePS.indexOf(GStylable.PropertySet.Effects)) {
                        // TODO : Improve diffing and delete/insert styles as well
                        var cmpEffects = compare.getEffects();

                        var index = 0;
                        for (var srcEff = srcEffects.getFirstChild(); srcEff !== null; srcEff = srcEff.getNext()) {
                            var myEff = myEffects.getChildByIndex(index);
                            var cmpEff = cmpEffects.getChildByIndex(index);
                            if (myEff && cmpEff && GUtil.equals(myEff, cmpEff)) {
                                if (!sentEffectPrepare) {
                                    this._stylePrepareGeometryChange(true);
                                    sentEffectPrepare = true;
                                }

                                myEffects.insertChild(srcEff.clone(), myEff);
                                myEffects.removeChild(myEff);
                            }
                            index++;
                        }
                    } else {
                        if (myEffects.getFirstChild()) {
                            if (!sentEffectPrepare) {
                                this._stylePrepareGeometryChange(true);
                                sentEffectPrepare = true;
                            }

                            while (myEffects.getFirstChild()) {
                                myEffects.removeChild(myEffects.getFirstChild());
                            }
                        }

                        for (var srcEff = srcEffects.getFirstChild(); srcEff !== null; srcEff = srcEff.getNext()) {
                            if (!sentEffectPrepare) {
                                this._stylePrepareGeometryChange(true);
                                sentEffectPrepare = true;
                            }

                            myEffects.appendChild(srcEff.clone());
                        }
                    }
                } finally {
                    myEffects._endBlockChanges([GNode._Change.BeforeChildRemove, GNode._Change.AfterChildRemove, GNode._Change.BeforeChildInsert, GNode._Change.AfterChildInsert]);

                    if (sentEffectPrepare) {
                        this._styleFinishGeometryChange(true);
                    }
                }
            }

            // Handle style properties
            var sourceProperties = [];
            for (var p = 0; p < unionPS.length; ++p) {
                var propertySetInfo = GStylable.PropertySetInfo[unionPS[p]];
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

                    if (compare && comparePS.indexOf(propertySetInfo) >= 0) {
                        // Only assign property if it is contained in compare properties and
                        // when it has the same value as in compare properties
                        var myPropVal = this.getProperty(property);
                        var diffPropVal = compare.getProperty(property);
                        var srcPropVal = source.getProperty(property);
                        addProperty = compare.hasProperty(property) && (GUtil.equals(myPropVal, diffPropVal) || GUtil.equals(myPropVal, srcPropVal));
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
    GStylable.prototype.hasStyleBorder = function () {
        return !!this.$_bpt && this.$_bw > 0.0 && this.$_bop > 0.0;
    };

    /**
     * Returns whether a paintable fill is available or not
     * @returns {boolean}
     */
    GStylable.prototype.hasStyleFill = function () {
        return !!this.$_fpt && this.$_fop > 0.0;
    };

    /**
     * Returns the required padding for the currently setup border
     * @returns {Number}
     */
    GStylable.prototype.getStyleBorderPadding = function () {
        // Padding depends on border-width and alignment and miter limit if miter join is used
        if (this.$_ba === GStylable.BorderAlignment.Center) {
            return this.$_bw / 2;
        } else if (this.$_ba === GStylable.BorderAlignment.Outside) {
            return this.$_bw;
        }
        return 0;
    };

    /**
     * Set the style default properties
     */
    GStylable.prototype._setStyleDefaultProperties = function () {
        var propertySets = this.getStylePropertySets();
        for (var p = 0; p < propertySets.length; ++p) {
            var propertySetInfo = GStylable.PropertySetInfo[propertySets[p]];
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
    GStylable.prototype._handleStyleChange = function (change, args) {
        if (change === GNode._Change.BeforePropertiesChange || change === GNode._Change.AfterPropertiesChange) {
            var visualChange = false;
            var geometryChange = false;
            for (var i = 0; i < args.properties.length; ++i) {
                var property = args.properties[i];
                if (GStylable.AllGeometryProperties.hasOwnProperty(property)) {
                    geometryChange = true;
                    if (change === GNode._Change.BeforePropertiesChange) {
                        this._stylePrepareGeometryChange();
                    } else {
                        this._styleFinishGeometryChange();
                        this._stylePropertiesUpdated(args.properties, args.values);
                    }
                    break;
                } else if (GStylable.AllVisualProperties.hasOwnProperty(property)) {
                    if (change === GNode._Change.AfterPropertiesChange) {
                        visualChange = true;
                    }
                }
            }

            if (!geometryChange && visualChange) {
                this._styleRepaint();
                this._stylePropertiesUpdated(args.properties, args.values);
            }
        } else if (change === GNode._Change.Store) {
            var propertySets = this.getStylePropertySets();
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                if (propertySet === GStylable.PropertySet.Effects) {
                    if (this._effects) {
                        args._eff = GNode.store(this._effects);
                    }
                } else {
                    var propertySetInfo = GStylable.PropertySetInfo[propertySet];
                    if (propertySetInfo.visualProperties) {
                        this.storeProperties(args, propertySetInfo.visualProperties, propertySetInfo.storeFilter);
                    }
                    if (propertySetInfo.geometryProperties) {
                        this.storeProperties(args, propertySetInfo.geometryProperties, propertySetInfo.storeFilter);
                    }
                }
            }
        } else if (change === GNode._Change.Restore) {
            var propertySets = this.getStylePropertySets();
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                if (propertySet === GStylable.PropertySet.Effects) {
                    if (args._eff) {
                        this._effects = GNode.restore(args._eff);
                        this._effects._parent = this;
                        this._effects._setScene(this._scene);
                    }
                } else {
                    var propertySetInfo = GStylable.PropertySetInfo[propertySet];
                    if (propertySetInfo.visualProperties) {
                        this.restoreProperties(args, propertySetInfo.visualProperties, propertySetInfo.restoreFilter);
                    }
                    if (propertySetInfo.geometryProperties) {
                        this.restoreProperties(args, propertySetInfo.geometryProperties, propertySetInfo.restoreFilter);
                    }
                }
            }
        } else if (change === GNode._Change.Attached) {
            if (this._effects) {
                this._effects._setScene(this._scene);
            }
        } else if (change === GNode._Change.Detach) {
            if (this._effects) {
                this._effects._setScene(null);
            }
        }
    };

    /**
     * @param {Boolean} [effect] whether the call comes from effects or not
     * @private
     */
    GStylable.prototype._stylePrepareGeometryChange = function (effect) {
        // NO-OP
    };

    /**
     * @param {Boolean} [effect] whether the call comes from effects or not
     * @private
     */
    GStylable.prototype._styleFinishGeometryChange = function (effect) {
        // NO-OP
    };

    /** @private */
    GStylable.prototype._styleRepaint = function () {
        // NO-OP
    };

    /** @private */
    GStylable.prototype._stylePropertiesUpdated = function (properties, previousValues) {
        // NO-OP
    };

    /** @override */
    GStylable.prototype.toString = function () {
        return "[Mixin GStylable]";
    };

    _.GStylable = GStylable;
})(this);