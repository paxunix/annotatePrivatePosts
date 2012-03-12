// ==UserScript==
// @name            Mark 2-person posts on Google+ as "Private"
// @namespace       halpenny
// @description     If a Google+ post is shared with you and one other person, change the "Limited" audience text to "Private".  The audience popup will still work as before.  This script is very fragile and can be easily broken whenever Google updated Google+.  Caveat emptor.
// @include         https://plus.google.com/*
// @version         0.1
// ==/UserScript==

function privatizeGplus() {


jQuery('div[id^=update-]').one("mouseover", function(e) {

    var post = e.target;
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
        // XXX:  this also passes if the post was Public
        if (userData.length == 2)
        {
            //var uids = jQuery.map(userData, function (post, i) {
            //    return post[1];
            //})

            var audience = jQuery('span[title="Sharing details"]', post);
            audience[0].innerText = "Private";
        }
    });

}); // jQuery.one


};  // privatizeGplus


// Load jQuery (yeah, I'm lazy) and then inject the go function.
var script = document.createElement("script");
script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
script.onload = privatizeGplus;
document.body.appendChild(script);
