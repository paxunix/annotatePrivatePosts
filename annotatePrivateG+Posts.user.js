// ==UserScript==
// @name            Mark 2-person posts on Google+ as "Private"
// @namespace       halpenny
// @description     If a Google+ post is shared with you and one other person, change the "Limited" audience text to "Private".  The audience popup will still work as before.  This script is very fragile and can be easily broken whenever Google updated Google+.  Caveat emptor.
// @include         https://plus.google.com/*
// @version         0.1
// ==/UserScript==

function jqueryize(fn)
{
    var script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
    script.onload = function() {
        var script = document.createElement("script");
        script.textContent = "(" + fn.toString() + ")();";
        document.body.appendChild(script);
    };

    document.body.appendChild(script);
}   // jqueryize


function privatizeGplus() {


jQuery('div#contentPane').on("mouseenter", 'div[id^=update-]', function(e) {

    var post = e.target;

    // Manually track if we've checked this element before.  Would be nice
    // to use one() instead of on() but that means it only fires once for
    // any of the parent's delegates, not once per delegate.
    if (!jQuery.data(post, "annotatePrivG_done"))
    {
        jQuery.data(post, "annotatePrivG_done", true);
    }
    else
    {
        return;
    }

    var audience = jQuery('span[title="Sharing details"]', post);

    // If the post was shared with you, one other person, and also made Public,
    // it still appears that there are only two users in the audience data.
    // Return if the share is Public, rather than incorrectly marking it as
    // Private.
    if (audience.text() === "Public")
        return;

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
        // XXX:  this also passes if the post was Public and shared only with
        // one other person.
        if (userData.length == 2)
            audience[0].innerText = "Private";
    });

}); // jQuery.one


};  // privatizeGplus


jqueryize(privatizeGplus);
