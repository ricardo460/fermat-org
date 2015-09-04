function Helper() {
    
    this.hide = function (element, duration) {
        
        var dur = duration || 1000,
            el = element;
        
        if (typeof (el) === "string") { el = document.getElementById(element); }
        
        $(el).fadeTo(duration, 0, function () {
            $(el).remove();
        });
    };
}

// Make helper a static object
var helper = new Helper();