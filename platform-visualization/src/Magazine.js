/**
 * @author Ricardo Delgado
 * Create, modify and read all the necessary elements to create magazines.
 */
function Magazine() {
    
    window.PDFJS.disableWorker = true;

    var viewMagazine = {

	       book : { 
	           file : "images/magazine/book/fermat-book.pdf",
               coverFront : "images/magazine/book/cover-front.png",
               coverFrontInside : "images/magazine/book/cover-front-inside.png",
               coverBack : "images/magazine/book/cover-back.png",
               coverBackInside : "images/magazine/book/cover-front-inside.png",
               scale : 0.835
            },
	       readme : { 
               file : "images/magazine/readme/fermat-readme.pdf",
               coverFront : "images/magazine/readme/cover-front.png",
               coverFrontInside : "images/magazine/readme/cover-front-inside.png",
               coverBack : "images/magazine/readme/cover-back.png",
               coverBackInside : "images/magazine/readme/cover-back-inside.png",
               scale : 0.56
            },
	       whitepaper : { 
               file : "images/magazine/whitepaper/fermat-whitepaper.pdf",
               coverFront : "images/magazine/whitepaper/cover-front.jpg",
               coverFrontInside : "images/magazine/whitepaper/cover-front-inside.jpg",
               coverBack : "images/magazine/whitepaper/cover-back.jpg",
               coverBackInside : "images/magazine/whitepaper/cover-back-inside.jpg",
               scale : 0.58
	        }
    	};

    var MAGAZINE = null,
        SCALE = null,
        WIDTH = 960,
        HEIGHT = 650,
        DOC = null;
    
    /**
     * @author Ricardo Delgado
     * Creates and starts all the functions for creating magazine.
     * @param {String} load  Name of the magazine to create.
     */
    this.init = function (load){

    	window.PDFJS.getDocument(viewMagazine[load].file).then(function (doc) {

	       DOC = doc;

	       SCALE = viewMagazine[load].scale;
	        
           addItems();

           configMagazine();

           coverPage(load);

           for (var i = 1; i <= DOC.numPages; i++)
                addPage(i); 

           backCoverPage(load);

           actionMagazine();

           positionMagazine();

      	});

    };
    
    /**
     * @author Ricardo Delgado
     * Encourages and removes the magazine.
     */
    this.remove = function (){

      	var flipbook = document.getElementById('flipbook-viewport'),
          	positionHide = {x: (Math.random() + 1) * 5000, y: (Math.random() + 1) * 5000};
          	//pager = document.getElementById('pager');
      
    		//animatePager(pager, positionHide);
      	animateMagazine(flipbook, positionHide);

      	window.helper.hide(flipbook, 2000, false);
        //window.helper.hide(pager, 2000, false); 
        DOC = null;
    };
    
    /**
     * @author Ricardo Delgado
     * Start adding all the settings for the magazine.
     */
    function configMagazine(){

      	MAGAZINE.turn({
          
          	width : WIDTH,

          	height : HEIGHT,

          	elevation: 80,

          	gradients: true,

          	autoCenter: false,

          	acceleration: true

      	});

    }

    /**
     * @author Ricardo Delgado
     * Creates all the elements (div) needed to magazine.
     */
    function addItems(){

      	var page = $('<div />'),
          	flipbook = $('<div />', {"class": "flipbook"}).append(page),
          	viewport = $('<div />', {"class": "flipbook-viewport", "id": "flipbook-viewport"}).append(flipbook);
          	//pager = $('<div />', {"id": "pager"});

      	//$('body').append(pager);

      	$('#container').append(viewport);

      	MAGAZINE = $('.flipbook');

    }
    
    /**
     * @author Ricardo Delgado
     * Creates and adds the cover and inside cover of the magazine.
     * @param {String} load  Name of the magazine to create.
     */    
    function coverPage(load){
        
        var _class,
            cover,
            backCover;

        _class = "hard";

        cover = $('<div />', { 
					"class": _class,
					"id" : 'p'+ 1,
                    "style" : "background-image:url("+viewMagazine[load].coverFront+")"
					});

		MAGAZINE.turn("addPage", cover, 1);

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'p'+ 2,
						"style" : "background-image:url("+viewMagazine[load].coverFrontInside+")"
						});

		MAGAZINE.turn("addPage", backCover, 2);
        
    }
    
    /**
     * @author Ricardo Delgado
     * Creates and adds the counter-cover and internal cover of the magazine.
     * @param {String} load  Name of the magazine to create.
     */  
    function backCoverPage(load){

		var page = DOC.numPages + 3,
			_class = "hard fixed",
			cover,
			backCover;

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'pn',
						"style" : "background-image:url("+viewMagazine[load].coverBackInside+")"
						});

		MAGAZINE.turn("addPage", backCover, page); 

		page = DOC.numPages + 4;

		_class = "hard";

		cover = $('<div />', { 
					"class": _class,
					"id" : 'pf',
                    "style" : "background-image:url("+viewMagazine[load].coverBack+")"
					});

		MAGAZINE.turn("addPage", cover, page);
	}

    /**
     * @author Ricardo Delgado
     * Creates and adds all pages of pdf.
     * @param {Numer} page  Number of the page to add.
     */  
    function addPage(page){

      	var canvas,
          	ctx,
         	element,
          	_class = "own-size",
          	newPage = page + 2;

      	canvas = document.createElement('canvas');
      	canvas.width  = 460;
      	canvas.height = 630;

      	ctx = canvas.getContext("2d");

      	renderPage(page, ctx);

      	element = $('<div />', { 
            		"class": _class,
            		'id' : 'p'+ newPage
           			}).append(canvas);

      	MAGAZINE.turn("addPage", element, newPage);

    }
    
    /**
     * @author Ricardo Delgado
     * Read and add PDF page to canvas.
     * @param {Numer} num   Page number reading.
     * @param {Object} ctx  CTX of canvas.
     */  
    function renderPage(num, ctx){

      	var viewport,
          	renderContext;

     	DOC.getPage(num).then(function (page){

          	viewport = page.getViewport(SCALE);

          	renderContext = {       
                canvasContext: ctx,
                viewport: viewport
            };

          	page.render(renderContext);

      	});
    }
    
    /**
     * @author Ricardo Delgado
     * Add the special features of the magazine.
     */ 
    function actionMagazine(){

    	$(document).keydown(function(e){

			var ESC = 27;

			switch (e.keyCode) {

            case ESC:
                    
                if (!MAGAZINE.data().zoomIn)
                    MAGAZINE.turn("page", 1);

                zoomHandle(-1);

            break;
                    
			}

    	});

        MAGAZINE.bind("turning", function(event, page, view) {

      	     var magazine = $(this);
				
			 if (page >= 2){
				$('#p2').addClass('fixed');
			 }
             else{
                $('#p2').removeClass('fixed');
             }

             if (page < magazine.turn('pages')){
                $('#pn').addClass('fixed');
             }
             else{
                $('#pn').removeClass('fixed');
             }
		  
		}); 

        ConfigZoom();

    }
    
    /**
     * @author Ricardo Delgado
     * Believes zoom settings magazine.
     */ 
    function ConfigZoom(){

        var flipbook = document.getElementById("flipbook-viewport");

        if (flipbook.addEventListener) {

            flipbook.addEventListener("mousewheel", MouseWheelHandler, false);

            flipbook.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }

        function MouseWheelHandler(e) {

            var _e = window.event || e; 
            var delta = Math.max(-1, Math.min(1, (_e.wheelDelta || -_e.detail)));

            zoomHandle(delta);

            return false;
        }
    }
    
    /**
     * @author Ricardo Delgado
     * Zoom determines the value received.
     */ 
    function zoomHandle(delta) {

        if (MAGAZINE.data().zoomIn){ 
            if(delta < 0)
                zoomOut();
        }
        else{
            if(delta > 0)
                zoomThis();
        }

    }
    
    /**
     * @author Ricardo Delgado
     * Zooming magazine.
     */ 
    function zoomThis() {

        var element = document.getElementById('flipbook-viewport');
        var positionShow = {x : window.innerWidth * 0.53, y : (window.innerHeight * 0.50) - 50};
        animateMagazine(element, positionShow, 2500);

        MAGAZINE.transform(
                'scale('+1.35+', '+1.35+')');
        MAGAZINE.data().zoomIn = true;
        MAGAZINE.turn('resize');
        MAGAZINE.turn('disable', true);
            
    }
        
    /**
     * @author Ricardo Delgado
     * Remove the magazine zoom.
     */ 
    function zoomOut() {

        var element = document.getElementById('flipbook-viewport');
        var positionShow = {x : window.innerWidth * 0.53, y : (window.innerHeight * 0.5)};
        animateMagazine(element, positionShow, 2500);

        MAGAZINE.transform(
                'translate('+0+'px, '+20+'px)' +
                'scale('+1+', '+1+')');
        MAGAZINE.data().zoomIn = false;
        MAGAZINE.turn('resize');
        MAGAZINE.turn('disable', false);
    }
    
    /**
     * @author Ricardo Delgado
     * Calculates the position of the paged for animation.
     */ 
	function positionPager(){

      	var element = document.getElementById('pager'),
          	positionShow = {y : ((HEIGHT / 2) + (window.innerHeight / 2))};

      	element.style.top = (Math.random() + 1) * 3000 + 'px';

      	setTimeout(function() {
        	animatePager(element, positionShow);
      	}, 1500);

    }
    
    /**
     * @author Ricardo Delgado
     * Calculates the position of the magazine for animation.
     */ 
	function positionMagazine(){

      	var element = document.getElementById('flipbook-viewport');

	    var positionShow = {x : window.innerWidth * 0.53, y : window.innerHeight * 0.50};

	    element.style.left = (Math.random() + 1) * 3000 + 'px';
	    element.style.top = (Math.random() + 1) * 3000 + 'px';

	    setTimeout(function() {
	      animateMagazine(element, positionShow);
	    }, 1500);
    }
    
    /**
     * @author Ricardo Delgado
     * Makes the entry or exit animation magazine.
     * @param {Object} element         elemento.
     * @param {Array}  target          The objetive position.
     * @param {Number} [duration=3000] Duration of the animation.
     */ 
    function animateMagazine (element, target, duration) {

      var _duration = duration || 3000,
          position = {x : element.getBoundingClientRect().left, y : element.getBoundingClientRect().top};

      new TWEEN.Tween(position)
          .to({x : target.x, y : target.y}, _duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .onUpdate(update)
          .start();

      function update() {
        element.style.left = position.x + 'px';
        element.style.top = position.y + 'px';
      }

    }
    
    /**
     * @author Ricardo Delgado
     * Performs the animation output or paged enters.
     * @param {Object} element         Element.
     * @param {Array}  target          The objetive position.
     * @param {Number} [duration=3000] Duration of the animation.
     */ 
    function animatePager (element, target, duration) {

      var _duration = duration || 3000,
          position = { x : 0, y : element.getBoundingClientRect().top};

      new TWEEN.Tween(position)
          .to({y : target.y}, _duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .onUpdate(update)
          .start();

      function update() {
        element.style.top = position.y + 'px';
      }

    }
}