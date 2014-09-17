(function (_) {
    /**
     * The style definition class
     * @class IFStyleDefinition
     * @constructor
     */
    function IFStyleDefinition() {
        IFNode.call(this);
    }

    /**
     * The property set of a style
     * @enum
     */
    IFStyleDefinition.PropertySet = {
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
    IFStyleDefinition.Layer = {
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

    IFStyleDefinition.LAYER_ORDER = [IFStyleDefinition.Layer.Background, IFStyleDefinition.Layer.Content, IFStyleDefinition.Layer.Foreground];

    /**
     * Alignment of a stroke
     * @enum
     */
    IFStyleDefinition.StrokeAlignment = {
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
    IFStyleDefinition.ParagraphAlignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    IFStyleDefinition.ParagraphWrapMode = {
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
    IFStyleDefinition.VisualStyleProperties = {
        /** Blend Mode */
        _sbl: IFPaintCanvas.BlendMode.Normal,
        /** Fill Opacity (= w/o effects) */
        _sfop: 1,
        /** Opacity (= total opacity w/ effects) */
        _stop: 1
    };

    /**
     * Visual Properties for a style fill
     * @enum
     */
    IFStyleDefinition.VisualFillProperties = {
        /** Fill pattern (IFPattern) */
        _fpt: null,
        /** Fill opacity */
        _fop: 1,
        /** Horizontal Fill translation (0..1) % */
        _ftx: 0,
        /** Vertical Fill translation (0..1) % */
        _fty: 0,
        /** Horizontal Fill Scalation (0..1) % */
        _fsx: 1,
        /** Vertical Fill Scalation (0..1) % */
        _fsy: 1,
        /** Fill Rotation in radians */
        _frt: 0
    };

    /**
     * Visual Properties for a style stroke
     * @enum
     */
    IFStyleDefinition.VisualStrokeProperties = {
        /** Stroke opacity */
        _sop: 1,
        /** Horizontal Stroke translation (0..1) % */
        _stx: 0,
        /** Vertical Stroke translation (0..1) % */
        _sty: 0,
        /** Horizontal Stroke Scalation (0..1) % */
        _ssx: 1,
        /** Vertical Stroke Scalation (0..1) % */
        _ssy: 1,
        /** Stroke Rotation in radians */
        _srt: 0
    };

    /**
     * Geometry Properties for a style stroke
     * @enum
     */
    IFStyleDefinition.GeometryStrokeProperties = {
        /** Stroke pattern (IFPattern) */
        _spt: null,
        /** Stroke Width */
        _sw: 1,
        /** Stroke Alignment */
        _sa: IFStyleDefinition.StrokeAlignment.Center,
        /** Line-Caption */
        _slc: IFPaintCanvas.LineCap.Square,
        /** Line-Join */
        _slj: IFPaintCanvas.LineJoin.Miter,
        /** Line-Miter-Limit */
        _slm: 1
    };

    /**
     * Geometry Properties for a style text
     * @enum
     */
    IFStyleDefinition.GeometryTextProperties = {
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
    IFStyleDefinition.GeometryParagraphProperties = {
        /** Column count */
        _pcc: null,
        /** Column gap */
        _pcg: null,
        /** Wrap-Mode of a paragraph (IFStyleDefinition.ParagraphWrapMode) */
        _pwm: null,
        /** The paragraph's alignment (IFStyleDefinition.ParagraphAlignment) */
        _pal: null,
        /** The first line intendation */
        _pin: null,
        /** The line height whereas 1 = 100% */
        _plh: null
    };

    _.IFStyleDefinition = IFStyleDefinition;
})(this);