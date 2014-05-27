(function (_) {

    /**
     * @enum
     */
    var IFCursor = {
        /**
         * The default/auto cursor
         */
        Default: null,

        /**
         * Select cursor
         * @version 1.0
         */
        Select: "select",

        /**
         * Select inverse cursor
         * @version 1.0
         */
        SelectInverse: "select-inverse",

        /**
         * Select dot cursor
         * @version 1.0
         */
        SelectDot: "select-dot",

        /**
         * Select dot inverse cursor
         * @version 1.0
         */
        SelectDotInverse: "select-dot-inverse",

        /**
         * Zoom-Plus cursor
         * @version 1.0
         */
        ZoomPlus: "zoom-plus",

        /**
         * Zoom-Minus cursor
         * @version 1.0
         */
        ZoomMinus: "zoom-minus",

        /**
         * Zoom-None cursor
         * @version 1.0
         */
        ZoomNone: "zoom-none",

        /**
         * Opened hand cursor
         * @version 1.0
         */
        HandOpen: "hand-open",

        /**
         * Closed hand cursor
         * @version 1.0
         */
        HandClosed: "hand-closed",

        /**
         * A small cross
         * @version 1.0
         */
        Cross: "cross",

        /**
         * A pen
         * @version 1.0
         */
        Pen: "pen",

        /**
         * A pen with a start indicator
         * @version 1.0
         */
        PenStart: "pen-start",

        /**
         * A pen with an end indicator
         * @version 1.0
         */
        PenEnd: "pen-end",

        /**
         * A pen with a plus indicator
         * @version 1.0
         */
        PenPlus: "pen-plus",


        /**
         * A pen with a minus indicator
         * @version 1.0
         */
        PenMinus: "pen-minus",

        /**
         * A pen with a modify indicator
         * @version 1.0
            */
        PenModify: "pen-modify",

        /**
         * A black arrow
         * @version 1.0
         */
        PenDrag: "pen-drag",

        /**
         * A lasso
         * @version 1.0
         */
        Lasso: "lasso",

        /**
         * A pipette / eyedropper
         */
        Pipette: "pipette",

        /**
         * A text marker (beam)
         */
        Text: "text"
    };

    _.IFCursor = IFCursor;
})(this);