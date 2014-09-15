(function (_) {
    /**
     * The style class
     * @class IFStyle
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyle() {
        IFNode.call(this);
        IFStyle.setDefaultProperties(this);
    }

    IFNode.inheritAndMix("style", IFStyle, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * The property set of a style
     * @enum
     */
    IFStyle.PropertySet = {
        Style: 'S',
        Effects: 'E',
        Fill: 'F',
        Stroke: 'S',
        Text: 'T',
        Paragraph: 'P'
    };

    /**
     * The layer of a style rendering
     * @enum
     */
    IFStyle.Layer = {
        /**
         * Background Layer
         */
        Background: 'B',

        /**
         * Content Layer
         */
        Content: 'C',

        /**
         * Foreground Layer
         */
        Foreground: 'F'
    };

    /**
     * Alignment of a stroke
     * @enum
     */
    IFStyle.StrokeAlignment = {
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
    IFStyle.ParagraphAlignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    IFStyle.ParagraphWrapMode = {
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
     * Visual Properties for a style
     * @enum
     */
    IFStyle.VisualStyleProperties = {
        /** Blend Mode */
        _blm: IFPaintCanvas.BlendMode.Normal,
        /** Fill Opacity (= w/o effects) */
        _fop: 1,
        /** Opacity (= total opacity w/ effects) */
        _opc: 1
    };

    /**
     * Visual Properties for a style fill
     * @enum
     */
    IFStyle.VisualFillProperties = {
        /** Fill pattern (IFPattern) */
        _fpt: null
    };

    /**
     * Visual Properties for a style stroke
     * @enum
     */
    IFStyle.VisualStrokeProperties = {
        /** Stroke pattern (IFPattern) */
        _spt: null
    };

    /**
     * Geometry Properties for a style stroke
     * @enum
     */
    IFStyle.GeometryStrokeProperties = {
        /** Stroke Width */
        _sw: 1,
        /** Stroke Alignment */
        _sa: IFStyle.StrokeAlignment.Center,
        /** Line-Caption */
        _slc: IFPaintCanvas.LineCap.Square,
        /** Line-Join */
        _slj: IFPaintCanvas.LineJoin.Miter,
        /** Line-Miter-Limit */
        _slm: 10
    };

    /**
     * Geometry Properties for a style text
     * @enum
     */
    IFStyle.GeometryTextProperties = {
        /** The font family */
        _tff: null,
        /** The font size */
        _tfi: null,
        /** The font-weight (IFFont.Weight) */
        _tfw: null,
        /** The font-style (IFFont.Style) */
        _tfs: null,
        /** The character spacing */
        _tcs: null,
        /** The word spacing */
        _tws: null
    };

    /**
     * Geometry Properties for a style paragraph
     * @enum
     */
    IFStyle.GeometryParagraphProperties = {
        /** Column count */
        _pcc: null,
        /** Column gap */
        _pcg: null,
        /** Wrap-Mode of a paragraph (IFStyle.ParagraphWrapMode) */
        _pwm: null,
        /** The paragraph's alignment (IFStyle.ParagraphAlignment) */
        _pal: null,
        /** The first line intendation */
        _pin: null,
        /** The line height whereas 1 = 100% */
        _plh: null
    };

    _.IFStyle = IFStyle;
})(this);