(function (_) {

    /**
     * @class GKey
     * @constructor
     * @version 1.0
     */
    function GKey() {
    };

    /**
     * Enumeration of available key code constants
     * @version 1.0
     */
    GKey.Constant = {
        /**
         * A printable character
         * @version 1.0
         */
        CHARACTER: 0,

        /**
         * Space key
         * @version 1.0
         */
        SPACE: 1,

        /**
         * Enter key
         * @version 1.0
         */
        ENTER: 2,

        /**
         * Tab key
         * @version 1.0
         */
        TAB: 3,

        /**
         * Backspace key
         * @version 1.0
         */
        BACKSPACE: 4,

        /**
         * Control key
         * @version 1.0
         */
        CONTROL: 5,

        /**
         * Shift key
         * @version 1.0
         */
        SHIFT: 6,

        /**
         * Alt key
         * @version 1.0
         */
        ALT: 7,

        /**
         * Left arrow
         * @version 1.0
         */
        LEFT: 8,

        /**
         * Up arrow
         * @version 1.0
         */
        UP: 9,

        /**
         * Right arrow
         * @version 1.0
         */
        RIGHT: 10,

        /**
         * Down arrow
         * @version 1.0
         */
        DOWN: 11,

        /**
         * Page-up key
         * @version 1.0
         */
        PAGE_UP: 12,

        /**
         * Page-down key
         * @version 1.0
         */
        PAGE_DOWN: 13,

        /**
         * Home/POS1 key
         * @version 1.0
         */
        HOME: 14,

        /**
         * End key
         * @version 1.0
         */
        END: 15,

        /**
         * Insert key
         * @version 1.0
         */
        INSERT: 16,

        /**
         * Delete key
         * @version 1.0
         */
        DELETE: 17,

        /**
         * Command key
         * @version 1.0
         */
        COMMAND: 19,

        /**
         * Function Key 'F1'
         */
        F1: 30,

        /**
         * Function Key 'F2'
         */
        F2: 31,

        /**
         * Function Key 'F3'
         */
        F3: 32,

        /**
         * Function Key 'F4'
         */
        F4: 33,

        /**
         * Function Key 'F5'
         */
        F5: 34,

        /**
         * Function Key 'F6'
         */
        F6: 35,

        /**
         * Function Key 'F7'
         */
        F7: 36,

        /**
         * Function Key 'F8'
         */
        F8: 37,

        /**
         * Function Key 'F9'
         */
        F9: 38,

        /**
         * Function Key 'F10'
         */
        F10: 39,

        /**
         * Function Key 'F11'
         */
        F11: 40,

        /**
         * Function Key 'F12'
         */
        F12: 41,

        // Special identifiers

        /**
         * Meta key (command on mac, control on others)
         * @version 1.0
         */
        META: 100,

        /**
         * Option key (mostly alt)
         * @version 1.0
         */
        OPTION: 101,

        /**
         * Remove key (backspace on mac, del on others)
         */
        REMOVE: 102
    };

    GKey.translateKey = function (keyCode) {
        var result = null;
        switch (keyCode) {
            case 32 :
                result = GKey.Constant.SPACE;
                break;
            case 13 :
                result = GKey.Constant.ENTER;
                break;
            case 9 :
                result = GKey.Constant.TAB;
                break;
            case 8 :
                result = GKey.Constant.BACKSPACE;
                break;
            case 16 :
                result = GKey.Constant.SHIFT;
                break;
            case 17:
                result = GKey.Constant.CONTROL;
                break;
            case 18:
                result = GKey.Constant.ALT;
                break;
            case 37 :
                result = GKey.Constant.LEFT;
                break;
            case 38 :
                result = GKey.Constant.UP;
                break;
            case 39 :
                result = GKey.Constant.RIGHT;
                break;
            case 40 :
                result = GKey.Constant.DOWN;
                break;
            case 33 :
                result = GKey.Constant.PAGE_UP;
                break;
            case 34 :
                result = GKey.Constant.PAGE_DOWN;
                break;
            case 36 :
                result = GKey.Constant.HOME;
                break;
            case 35 :
                result = GKey.Constant.END;
                break;
            case 45 :
                result = GKey.Constant.INSERT;
                break;
            case 46 :
                result = GKey.Constant.DELETE;
                break;
            case 112 :
                result = GKey.Constant.F1;
                break;
            case 113 :
                result = GKey.Constant.F2;
                break;
            case 114 :
                result = GKey.Constant.F3;
                break;
            case 115 :
                result = GKey.Constant.F4;
                break;
            case 116 :
                result = GKey.Constant.F5;
                break;
            case 117 :
                result = GKey.Constant.F6;
                break;
            case 118 :
                result = GKey.Constant.F7;
                break;
            case 119 :
                result = GKey.Constant.F8;
                break;
            case 120 :
                result = GKey.Constant.F9;
                break;
            case 121 :
                result = GKey.Constant.F10;
                break;
            case 122 :
                result = GKey.Constant.F11;
                break;
            case 123 :
                result = GKey.Constant.F12;
                break;
            default:
                break;
        }

        if (result == null) {
            result = String.fromCharCode(keyCode);
        }

        return result;
    };

    GKey.transformKey = function (keyCode) {
        if (keyCode === GKey.Constant.META || keyCode === GKey.Constant.COMMAND) {
            if (GSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && GSystem.hardware === GSystem.Hardware.Desktop) {
                return GKey.Constant.COMMAND;
            } else {
                return GKey.Constant.CONTROL;
            }
        } else if (keyCode === GKey.Constant.OPTION) {
            return GKey.Constant.ALT;
        } else if (keyCode === GKey.Constant.REMOVE) {
            if (GSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS) {
                return GKey.Constant.BACKSPACE;
            } else {
                return GKey.Constant.DELETE;
            }
        } else {
            return keyCode;
        }
    };

    GKey.toLocalizedName = function (keyCode) {
        keyCode = GKey.transformKey(keyCode);
        return ifLocale.getValue(GKey, "key." + keyCode.toString());
    };

    GKey.toLocalizedShort = function (keyCode) {
        // Handle special chars on mac
        if (GSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && GSystem.hardware === GSystem.Hardware.Desktop) {
            if (keyCode == GKey.Constant.TAB) {
                return '\u21E5';
            } else if (keyCode == GKey.Constant.OPTION || keyCode == GKey.Constant.ALT) {
                return '\u2325';
            } else if (keyCode == GKey.Constant.META || keyCode == GKey.Constant.COMMAND) {
                return '\u2318';
            } else if (keyCode == GKey.Constant.SHIFT) {
                return '\u21E7';
            } else if (keyCode == GKey.Constant.CONTROL) {
                return '\u2303';
            } else if (keyCode == GKey.Constant.SPACE) {
                return '\u2423';
            } else if (keyCode == GKey.Constant.ENTER) {
                return '\u23CE';
            } else if (keyCode == GKey.Constant.REMOVE) {
                return '\u232B';
            } else if (keyCode == GKey.Constant.UP) {
                return '\u2191';
            } else if (keyCode == GKey.Constant.DOWN) {
                return '\u2193';
            } else if (keyCode == GKey.Constant.LEFT) {
                return '\u2190';
            } else if (keyCode == GKey.Constant.RIGHT) {
                return '\u2192';
            }
        }

        keyCode = GKey.transformKey(keyCode);
        var name = ifLocale.getValue(GKey, "key." + keyCode.toString() + ".short", null);
        if (!name) {
            return ifLocale.getValue(GKey, "key." + keyCode.toString());
        } else {
            return name;
        }
    };

    GKey.toSystemShortcut = function (character) {
        if (GSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && GSystem.hardware === GSystem.Hardware.Desktop) {
            if (character === '-') {
                return '\u2212';
            } else if (character === '+') {
                return '\u002B';
            }
        }
        return character.toUpperCase();
    }

    GKey.shortcutToString = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                // On platform others than mac we'll use a separator
                if (GSystem.operatingSystem != GSystem.OperatingSystem.OSX_IOS) {
                    result += "+";
                }
            }
            if (typeof shortcut[i] == 'number') {
                result += GKey.toLocalizedShort(shortcut[i]);
            } else {
                // Return uppercase chars
                result += GKey.toSystemShortcut(shortcut[i]);
            }
        }
        return result;
    };

    _.GKey = GKey;
})(this);