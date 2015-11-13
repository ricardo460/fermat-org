/**
 * @author Ricardo Delgado
 * Version 2
 */
function BookManager() {
    
    window.PDFJS.disableWorker = true;

    var viewBook = {

    		book : { 
    			file : "images/book/fermat-book.pdf",
    			coverInit : "",
    			backCoverInit : "images/book/backCover.png",
    			coverEnd : "",
    			backCoverEnd : "images/book/backCover.png"
    		},
    		readme : { 
    			file : "images/book/fermat-readme.pdf",
    			coverInit : "",
    			backCoverInit : "images/book/backCover.png",
    			coverEnd : "",
    			backCoverEnd : "images/book/backCover.png"
    		},
    		whitepaper : { 
    			file : "images/book/fermat-whitepaper.pdf",
    			coverInit : "",
    			backCoverInit : "images/book/backCover.png",
    			coverEnd : "",
    			backCoverEnd : "images/book/backCover.png"
    		}
    	};

    var BOOK = null,
        SCALE = 0.7,
        WIDTH = 1160,
        HEIGHT = 700,
        DOC = null;


    this.createBook = function (load){

    	window.PDFJS.getDocument(viewBook[load].file).then(function (doc) {

	        DOC = doc;
	        
	      	addItems();

	      	configBook();
	        
	        coverPage(load);

	     	for (var i = 1; i <= DOC.numPages; i++)
	       		addPage(i); 

	    	backCoverPage(load);

	      	actionbook();

	    	//addElementPager();

	      	//ConfigPager();

	      	positionBook();

      	});

    };

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

    function configBook(){

      	BOOK.turn({
          
		  	duration: 1000,

          	width : WIDTH,

          	height : HEIGHT,

          	elevation: 50,

          	gradients: true,

          	autoCenter: false,

          	acceleration: true

      	});

    }

    function addItems(){

      	var page = $('<div />'),
          	flipbook = $('<div />', {"class": "flipbook"}).append(page),
          	viewport = $('<div />', {"class": "flipbook-viewport", "id": "flipbook-viewport"}).append(flipbook);
          	//pager = $('<div />', {"id": "pager"});

      	//$('body').append(pager);

      	$('#container').append(viewport);

      	BOOK = $('.flipbook');

    }

    function addElementPager(){

      	var pager = $('#pager').append('<div id = "pagerBook"><ul></ul></div>'),
         	pages = parseInt( BOOK.turn("pages") ),
          	nav,
          	_width;

      	_width = (pages * 30) + 50;
      	pager.css('width', _width + "px");

      	nav = $('#pagerBook');
      	nav.append('<li id = "prev_page"><a href = "#">&lt;-</a></li>');

      	for (var i = 1; i < pages + 1; i++){

        	nav.append('<li class = "li_page" id = "page_'+ i +'"><a href = "#" rel = "'+ i +'">'+ i +'</a></li>');
      	}
      
      	nav.append('<li id = "next_page"><a href="#">-&gt;</a></li>');
    }
    
    function coverPage(load){
        
        var _class,
        	cover,
        	backCover,
        	depth = $('<div />', {"class": "depth"});

        _class = "hard";

        cover = $('<div />', { 
					"class": _class,
					"id" : 'p'+ 1
					});

		BOOK.turn("addPage", cover, 1);

		_class = "hard front-side cp";

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'p'+ 2,
						"style" : "background-image:url("+viewBook[load].backCoverInit+")"
						}).append(depth);

		BOOK.turn("addPage", backCover, 2);
        
    }
    
    function backCoverPage(load){

		var page = DOC.numPages + 3,
			_class,
			cover,
			backCover,
			depth = $('<div />', {"class": "depth"});

		_class = "hard fixed back-side cb";

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'p' + page,
						"style" : "background-image:url("+viewBook[load].backCoverEnd+")"
						}).append(depth);

		BOOK.turn("addPage", backCover, page); 

		page = DOC.numPages + 4;

		_class = "hard";

		cover = $('<div />', { 
					"class": _class,
					"id" : 'p' + page
					});

		BOOK.turn("addPage", cover, page);
	}

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

    function actionbook(){

    	$(document).keydown(function(e){

			var previous = 37, next = 39, esc = 27;

			switch (e.keyCode) {
				case previous:

					BOOK.turn('previous');

				break;
				case next:

					BOOK.turn('next');

				break;
                case esc:

                    zoomHandle(-1);

                break;
			}

		});

        BOOK.bind("turning", function(event, page, view) {
				
			if (page >= 2)
				$('.flipbook .cp').addClass('fixed');
			else
				$('.flipbook .cp').removeClass('fixed');

			if (page < BOOK.turn('pages'))
				$('.flipbook .cb').addClass('fixed');
			else
				$('.flipbook .cb').removeClass('fixed');
		  
		}); 

        ConfigZoom();

    }

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


	function ConfigPager(){

      	var element = document.getElementById('pager'),
          	positionShow = {y : ((HEIGHT / 2) + (window.innerHeight / 2))};

      	element.style.top = (Math.random() + 1) * 3000 + 'px';

      	setTimeout(function() {
        	animatePager(element, positionShow);
      	}, 1500);

    }

	function positionBook(){

      	var element = document.getElementById('flipbook-viewport');

	    var positionShow = {x : window.innerWidth / 2, y : window.innerHeight / 2};

	    element.style.left = (Math.random() + 1) * 3000 + 'px';
	    element.style.top = (Math.random() + 1) * 3000 + 'px';

	    setTimeout(function() {
	      animateBook(element, positionShow);
	    }, 1500);
    }

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