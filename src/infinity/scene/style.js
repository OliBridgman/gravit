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
        ff: null,
        /** The font size */
        fi: null,
        /** The font-weight (IFFont.Weight) */
        fw: null,
        /** The font-style (IFFont.Style) */
        fs: null,
        /** The character spacing */
        cs: null,
        /** The word spacing */
        ws: null
    };

    /**
     * Geometry Properties for a style paragraph
     * @enum
     */
    IFStyle.GeometryParagraphProperties = {
        /** Column count */
        cc: null,
        /** Column gap */
        cg: null,
        /** Wrap-Mode of a paragraph (IFText.Paragraph.WrapMode) */
        wm: null,
        /** The paragraph's alignment (IFText.Paragraph.Alignment) */
        al: null,
        /** The first line intendation */
        in: null,
        /** The line height whereas 1 = 100% */
        lh: null
    };

    _.IFStyle = IFStyle;
})(this);