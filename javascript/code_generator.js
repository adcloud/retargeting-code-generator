/*
 *
 * Retargeting code generator
 *
 */

var generateButton = 'input[type=submit].generate'
  , radioButtons = 'input[type=radio]'
  , pageViewKeywordsInput = 'input[type=text].PageViewKeywords'
  , clickKeywordsInput = 'input[type=text].ClickKeywords'
  , urlInput = 'input[type=text].url'
  , textarea = 'textarea.code'
  , tabList = 'div#tabs'
  , tabs = tabList + ' li a'

  , retargetingUrl = 'http://a.adcloud.net/retargeting'
  , alNumRegex = /^([a-zA-Z0-9]+)$/;



/*
 * Code generator constructor
 */
function CodeGenerator() {}

/*
 * Get keywords given by user.
 *
 * @param string selector
 *
 * @return array
 */
CodeGenerator.getKeywords = function(selector) {
    var keywords = []
      , keywordsInputField = $(selector)
      , userInput = keywordsInputField.val()
      , userKeywords = userInput.split(',');

    $.each(userKeywords, function(i, keyword) {
        var userKeyword = $.trim(keyword);

        if(alNumRegex.test(userKeyword)) {
            keywords.push(userKeyword);
        } else {
            keywords = [];
            return false; // break the loop
        }
    })

    return keywords;
};

/*
 * Get url given by user.
 *
 * @return string
 */
CodeGenerator.getUrl = function() {
    var url = ''
      , urlInputField = $(urlInput)
      , userInput = urlInputField.val();

    // TODO validate urls ???
    // if (urlRegex.test(userInput)) {
        url = userInput;
    // }

    return url;
};

/*
 * Notify user about missing or invalid keywords.
 */
CodeGenerator.notifyKeywordError = function() {
    $("#KeywordsErrorDialog").dialog({
        title: 'Invalid keywords error',
        width: 300,
        height: 150,
        modal: true
    });
};

/*
 * Notify user about missing url.
 */
CodeGenerator.notifyUrlError = function() {
    $("#UrlErrorDialog").dialog({
        title: 'Invalid url error',
        width: 300,
        height: 150,
        modal: true
    });
};

/*
 * Encode an url in adcloud style base64.
 *
 * @param string url
 *
 * @return string
 */
CodeGenerator.encodeUrl = function(url) {
    return Encoding.base64(url);
};

/*
 * Display code in textarea.
 *
 * @param string code
 */
CodeGenerator.showCode = function(code) {
    $(textarea).val(code);
};

/*
 * Create complete retargeting url.
 *
 * @param array keywords
 * @param string url
 *
 * @return string
 */
CodeGenerator.generateUrl = function(keywords, url) {
    var urlParts = [
        retargetingUrl,
        '?keywords=',
        encodeURIComponent(keywords.join(','))
    ];

    if (typeof url === 'string') {
        urlParts.push('&redirect=');
        urlParts.push(this.encodeUrl(url));
    }

    return urlParts.join('');
};

/*
 * Dispatch code generation for click retargeting.
 */
CodeGenerator.generateForClickRetargeting = function() {
    var keywords = this.getKeywords(clickKeywordsInput)
      , url = this.getUrl();

    if (keywords.length === 0) {
        return this.notifyKeywordError();
    }

    if (url.length === 0) {
        return this.notifyUrlError();
    }

    var generatedUrl = this.generateUrl(keywords, url);
    this.showCode(generatedUrl);
};

/*
 * Get the retargeting pixel.
 *
 * @param array keywords
 *
 * @return string
 */
CodeGenerator.generatePixel = function(keywords) {
    var pixel = [
        '<img src="',
        this.generateUrl(keywords),
        '" width="1" height="1" border="0" alt=""/>'
    ].join('');

    return pixel;
};

/*
 * Create the retargeting javascript.
 *
 * @param array keywords
 *
 * @return string
 */
CodeGenerator.generateJavascript = function(keywords) {
    var javascript = [
        '<script>',
        '    var adcloud_config = {',
        '        keywords: ' + JSON.stringify(keywords) + ',',
        '        type: "retargeting"',
        '    };',
        '</script>',
        '<script src="http://ads.adcloud.net/api.js" type="text/javascript"></script>'
    ].join('\n');

    return javascript;
};

/*
 * Dispatch code generation for page view retargeting.
 */
CodeGenerator.generateForPageViewRetargeting = function() {
    var code
      , keywords = this.getKeywords(pageViewKeywordsInput);

    if (keywords.length === 0) {
        return this.notifyKeywordError();
    }

    if (this.codeType === 'javascript') {
        code = this.generateJavascript(keywords);
    } else {
        code = this.generatePixel(keywords);
    }

    this.showCode(code);
};

/*
 * Initialize all click events.
 */
CodeGenerator.initClickEvents = function() {
    var self = this;

    $(generateButton).click(function() {
        if (self.activeRetargetingType === 'ClickRetargeting') {
            self.generateForClickRetargeting();
        } else {
            self.generateForPageViewRetargeting();
        }

        $(textarea).select();
    });

    $(tabs).click(function() {
        self.activeRetargetingType = $(this).text();
    });

    $(radioButtons).click(function() {
        self.codeType = $(this).attr('id');
    });
};

/*
 * Initialize the module.
 */
CodeGenerator.init = function() {
    this.codeType = 'javascript';
    this.activeRetargetingType = 'PageViewRetargeting';
    this.initClickEvents();

    $(tabList).tabs({
        selected: 0
    });
};

/*
 * Start module initialization if dom is ready.
 */
$(document).ready(function() {
    CodeGenerator.init();
});

