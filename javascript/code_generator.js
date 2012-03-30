/*
 *
 *
 *
 */

var generateButton = 'input[type=submit].generate'
  , keywordsInput = 'input[type=text].keywords'
  , urlInput = 'input[type=text].url'
  , textarea = 'textarea.code'

  , retargetingUrl = 'http://a.adcloud.net/retargeting'
  , alNumRegex = /^([a-zA-Z0-9]+)$/;



/*
 * Code generator constructor
 */
function CodeGenerator() {}

/*
 *
 */
CodeGenerator.getKeywords = function() {
    var keywords = []
      , keywordsInputField = $(keywordsInput)
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
CodeGenerator.generateLinkUrl = function(keywords, url) {
    var encodedUrl = CodeGenerator.encodeUrl(url);

    var linkUrl = [
        retargetingUrl,
        '?keywords=',
        encodeURIComponent(keywords.join(',')),
        '&redirectUrl=',
        encodedUrl
    ].join('');

    return linkUrl;
}

/*
 *
 */
CodeGenerator.generateLink = function(keywords, url) {
    var title = 'click here'
      , linkUrl = CodeGenerator.generateLinkUrl(keywords, url);

    var link = [
        '<a href="',
        linkUrl,
        '">',
        title,
        '</a>'
    ].join('');

    $(textarea).val(link);
}

/*
 *
 */
$(generateButton).live('click', function() {
    var keywords = CodeGenerator.getKeywords()
      , url = CodeGenerator.getUrl()

    if (keywords.length === 0) {
        return CodeGenerator.notifyKeywordError();
    }

    if (url.length === 0) {
        return CodeGenerator.notifyUrlError();
    }

    CodeGenerator.generateLink(keywords, url);
})

