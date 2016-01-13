function login() {
	window.open('https://github.com/login/oauth/authorize?client_id=6cac9cc2c2cb584c5bf4');
}

var code = window.location.toString().replace(/.+code=/, '');
	if(!(code.indexOf("/") >= 0))
	{
	console.log("code: "+code);
	var url = "http://127.0.0.1:3000/v1/repo/accessToken?code="+code;
	console.log("url: "+url);
	$.ajax({
        url: url,
        type: "GET",
        headers: { 
        	'Accept': 'application/json'
        } 
    }).success(
        function (data) {
        	console.log("mostrando access_token: ") 
        	var obj = jQuery.parseJSON(data);
        	console.log(obj.access_token);
        	$.getJSON('https://api.github.com/user?access_token=' + obj.access_token, function (user) {
        		console.log("Usuario github");
        		console.log("Nombre: "+user.name);
        		console.log("Login: "+user.login);
        		console.log("Email: "+user.email);
        		console.log("Avatar: "+user.avatar_url);
    		});
        });
	}