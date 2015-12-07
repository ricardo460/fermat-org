# fermat-org

## Code agreement

### About naming variables

- __Variable names:__ The variables will be named using _lowerCamelCase_ and they will be as descriptive, short and concise as possible. _lowerCamelCase_ is one of the most common classifications in programming and is a name that includes several words, it will be written without separation and the first letter of each word except the first, is capitalized. Example:
```javascript
var edades_de_personas; //BAD
var edadesdepersonas; //BAD
var arrEdadesDePersonas; //BAD, the name must be descriptive enough to provide its type
var edadesPersonas; //GOOD
```

- __Global:__ When reading Global variables they will be set for `window.` To check it in order it is global, the global present in other code files will be used only for reading or calling not to change its value. Example:
```javascript
var global = 3;

function foo() {
  var local = window.global + 3;
}
```
_Avoid creating more global variables as much as you can_

- __Constant:__ The constant variables are completely written in capital letters and the words are separated by underscore (_). Example:
```javascript
var MAX_NUMEROS = 3;
```

### About signs and styles

- __Styles:__ The keys to open a function will be written in the same line where it was declared
```javascript
function foo() {
  ...
}
```
If a condition or block takes one line, it can be written right on the next line with proper indentation
```javascript
if(condicion)
  accion();
  
  ...

/*If the if is a single line but has an else , and else has several, it will be drawn with keys, the else will go on the bottom line,
some editors have trouble if the else is put on the same line where it closes  */
if(condicion) {
  accion();
}
else {
  otraAccion();
  masAcciones();
}

//If otherwise, both if and else have a single line , there won’t be a problem to leave them without keys
if(condicion)
  accion();
else
  otraAccion();
```
No space is left between the brackets, but will leave it between signs and commas:
```javascript
foo = llamada( 'hola', 30, i + 5 ); //Mal
foo = llamada('hola',30,i+5); //Mal
foo = llamada ('hola', 30, i + 5); //Mal
foo = llamada('hola', 30, i + 5); //Bien
```

- __Comparisons:__ for common comparison we will use `===` since it is the safest, and it is only true if the values are also the same type. The use of other comparisons is only allowed when the expected variable __is a reference__ (not a number, or a Boolean, or string) and you want to verify their existence using `variable != null` and also `if(variable)`. You can make exceptions to this rule if and only if the expected variable is a string and is not allowed to be empty.

- __Default values:__ While the default settings are applied in ES6, it is a very new and not many browsers support it, so there are two ways to assign default values:
```javascript
function foo(varA, varB) {
  varA = varA || 'Sin nombre'; //if and only if varA is not a number, boolean. (also empty strings will be rejected)
  varB = (varB !== undefined) ? varB : 10; //for other cases (this is preferred since it’s safer for value variables)
}
```

### About structures and objects 

- __Public attributes:__ Public attributes are created using `this`.
- __Public methods on an object that can be repeated:__ If an object is designed to have multiple instances in the code, the methods are not created with `this`, but it will be added to the __prototype__ and should not have private methods.
- __Private Attributes:__ Private attributes are created using `var`.
- __Using public attributes within the object:__ Any object will have a private attribute as a variable named `self` that will reference the variable `this` in order to safely access the methods of that object (because we know `this` might not be what we expect). Here’s an example of the skeleton of an object with everything it could have:

```javascript
//in its own myClase.js file
function myClase(parametros) {
  
  //Constant
  var CONSTANTE = 10;
  
  //Public attributes
  this.atributoPublico = null;
  
  //Private attributes
  var self = this;
  var attrPrivado = 30;
  
  //Public methods (if the class will only have one instance)
  this.publico = function(params) {
    //...
  }
  
  //Private methods (the same condition as before)
  function privada(params) {
    //...
  }
  
  //Events if there are any
  
  //Initializing code
  
}

//Public methods if multiple instances of the same object will be used
myClase.prototype.funcionPublica = function(params) {
  //...
}
```

- __About loops:__ If there are several for loops in the same function and they use the same variable, the variable will be created as a variable of the function:
```javascript
//Bad, redefiniton of i
function foo() {
  //...
  
  for(var i = 0...)
  
  for(var i = 0...)
}

//Good, nothing to worry about
function foo() {
  //...
  var i;
  
  for(i = 0...)
  
  for(i = 0...)
}
```

The functions _callback_ are not defined within loops:
```javascript
//We know this is bad because when using callback, i will be the last value added.
function foo() {
  //...
  
  for(var i = 0...) {
    cargarTextura(function() {
      var textura = i;
      //...
    }
  }
}

//Correct, this way way cargar will be called for every iteration of for and with its respective values
function foo() {
  //...
  var cargar = function(textura) {
  
    cargarTextura(function() {
      //...
    }
  }
  
  for(var i = 0...) {
    cargar(i);
  }
}
```
