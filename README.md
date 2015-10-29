# fermat-org

## Convenio de código

### Sobre la nomenclatura de variables

- __Nombres de variables:__ Las variables se nombrarán usando _lowerCamelCase_ y serán lo más descriptivos, cortos y concisos posible. _lowerCamelCase_ es una de las nomenclaturas más comunes en la programación y consiste en que un nombre que incluye varias palabras, se escribirá sin separación y la primera letra de cada palabra excepto la primera, va en mayúscula. Ej:
```javascript
var edades_de_personas; //MAL
var edadesdepersonas; //MAL
var arrEdadesDePersonas; //MAL, el nombre debe ser suficientemente descriptivo para inferir su tipo
var edadesPersonas; //BIEN
```

- __Globales:__ Las variables globales al leerlas tendrán como prefijo `window.` para marcarla propiamente con intención global, las globales presentes en otros archivos de código se usarán sólo para leer o llamar, no para modificar su valor. Ej:
```javascript
var global = 3;

function foo() {
  var local = window.global + 3;
}
```
_Evitar la creación de más variables globales lo más que se pueda_

- __Constantes:__ Las variables constantes se escribirán totalmente en mayúsculas y se separarán las palabras por piso (_). Ej:
```javascript
var MAX_NUMEROS = 3;
```

### Sobre signos y estilos

- __Estilos:__ Las llaves para abrir una función se escribirán en la misma línea de la firma
```javascript
function foo() {
  ...
}
```
Si una condición o bloque llevan una sola línea se puede escribir justo en la línea siguiente con la indentación correcta
```javascript
if(condicion)
  accion();
  
  ...

/*Si el if tiene una sola línea pero tiene else, se dibujará con llaves, los else irán en la línea de abajo,
algunos editores tienen problemas si el else se pone en la misma linea que donde se cierra  */
if(condicion) {
  accion();
}
else {
  otraAccion();
}
```
No se dejará espacio entre los paréntesis, pero sí entre signos y comas:
```javascript
foo = llamada( 'hola', 30, i + 5 ); //Mal
foo = llamada('hola',30,i+5); //Mal
foo = llamada ('hola', 30, i + 5); //Mal
foo = llamada('hola', 30, i + 5); //Bien
```

- __Comparaciones:__ Para comparaciones comúnes se usará la comparación con tipo `===` puesto que es la más segura y sólo es cierta si además los valores son del mismo tipo. Se permite el uso de otras comparaciones sólo cuando la variable esperada __es una referencia__ (no es un número, ni un booleano, ni una cadena) y se quiere verificar su existencia se pueden usar `variable != null` así como también `if(variable)`. Se puede hacer excepción a esta regla si y sólo si la variable esperada es una cadena y no se admite que sea vacía.

- __Valores por defecto:__ Si bien en ES6 se aplican los valores por defecto, es una especificación muy nueva y no muchos navegadores lo soportan, por lo tanto existen dos maneras de asignar valores por defecto:
```javascript
function foo(varA, varB) {
  varA = varA || 'Sin nombre'; //Si y solo si varA no es un numero, booleano. (También se rechazan cadenas vacías)
  varB = (varB !== undefined) ? varB : 10; //Para los demás casos (este es preferible por ser más seguro para las variables de valor)
}
```

### Sobre estructuras de código y objetos

- __Atributos públicos:__ Los atributos públicos se crearán usando `this`.
- __Métodos públicos en un objeto que puede repetirse:__ Si un objeto está diseñado a tener varias instancias en el código, los métodos no se crearán con `this`, sino que serán agregados al __prototipo__ y no debe tener métodos privados.
- __Atributos privados:__ Los atributos privados se crearán usando `var`.
- __Uso de atributos públicos dentro del objeto:__ Todo objeto tendrá como atributo privado una variable llamada `self` que referencie a la variable `this` para así poder acceder seguramente a los métodos del mismo objeto (porque sabemos que `this` podría no ser lo que esperamos). A continuación el esqueleto de un objeto con todo lo que podría tener:

```javascript
//En su propio archivo myClase.js
function myClase(parametros) {
  
  //Constantes
  var CONSTANTE = 10;
  
  //Atributos públicos
  this.atributoPublico = null;
  
  //Atributos privados
  var self = this;
  var attrPrivado = 30;
  
  //Métodos públicos (si la clase tendrá sólo una instancia
  this.publico = function(params) {
    //...
  }
  
  //Métodos privados (la misma condición anterior)
  function privada(params) {
    //...
  }
  
  //Eventos si hay
  
  //Código de initializacion
  
}

//Métodos públicos si serán usadas multiples instancias del mismo objeto
myClase.prototype.funcionPublica = function(params) {
  //...
}
```

- __Sobre bucles:__ Si existen varios bucles for en una misma función y usan la misma variable, la variable será creada como variable de la función:
```javascript
//Mal, redefinicion de i
function foo() {
  //...
  
  for(var i = 0...)
  
  for(var i = 0...)
}

//Bien, no hay que preocuparse
function foo() {
  //...
  var i;
  
  for(i = 0...)
  
  for(i = 0...)
}
```

Las funciones _callback_ no se definirán dentro de los bucles:
```javascript
//Sabemos que esto esta mal porque al llamar el callback, i será el último valor que se le puso.
function foo() {
  //...
  
  for(var i = 0...) {
    cargarTextura(function() {
      var textura = i;
      //...
    }
  }
}

//Correcto, de esta manera cargar se llamará por cada iteración del for y con sus respectivos valores
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
