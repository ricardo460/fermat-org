// add all image paths to this array
function preLoad(onLoadAll) {
    
    let finished = false;
    
    let progressBar = {
        max : 0,
        loaded : 0
    };
    
    let updateBar = function() {
        
        let percnt = ((progressBar.loaded * 100) / progressBar.max) >> 0;
        $("#progress-bar").width(percnt + '%');
    };
    
    let loadImage = function(img) {
        
        let e = document.createElement('img');

        e.onload = function() {

            progressBar.loaded++;
            updateBar();

            if(progressBar.loaded >= progressBar.max) {
                // once we get here, we are pretty much done, so redirect to the actual page
                if(!finished) {
                    finished = true;
                    Helper.hide('progress-bar', 1000, false);
                    onLoadAll();
                }
            }
        };
        
        e.onerror = e.onload;
        
        // this will trigger your browser loading the image (and caching it)
        e.src = img;
        };
    
    //Preload images
    $.ajax({
        url: "./json/images.json",
        success: function(images) {
            'use strict';

            progressBar.max = images.length;

            let i = 0;

            while(i < images.length) {
                loadImage(images[i]);
                i++;
            }
        }
    });
    
    //Preload fonts
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    ctx.font = '12px Canaro';
    ctx.fillText('.', 0, 0);
}