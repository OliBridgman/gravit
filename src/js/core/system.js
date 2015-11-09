(function (_) {

    /**
     * @class GSystem
     * @constructor
     * @version 1.0
     */
    function GSystem() {
    };

    /**
     * @enum
     * @version 1.0
     */
    GSystem.OperatingSystem = {
        /**
         * Linux/unix based operating system
         * @type {Number}
         * @version 1.0
         */
        Unix: 0,

        /**
         * Windows based operating system
         * @type {Number}
         * @version 1.0
         */
        Windows: 1,

        /**
         * OSX/IOS based operating system
         * @type {Number}
         * @version 1.0
         */
        OSX_IOS: 2
    };

    /**
     * @enum
     * @version 1.0
     */
    GSystem.Hardware = {
        /**
         * PC/Laptop based hardware
         * @type {Number}
         * @version 1.0
         */
        Desktop: 0,

        /**
         * Tablet based hardware
         * @type {Number}
         * @version 1.0
         */
        Tablet: 1,

        /**
         * Phone based hardware
         * @type {Number}
         * @version 1.0
         */
        Phone: 2
    };

    /**
     * Property defining whether the system is in little endian (true)
     * or in big endian (false) mode
     * @type {Boolean}
     * @version 1.0
     */
    GSystem.littleEndian = true;

    /**
     * Property defining the operating system type
     * @type {Number}
     * @see GSystem.OperatingSystem
     * @version 1.0
     */
    GSystem.operatingSystem = null;

    /**
     * Property defining the hardware type
     * @type {Number}
     * @see GSystem.Hardware
     * @version 1.0
     */
    GSystem.hardware = null;

    /**
     * Property defining the system's language
     * @type {String}
     * @version 1.0
     */
    GSystem.language = null;

    // Test little/big-endian using typed arrays
    GSystem.littleEndian = (function () {
        var testBuffer = new ArrayBuffer(8);
        var testArray = new Uint32Array(testBuffer);
        testArray[1] = 0x0a0b0c0d;
        return !(testBuffer[4] === 0x0a && testBuffer[5] === 0x0b && testBuffer[6] === 0x0c && testBuffer[7] === 0x0d);
    })();

    GSystem.hardware = (function () {
        var tablet = !!navigator.userAgent.match(/(iPad|SCH-I800|xoom|kindle)/i);
        var phone = !!navigator.userAgent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i);

        if (tablet) {
            return GSystem.Hardware.Tablet;
        } else if (phone) {
            return GSystem.Hardware.Phone;
        } else {
            return GSystem.Hardware.Desktop;
        }
    })();

    GSystem.operatingSystem = (function () {
        var os_data = [
            { string: navigator.platform, subString: "Win", identity: GSystem.OperatingSystem.Windows },
            { string: navigator.platform, subString: "Mac", identity: GSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "iPhone", identity: GSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "iPad", identity: GSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "Android", identity: GSystem.OperatingSystem.Unix },
            { string: navigator.platform, subString: "Linux", identity: GSystem.OperatingSystem.Unix }
        ];

        for (var i = 0; i < os_data.length; i++) {
            var dataString = os_data[i].string;
            if (dataString.indexOf(os_data[i].subString) != -1) {
                return os_data[i].identity;
            }
        }

        return GSystem.OperatingSystem.Windows;
    })();

    GSystem.language = (function () {
        var lang = ((navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage) || '').split("-");

        if (lang.length == 2) {
            return  lang[0].toLowerCase();
        } else if (lang) {
            return lang[0].toLowerCase();
        }

        return null;
    })();

    console.log('HW=' + GSystem.hardware + '; OS=' + GSystem.operatingSystem + '; LANG=' + GSystem.language);

    _.GSystem = GSystem;
})(this);