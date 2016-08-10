/**
 * @author Simón Oroño
 * @param {String} stack the stack trace
 * @param {Object} variables all the variables from an object
 * @param {String} env the current environment
 *
 * Send all the error data to the server.
 */
function report(stack, variables, env, message) {
    var req = new XMLHttpRequest(),
        url = helper.getAPIUrl("issues");

    var json = JSON.stringify({
        'stack': stack,
        'variables': variables,
        'env': env,
        'message': message
    });

    $.ajax({
        url: helper.getAPIUrl("issues"),
        method: 'post',
        data: {
            json: json
        }
    }).success(function() {
        alert('An error ocurred and it was reported to the developers');
    }).error(function() {
        alert('An error ocurred and it could not be reported to the developers');
    });

}

/**
 * @author Simón Oroño
 * @param {Object} obj The object to examinate
 * @param {Boolean} condition The condition to be tested
 *
 * Used to verify some condition, if this conditions fails, an error report will
 * be created.
 */
function assert(obj, expression, message) {
    'use strict';
    if (expression === false) {
        var err = new Error();
        var stack = err.stack;
        var variables = {};

        for (var i in obj) {
            if (obj.hasOwnProperty(i) && (typeof obj[i]) !== 'function') {
                variables[i] = obj[i];
            }
        }

        report(stack, variables, window.API_ENV, message);
    }
}
