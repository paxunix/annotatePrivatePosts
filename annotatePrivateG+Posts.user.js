// ==UserScript==
// @name            Mark 2-person posts as "Private"
// @namespace       halpenny
// @description     If a Google+ post is shared with you and one other person, change the "Limited" audience to "Private".
// @include         http*://plus.google.com/*
// @version         0.1
// ==/UserScript==


var postDivs = jQuery('div[id^=update-]');
jQuery.each(postDivs, function (i, post) {

    var postId = post.id.match(/update-(.+)/)[1];
    var req = jQuery.ajax("https://plus.google.com/u/0/_/stream/getaudience/", {
        dataType: "text",
        data: {
            id: postId,
            buzz: "false",
        }
    });

    req.done(function(text) {

        // The response isn't true JSON.  Diddle it so we can get it into JSON
        // form and pull out the data we need.
        text = text.replace(/^[\s\S]*?(?=\[)/m, "");
        var oldtext;

        do {
            oldtext = text;
            text = text.replace(/,,/g, ',"",');
        } while (oldtext !== text);

        var userData = JSON.parse(text)[0][2];

        // Only care if it was shared between 2 users
        if (userData.length == 2)
        {
            //var uids = jQuery.map(userData, function (post, i) {
            //    return post[1];
            //})

            var audience = jQuery('span[title="Sharing details"]', post);
            audience[0].innerText = "Private";

            // XXX: would be nice to show indication of whom it was shared with
        }
    });
});
