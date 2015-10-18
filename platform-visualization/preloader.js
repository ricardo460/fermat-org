/*global window*/
/*global document*/
/*global $*/
// on index.html, our preloader
// add all of your image paths to this array
$.ajax({
    url: "./images.json",
    success: function (images) {
        'use strict';
        var loaded = 0;
        var i = 0;
        var percnt = 0;
        var loadImage = function (i) {
            var img = images[i];
            var e = document.createElement('img');
            // this will trigger your browser loading the image (and caching it)
            e.src = img;
            e.onload = function () {
                //console.log(this.src + ' loaded!');
                loaded++;
                percnt = ((loaded * 100) / images.length) >> 0;
                $("#progress-bar").width(percnt + '%');
                //console.log(percnt + '%');
                if (loaded >= images.length - 1) {
                    // once we get here, we are pretty much done, so redirect to the actual page
                    window.location = './home.html';
                }
            };
            e.onerror = function () {
                //console.log('error loading ' + this.src);
                loaded++;
                percnt = ((loaded * 100) / images.length) >> 0;
                $("#progress-bar").width(percnt + '%');
                //console.log(percnt + '%');
                if (loaded >= images.length - 1) {
                    // once we get here, we are pretty much done, so redirect to the actual page
                    window.location = './home.html';
                }
            };
        };
        while (i < images.length) {
            loadImage(i);
            i++;
        }
    }
});