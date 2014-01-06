// ==UserScript==
// @name            Google+:  mark "Private" posts
// @namespace       halpenny
// @description     If a Google+ post is shared privately, change the audience text to indicate sharing with one person or many.  The audience popup will still work as before.  This script can be easily broken whenever Google updates Google+.  Caveat emptor.
// @include         https://plus.google.com/*
// @version         1.0.3
// ==/UserScript==

function jqueryize(fn, jQueryVersion)
{
    var script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" +
        (jQueryVersion || "1") + "/jquery.min.js";
    script.onload = function() {
        var fnScript = document.createElement("script");
        fnScript.textContent = "(" + fn.toString() +
            ")(jQuery.noConflict(true));";

        document.body.appendChild(fnScript);
    };

    document.body.appendChild(script);
}   // jqueryize


function privatizeGplus(jQuery) {

jQuery(document).on("mouseenter", 'div[id^=update-]', function(evt) {
    var post = evt.currentTarget;

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
    var prevText = audience.text();
    if (prevText !== "Shared privately")
        return;

    // So the user has some indication that we're doing something, change
    // the audience text.
    audience.text("Checking...");

    var postId = post.id.match(/update-(.+)/)[1];
    jQuery.ajax("https://plus.google.com/u/0/_/stream/getaudience/", {
        dataType: "text",
        data: {
            id: postId,
            buzz: "false",
        }
    }).done(function (text) {

        // The response isn't true JSON.  Diddle it so we can get it into JSON
        // form and pull out the data we need.
        text = text.replace(/^[\s\S]*?(?=\[)/m, "");
        var oldtext;

        do {
            oldtext = text;
            text = text.replace(/,,/g, ',"",');
        } while (oldtext !== text);

        var userData = JSON.parse(text)[0][2];

        // We already know it's been privately shared, so we
        // indicate if it's between only 2 people or more than 2.
        if (userData.length == 2)
            audience[0].innerText = "Shared With Only One Person";
        else
            audience[0].innerText = "Shared Privately With Multiple People";
    }).fail(function (text) {
        jQuery('<span id="errtext">Failed checking audience for this post</span>').
            css({ color: "red",
                "background-color": "yellow",
                position: "absolute",
                display: "none" }).
            insertBefore(jQuery(audience).closest("div")).
            fadeIn(500).
            fadeOut(4000, function() { this.remove() });

        audience[0].innerText = prevText;
    });

}); // jQuery.one


};  // privatizeGplus


jqueryize(privatizeGplus);
