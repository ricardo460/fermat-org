/**
 * @author Ricardo Delgado
 * Version 1 
 */
function BookManager() {

    this.book;
    this.view;//Nombre Provisionar 

    var self = this;
    
    PDFJS.disableWorker = true;

    var PDFDOC, 
        SCALE = 0.8,
        WIDTH = 922,
        HEIGHT = 600,
        FILE = "images/threejs.pdf";


    this.init = function (){

      addItems();
      self.book = $('.flipbook');
      createBook();
      self.hide();
    }

    this.hide = function (){
        state(0);
        self.view = 0; 
    }

    this.show = function (){
      
      setTimeout(function() { 
        state(1);
        self.view = 1;
      }, 2000);
    }

    function state(valor){

       $(self.book).fadeTo(3000, valor, function() {

           $(self.book).show();

       });

    }

    function addItems(){

      var page = $('<div />'),
          flipbook = $('<div />', {"class": "flipbook"}).append(page),
          viewport = $('<div />', {"class": "flipbook-viewport"}).append(flipbook);

      $('#container').append(viewport);
    }

    function createBook(){ 

      $(document).ready(function () {

          PDFJS.getDocument(FILE).then(function (doc) {

            PDFDOC = doc;

            config();

            for (var i = 1; i <= PDFDOC.numPages; i++ )

                addPage(i);
          });

      });

    }

    function config(){

      self.book.turn({

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

      self.book.turn("addPage", element, page);

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