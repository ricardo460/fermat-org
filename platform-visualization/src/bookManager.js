/**
 * @author Ricardo Delgado
 * Version 1 
 */
function BookManager() {

    this.state = 0;

    var self = this;
    
    window.PDFJS.disableWorker = true;

    var book = null,
        PDFDOC, 
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

      var flipbook = document.getElementById('flipbook');
      helper.hide(flipbook, 1000, false); 
      self.state = 0;
    };


    function addItems(){

      var page = $('<div />'),
          flipbook = $('<div />', {"class": "flipbook"}).append(page),
          viewport = $('<div />', {"class": "flipbook-viewport", "id": "flipbook"}).append(flipbook);

      $('#container').append(viewport);

      book = $('.flipbook');
    }

    this.createBook = function (){

      addItems();

      self.state = 1;

      configBook();

      for (var i = 1; i <= PDFDOC.numPages; i++)
        addPage(i);
    };

    function configBook(){

      book.turn({

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

      renderPage(page, canvas, ctx);

      element = $('<div />', { 
            "class": _class,
            'id' : 'p'+ page
            }).append(canvas);

      book.turn("addPage", element, page);

    }

    function renderPage(num, canvas, ctx){

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



}