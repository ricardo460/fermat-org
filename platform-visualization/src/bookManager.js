/**
 * @author Ricardo Delgado
 * Create, modify and read all the necessary elements to create magazines.
 */
function BookManager() {
    
    window.PDFJS.disableWorker = true;

    var viewBook = {

	       book : { 
	           file : "images/book/fermat-book.pdf",
	           coverInit : "images/book/coverBook.png",
	           backCoverInit : "images/book/backCoverInit.png",
               coverEnd : "images/book/coverBackbook.png",
               backCoverEnd : "images/book/backCoverEnd.png",
               scale : 0.7
            },
               readme : { 
               file : "images/book/fermat-readme.pdf",
               coverInit : "images/book/coverBook.png",
               backCoverInit : "images/book/backCoverInit.png",
               coverEnd : "images/book/coverBackbook.png",
               backCoverEnd : "images/book/backCoverEnd.png",
               scale : 0.64
            },
               whitepaper : { 
               file : "images/book/fermat-whitepaper.pdf",
               coverInit : "images/book/coverBook.png",
               backCoverInit : "images/book/backCoverInit.png",
               coverEnd : "images/book/coverBackbook.png",
               backCoverEnd : "images/book/backCoverEnd.png",
               scale : 0.7
	        }
    	};

    var BOOK = null,
        SCALE = null,
        WIDTH = 1160,
        HEIGHT = 700,
        DOC = null;
    /**
     * @author Ricardo Delgado
     * Creates and starts all the functions for creating magazine.
     * @param {String} load  Name of the magazine to create.
     */
    this.createBook = function (load){

    	window.PDFJS.getDocument(viewBook[load].file).then(function (doc) {

	       DOC = doc;

	       SCALE = viewBook[load].scale;
	        
           addItems();

           configBook();

           coverPage(load);

           for (var i = 1; i <= DOC.numPages; i++)
                addPage(i); 

           backCoverPage(load);

           actionbook();

           positionBook();

      	});

    };
    /**
     * @author Ricardo Delgado
     * Encourages and removes the magazine.
     */
    this.hide = function (){

      	var flipbook = document.getElementById('flipbook-viewport'),
          	positionHide = {x: (Math.random() + 1) * 5000, y: (Math.random() + 1) * 5000};
          	//pager = document.getElementById('pager');
      
    		//animatePager(pager, positionHide);
      	animateBook(flipbook, positionHide);

      	window.helper.hide(flipbook, 2000, false);
        //window.helper.hide(pager, 2000, false); 
        DOC = null;
    };
    
    /**
     * @author Ricardo Delgado
     * Start adding all the settings for the magazine.
     */
    function configBook(){

      	BOOK.turn({
          
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

      	BOOK = $('.flipbook');

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
                    "style" : "background-image:url("+viewBook[load].coverInit+")"
					});

		BOOK.turn("addPage", cover, 1);

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'p'+ 2,
						"style" : "background-image:url("+viewBook[load].backCoverInit+")"
						});

		BOOK.turn("addPage", backCover, 2);
        
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
						"style" : "background-image:url("+viewBook[load].backCoverEnd+")"
						});

		BOOK.turn("addPage", backCover, page); 

		page = DOC.numPages + 4;

		_class = "hard";

		cover = $('<div />', { 
					"class": _class,
					"id" : 'pf',
                    "style" : "background-image:url("+viewBook[load].coverEnd+")"
					});

		BOOK.turn("addPage", cover, page);
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
      	canvas.width  = 560;
      	canvas.height = 682;

      	ctx = canvas.getContext("2d");

      	renderPage(page, ctx);

      	element = $('<div />', { 
            		"class": _class,
            		'id' : 'p'+ newPage
           			}).append(canvas);

      	BOOK.turn("addPage", element, newPage);

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
    function actionbook(){

    	$(document).keydown(function(e){

			var esc = 27;

			switch (e.keyCode) {

            case esc:

                zoomHandle(-1);

            break;
                    
			}

		});

        BOOK.bind("turning", function(event, page, view) {

      	     var book = $(this);
				
			 if (page >= 2){
				$('#p2').addClass('fixed');
			 }
             else{
                $('#p2').removeClass('fixed');
             }

             if (page < book.turn('pages')){
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

        if (BOOK.data().zoomIn){ 
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
        var positionShow = {x : window.innerWidth / 2, y : (window.innerHeight / 2) - 50};
        animateBook(element, positionShow, 2500);

        BOOK.transform(
                'scale('+1.35+', '+1.35+')');
        BOOK.data().zoomIn = true;
        BOOK.turn('resize');
        BOOK.turn('disable', true);
            
    }
        
    /**
     * @author Ricardo Delgado
     * Remove the magazine zoom.
     */ 
    function zoomOut() {

        var element = document.getElementById('flipbook-viewport');
        var positionShow = {x : window.innerWidth / 2, y : (window.innerHeight / 2)};
        animateBook(element, positionShow, 2500);

        BOOK.transform(
                'translate('+0+'px, '+20+'px)' +
                'scale('+1+', '+1+')');
        BOOK.data().zoomIn = false;
        BOOK.turn('resize');
        BOOK.turn('disable', false);
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
	function positionBook(){

      	var element = document.getElementById('flipbook-viewport');

	    var positionShow = {x : window.innerWidth / 2, y : window.innerHeight / 2};

	    element.style.left = (Math.random() + 1) * 3000 + 'px';
	    element.style.top = (Math.random() + 1) * 3000 + 'px';

	    setTimeout(function() {
	      animateBook(element, positionShow);
	    }, 1500);
    }
    
    /**
     * @author Ricardo Delgado
     * Makes the entry or exit animation magazine.
     * @param {Object} element         elemento.
     * @param {Array}  target          The objetive position.
     * @param {Number} [duration=3000] Duration of the animation.
     */ 
    function animateBook (element, target, duration) {

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