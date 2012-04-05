/*
 *
 * Retargeting code generator
 *
 */

var pageViewBox = 'div#PageViewRetargeting'
  , clickBox = 'div#ClickRetargeting'
  , generateButton = 'input[type=submit].generate'

  , pageViewKeywordsInput = pageViewBox + ' input[type=text].keywords'
  , pageViewCompanyIdInput = pageViewBox + ' input[type=text].CompanyId'

  , clickKeywordsInput = clickBox + ' input[type=text].keywords'
  , clickCompanyIdInput = clickBox + ' input[type=text].CompanyId'
  , urlInput = clickBox + ' input[type=text].url'

  , textarea = 'textarea.code'
  , tabList = 'div#tabs'
  , tabs = tabList + ' li a'

  , retargetingUrl = 'http://a.adcloud.net/retargeting'
  , alNumRegex = /^([a-zA-Z0-9]+)$/
  , numRegex = /^([0-9]+)$/
  , urlRegex = /^https?:\/\/.+/;


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
 * Get company id given by user.
 *
 * @param string selector
 *
 * @return number
 */
CodeGenerator.getCompanyId = function(selector) {
    var companyId = 0
      , companyIdInputField = $(selector)
      , userCompanyId = companyIdInputField.val();

    if (numRegex.test(userCompanyId)) {
        companyId = userCompanyId;
    }

    return companyId;
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

    if (urlRegex.test(userInput)) {
        url = userInput;
    }

    return url;
};

/*
 * Show users a error dialog.
 *
 * @param object options
 */
CodeGenerator.showErrorDialog = function(options) {
    this.resetCode();

    $(options.dialogId).dialog({
        title: options.title,
        width: 300,
        height: 150,
        modal: true
    });
};

/*
 * Notify user about missing or invalid company id.
 */
CodeGenerator.notifyCompanyIdError = function() {
    this.showErrorDialog({
        dialogId: '#CompanyIdErrorDialog',
        title: 'Invalid company id error'
    });
};

/*
 * Notify user about missing or invalid keywords.
 */
CodeGenerator.notifyKeywordError = function() {
    this.showErrorDialog({
        dialogId: '#KeywordsErrorDialog',
        title: 'Invalid keyword error'
    });
};

/*
 * Notify user about missing url.
 */
CodeGenerator.notifyUrlError = function() {
    this.showErrorDialog({
        dialogId: '#UrlErrorDialog',
        title: 'Invalid url error',
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
 * Reset textara content.
 */
CodeGenerator.resetCode = function() {
    $(textarea).val('');
}

/*
 * Create complete retargeting url.
 *
 * @param number companyId
 * @param string url
 * @param array keywords
 *
 * @return string
 */
CodeGenerator.generateUrl = function(companyId, url, keywords) {
    var urlParts = [
        retargetingUrl,
        '?keywords=',
        encodeURIComponent(keywords.join(',')),
        '&companyId=',
        companyId,
        '&redirect=',
        this.encodeUrl(url)
    ];

    return urlParts.join('');
};

/*
 * Dispatch code generation for click retargeting.
 */
CodeGenerator.generateClickRetargeting = function() {
    var companyId = this.getCompanyId(clickCompanyIdInput);
    if (companyId === 0) {
        return this.notifyCompanyIdError();
    }

    var url = this.getUrl();
    if (url.length === 0) {
        return this.notifyUrlError();
    }

    var keywords = this.getKeywords(clickKeywordsInput);
    if (keywords.length === 0) {
        return this.notifyKeywordError();
    }

    var generatedUrl = this.generateUrl(companyId, url, keywords);
    this.showCode(generatedUrl);
};

/*
 * Create the retargeting javascript.
 *
 * @param array keywords
 * @param number companyId
 *
 * @return string
 */
CodeGenerator.generateJavascript = function(keywords, companyId) {
    var javascript = [
        '<script>',
        '    var adcloud_config = {',
        '        type: "retargeting",',
        '        companyId: ' + companyId + ',',
        '        keywords: ' + JSON.stringify(keywords) + ',',
        '    };',
        '</script>',
        '<script src="http://ads.adcloud.net/api.js" type="text/javascript"></script>'
    ].join('\n');

    return javascript;
};

/*
 * Dispatch code generation for page view retargeting.
 */
CodeGenerator.generatePageViewRetargeting = function() {
    var keywords = this.getKeywords(pageViewKeywordsInput)
      , companyId = this.getCompanyId(pageViewCompanyIdInput);

    if (companyId === 0) {
        return this.notifyCompanyIdError();
    }

    if (keywords.length === 0) {
        return this.notifyKeywordError();
    }

    var code = this.generateJavascript(keywords, companyId);
    this.showCode(code);
};

/*
 * Initialize all click events.
 */
CodeGenerator.initClickEvents = function() {
    var self = this;

    $(generateButton).click(function() {
        if (self.activeRetargetingType === 'ClickRetargeting') {
            self.generateClickRetargeting();
        } else {
            self.generatePageViewRetargeting();
        }

        $(textarea).select();
    });

    $(tabs).click(function() {
        self.activeRetargetingType = $(this).attr('class');
        self.resetCode();
    });
};

/*
 * Initialize the module.
 */
CodeGenerator.init = function() {
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

