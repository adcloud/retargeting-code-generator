/**
 * Functions for the encodings in the adserver
 *
 * @see http://xkr.us/articles/javascript/encode-compare/
 */
var Encoding = {
    /**
     * Url encode
     *
     * Custom url decoding since escape, encodeURI and encodeURIComponent doesn't
     * fit our needs. Escape leaves out the following characters: *@/+
     *
     * So we ensure that slashes are encoded too
     *
     * @param string url
     *
     * @return string
     */
    url: function(url) {
        if (adcloud_link_tracking_encode) {
            return escape(url).replace(/\//g, "%2F");
        } else {
            return escape(url);
        }
    },

    /**
     * Utf8 Encoding of a string
     *
     * @param string string
     *
     * @result string
     */
    utf8: function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0, nn = string.length; n < nn; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    /**
     * Base64 encode a Url
     *
     * This is not a regular list of characters - since we like to have no
     * characters that can cause problems in urls
     *
     * @param string input
     *
     * @return string
     */
    base64: function(input) {
        var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+*@";
        var output = "QWRjbG91ZA@@";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this.utf8(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keys.charAt(enc1) + keys.charAt(enc2) +
                keys.charAt(enc3) + keys.charAt(enc4);

        }
        return output;
    },

    /**
     * Encodes a Uniform Resource Identifier (URI) component by replacing each
     * instance of certain characters by one, two, three, or four escape sequences
     * representing the UTF-8 encoding of the character (will only be four escape
     * sequences for characters composed of two "surrogate" characters).
     *
     * Needed since escape() doesn't fit our needs for keywords and locations encoding.
     *
     * @example
     *  escape('äpfel') = '%uFFFDpfel'
     *  encodeURIComponent('äpfel') = '%EF%BF%BDpfel'
     *
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * Good comparsion:
     * @see http://xkr.us/articles/javascript/encode-compare/
     */
    uri: function(uri) {
        return encodeURIComponent(uri);
    }
};
