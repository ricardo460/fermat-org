/**
 * @author Ricardo Delgado
 * Version 1 
 */
function BookManager() {
    
    window.PDFJS.disableWorker = true;

    var BOOK = null,
        PDFDOC = null, 
        SCALE = 0.8,
        WIDTH = 922,
        HEIGHT = 600,
        FILE = "images/fermat-book.pdf";


    this.init = function (){

      $(document).ready(function () {

          window.PDFJS.getDocument(FILE).then(function (doc) {

            PDFDOC = doc;

          });

      });

    };

    this.hide = function (){

      var flipbook = document.getElementById('flipbook'),
          pager = document.getElementById('pager'),
          positionHide = {x: Math.random() * 5000, y: Math.random() * 5000};
      
      animatePager(pager, positionHide);
      animateBook(flipbook, positionHide);

      window.helper.hide(flipbook, 2000, false);
      window.helper.hide(pager, 2000, false); 


    };

    function addItems(){

      var page = $('<div />'),
          flipbook = $('<div />', {"class": "flipbook"}).append(page),
          viewport = $('<div />', {"class": "flipbook-viewport", "id": "flipbook"}).append(flipbook),
          pager = $('<div />', {"id": "pager"});

      $('body').append(pager);

      $('#container').append(viewport);

      BOOK = $('.flipbook');

    }

    this.createBook = function (){

      addItems();

      configBook();

      for (var i = 1; i <= PDFDOC.numPages; i++)
        addPage(i); 

      ConfigPager();

      positionBook();

    };

    function configBook(){

      BOOK.turn({

          width : WIDTH,

          height : HEIGHT,

          elevation: 80,

          gradients: true,

          autoCenter: true,

          acceleration: true
      });

    }

    function addPage(page){

      var canvas,
          ctx,
          element,
          _class = "page";

      if (page < 3 || page === PDFDOC.numPages)
          _class = "hard";

      canvas = document.createElement('canvas');
      canvas.width  = WIDTH;
      canvas.height = HEIGHT;

      ctx = canvas.getContext("2d");

      renderPage(page, ctx);

      element = $('<div />', { 
            "class": _class,
            'id' : 'p'+ page
            }).append(canvas);

      BOOK.turn("addPage", element, page);

    }

    function renderPage(num, ctx){

      var viewport,
          renderContext;

      PDFDOC.getPage(num).then(function (page){

          viewport = page.getViewport(SCALE);

          renderContext = {       
                canvasContext: ctx,
                viewport: viewport
                };

          page.render(renderContext);

      });
    }

    function elementPager(){

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

      actionPager();

    }

    function actionPager(){

      $(".li_page a").click(function() {

        var rel = $(this).attr("rel");

        BOOK.turn("page", rel);

      });

      $("#prev_page a").click(function() {

       BOOK.turn("previous");

      });

      $("#next_page a").click(function() {

        BOOK.turn("next");

      });

      BOOK.bind("turned", function(event, page){

        $(".li_page").removeClass('active');

        $("#page_" + page).addClass('active');

        var sig = 1;

        if (page %2 === 0 && page > 1) {

          sig = parseInt(page) + 1;

          $("#page_" + sig).addClass('active');
          
        }
        else {
          sig = parseInt(page) - 1;
          $("#page_" + sig).addClass('active');
        }

      }); 

      $("#page_1").addClass('active');

    }

    function positionBook(){

      var element = document.getElementById('flipbook');

      var positionShow = {x : window.innerWidth / 2, y : window.innerHeight / 2};

      element.style.left = Math.random() * 5000 + 'px';
      element.style.top = Math.random() * 5000 + 'px';

      setTimeout(function() {
        animateBook(element, positionShow);
      }, 1500);

    }

    function ConfigPager(){

      var element = document.getElementById('pager'),
          positionShow = {y : ((HEIGHT / 2) + (window.innerHeight / 2))};

      element.style.top = Math.random() * 5000 + 'px';

      setTimeout(function() {
        animatePager(element, positionShow);
      }, 1500);

      elementPager();
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