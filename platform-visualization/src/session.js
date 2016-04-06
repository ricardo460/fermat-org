function Session(){

	var isLogin;
	var api_key = "56a10473b27e63185c6970d6";
	var axs_key;
	var usr;
    var code;
    var self = this;
    var clientID = "d00a7c7d4489139327e4";
    switch(window.location.href.match("//[a-z0-9]*")[0].replace("//", '')) {
        case "dev":
            clientID = 'd00a7c7d4489139327e4';
            break;
        case "lab":
            clientID = 'f98fdd310fe6284f5416';
            break;
        case "3d":
            clientID = '1d65cbed13dbd026bec8';
            break;
    }

	this.getIsLogin = function(){
		return isLogin;
	};

	this.getUserLogin = function(){
		return usr;
	};

    /**
     * @author Ricardo Delgado
     */
    this.displayLoginButton = function(display) {

        if(window.session.getIsLogin()){

            if(display){

                window.helper.show('logout', 2000);
                window.helper.show('containerLogin', 2000);
            }
            else{

                window.helper.hide('logout', 2000, true);
                window.helper.hide('containerLogin', 2000, true);
            }
        }
        else{

            if(display)
                window.helper.show('login', 2000);
            else
                window.helper.hide('login', 2000, true);
        }

    };

    /**
     * @author Ricardo Delgado
     */
    this.useTestData = function(){
    };

	/**
	 * Login with github and gets the authorization code
	 */
	this.getAuthCode = function(){                                                                        //CLientID: c25e3b3b1eb9aa35c773 - Web
		var url = helper.buildURL("https://github.com/login/oauth/authorize", {client_id : clientID }); //ClientID: f079f2a8fa65313179d5 - localhost
        url += "&redirect_uri=" + window.location.href;
        window.location.href = url;
	};

	/**
	 * Ago logout and delete the token
	 */
	this.logout = function() {

		var url_logout = window.helper.getAPIUrl("logout", {axs_key : axs_key, api_key : api_key});
		console.log("url: " + url_logout);
		$.ajax({
			url : url_logout,
			type : "GET",
			headers : {
				'Accept' : 'application/json'
			}
		}).success(function(data) {
			console.log("Logout", data);
			if(data !== undefined) {
				if(data === true) {
					isLogin = false;
					$("#login").fadeIn(2000);
					$("#logout").fadeOut(2000);
					usr = undefined;
				}
            }
		});
        deleteToken();
	};

    this.init = function(){

        var cookie = getToken();

        if(cookie._id !== "") {
            self.login(true,cookie);
        }
        else {
            code = window.location.search.replace(/.+code=/, '');

            if((code !== "" && code.indexOf("/") < 0))
                self.login(false);
            else
                window.getData();
        }
        
    };

	/**
	 * Logged to the user and returns the token
	 */
	this.login = function(option, cookie) {

        if(!option) {
            
    		var url = window.helper.getAPIUrl("login", { code : code, api_key : api_key });
    		console.log("url: " + url);

    		$.ajax({
    			url : url,
    			type : "GET",
    			headers : {
    				'Accept' : 'application/json'
    			}
    		}).success(function(tkn) {
    			usr = tkn._usr_id;
    			axs_key = tkn.axs_key;
                window.console.dir(tkn);
                
    			if(usr !== undefined) {
    				isLogin = true;

                    usr.axs_key = axs_key;

    				console.log("Logueado Completamente: " + usr.name);

         			$("#login").fadeOut(2000);
         			$("#logout").fadeIn(2000);

         			drawUser(usr);
                    setToken(tkn);   
                }
                else {
    				console.log("Error:", tkn);
                    window.alert("Error: Could not login to Github, please inform at https://github.com/Fermat-ORG/fermat-org/issues");
                }
            });
        }
        else {
            usr = cookie._usr_id;
            axs_key = usr.axs_key;
                    
            isLogin = true;

            usr.axs_key = axs_key;

            console.log("Logueado Completamente: " + usr.name);

            $("#login").fadeOut(2000);
            $("#logout").fadeIn(2000);

            drawUser(usr);
        }

        window.getData();

	};

	function drawUser(user){
		var texture;

		texture = createTextureUser(user);
		var meshUserLogin = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({ transparent : true, color : 0xFFFFFF}));

		meshUserLogin.material.map = texture;
		meshUserLogin.material.needsUpdate = true;
		meshUserLogin.scale.set(75, 75, 75);
		meshUserLogin.position.y = 28500;
		meshUserLogin.position.x = 50000;
		//scene.add(meshUserLogin);
	}

	function createTextureUser(user){

		var canvas = document.createElement('canvas');
        canvas.width = 183 * 5 ;
        canvas.height = 92 * 5;
        canvas.style.height = '100px';
        canvas.id = "canvasLogin";

        document.getElementById('containerLogin').appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        var pic = {
            src: user.avatar_url,
            alpha: 0.8
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

        var nameUser = {
            text: user.name,
            font: 'bold ' + 50 + 'px Arial'
        };
        nameUser.x = 120 * 2;
        nameUser.y = 135;
        nameUser.color = "#000000";

        var data = [pic, nameUser];

        drawPictureUser(data, ctx, texture);

        return texture;
	}

	function drawPictureUser(data, ctx, texture){

		var image = new Image();
        var actual = data.shift();

        if(actual.src && actual.src != 'undefined') {

            image.onload = function() {


                if(actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if(texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;

                if(data.length !== 0) {

                    if(data[0].text)
                        drawTextUser(data, ctx, texture);
                    else
                        drawPictureUser(data, ctx, texture);
                }
            };

            image.onerror = function() {
                if(data.length !== 0) {
                    if(data[0].text)
                        drawTextUser(data, ctx, texture);
                    else
                        drawPictureUser(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        }
        else {
            if(data.length !== 0) {
                if(data[0].text)
                    drawTextUser(data, ctx, texture);
                else
                    drawPictureUser(data, ctx, texture);
            }
        }
	}

	function drawTextUser(data, ctx, texture){

		var actual = data.shift();

        if(actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;

        if(actual.constraint)
            if(actual.wrap)
                helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if(texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if(data.length !== 0){

          if(data[0].text)
            drawTextUser(data, ctx, texture);
          else
            drawPictureUser(data, ctx, texture);
        }
	}

    function setToken(tkn) {
        setCookie("id", tkn._id, 7);
        setCookie("key", tkn.axs_key, 7);
        setCookie("update", tkn.upd_at, 7);
        setCookie("v", tkn._usr_id.__v, 7);
        setCookie("avatar", tkn._usr_id.avatar_url, 7);
        setCookie("email", tkn._usr_id.email, 7);
        setCookie("github", tkn._usr_id.github_tkn, 7);
        setCookie("name", tkn._usr_id.name, 7);
        setCookie("usrnm", tkn._usr_id.usrnm, 7);
    }

    function deleteToken() {
        deleteCookie("id");
        deleteCookie("key");
        deleteCookie("update");
        deleteCookie("v");
        deleteCookie("avatar");
        deleteCookie("email");
        deleteCookie("github");
        deleteCookie("name");
        deleteCookie("usrnm");
    }

    function getToken() {
        var tkn = {
            _id : getCookie("id"),
            _usr_id : {
                __v : getCookie("v"),
                _id : getCookie("id"),
                avatar_url : getCookie("avatar"),
                axs_key : getCookie("key"),
                email : getCookie("email"),
                github_tkn : getCookie("github"),
                name : getCookie("name"),
                upd_at : getCookie("update"),
                usrnm : getCookie("usrnm")
            },
            axs_key : getCookie("key"),
            upd_at : getCookie("update")
        };

        return tkn;
    }

    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    }

    function getCookie(name) {
        var cname = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while(c.charAt(0) === ' ') 
                c = c.substring(1);
            if(c.indexOf(cname) === 0)
                return c.substring(cname.length, c.length);
        }
        return "";
    }

    function deleteCookie(name) {
        var expires = "expires=Thu, 20 Dec 2012 00:00:00 UTC";
        document.cookie = name + "=; " + expires;
    }
}
