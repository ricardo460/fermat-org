/**
 * @author Ricardo Delgado
 * Version 1 
 */
function BookManager() {

    this.state = 0;

    var self = this;
    
    window.PDFJS.disableWorker = true;

    var BOOK = null,
        PDFDOC = null, 
        SCALE = 0.8,
        WIDTH = 922,
        HEIGHT = 600,
        FILE = "images/threejs.pdf";


    this.init = function (){

      $(document).ready(function () {

          window.PDFJS.getDocument(FILE).then(function (doc) {

            PDFDOC = doc;

          });

      });
    };

    this.hide = function (){

      var flipbook = document.getElementById('flipbook'),
          pager = document.getElementById('pager');
      window.helper.hide(flipbook, 1000, false);
      window.helper.hide(pager, 1000, false); 
      self.state = 0;
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

      self.state = 1;

      configBook();

      for (var i = 1; i <= PDFDOC.numPages; i++)
        addPage(i); 

      ConfigPager();
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

    function ConfigPager(){

      var pager = document.getElementById('pager');
          pager.style.top = (200 + document.getElementById('flipbook').clientHeight) + 'px';

      elementPager();
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

      for (var i=1; i < pages + 1; i++){

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

        if (page %2 === 0 && page > 1) {

          var sig = parseInt(page) + 1;

          $("#page_" + sig).addClass('active');
          
        }
        else {
          var sig = parseInt(page) - 1;
          $("#page_" + sig).addClass('active');
        }

      }); 

      $("#page_1").addClass('active');

    }


}