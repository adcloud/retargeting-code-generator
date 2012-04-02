/*
 *
 *
 *
 */

var generateButton = 'input[type=submit].generate'
  , copyButton = 'input[type=submit].mark'
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
 *
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
 *
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
 *
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
 *
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
 *
 */
CodeGenerator.encodeUrl = function(url) {
    return escape(Encoding.base64(url));
};

/*
 *
 */
CodeGenerator.showCode = function(url) {
    $(textarea).val(url);
};

/*
 *
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
 *
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
 *
 */
CodeGenerator.generatePixel = function(keywords) {
    var pixel = [
        '<img src="',
        this.generateUrl(keywords),
        '" width="1" height="1" border="0" alt=""/>'
    ].join('');

    this.showCode(pixel);
};

/*
 *
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

    this.showCode(javascript);
};

/*
 *
 */
CodeGenerator.generateForPageViewRetargeting = function() {
    var keywords = this.getKeywords(pageViewKeywordsInput);

    if (keywords.length === 0) {
        return this.notifyKeywordError();
    }

    if (this.codeType === 'javascript') {
        this.generateJavascript(keywords);
    } else {
        this.generatePixel(keywords);
    }
};

/*
 *
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

    $(copyButton).click(function() {
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
 *
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
 *
 */
$(document).ready(function() {
    CodeGenerator.init();
});

