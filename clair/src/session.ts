class Session {

    isLoggedIn: boolean;
    api_key = "56a10473b27e63185c6970d6";
    axs_key: string;
    usr: UserData;
    code: string;

    getIsLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    getUserLogin(): UserData {
        return this.usr;
    };

    /**
     * @author Ricardo Delgado
     */
    displayLoginButton(display: boolean): void {
        if (this.isLoggedIn) {
            if (display) {
                Helper.show('logout', 2000);
                Helper.show('containerLogin', 2000);
            } else {
                Helper.hide('logout', 2000, true);
                Helper.hide('containerLogin', 2000, true);
            }
        } else {
            if (display)
                Helper.show('login', 2000);
            else
                Helper.hide('login', 2000, true);
        }
    };

    /**
     * @author Ricardo Delgado
     */
    useTestData(): void {
    };

    /**
     * Login with github and gets the authorization code
     */
    getAuthCode(): void { //CLientID: c25e3b3b1eb9aa35c773 - Web
        let url = Helper.buildURL("https://github.com/login/oauth/authorize", {
            client_id: Constants.CLIENT_ID
        }); //ClientID: f079f2a8fa65313179d5 - localhost
        url += "&redirect_uri=" + window.location.href;
        window.location.href = url;
    };

    /**
     * Ago logout and delete the token
     */
    logout(): void {

        let url_logout = globals.api.getAPIUrl("logout", {
            axs_key: this.axs_key,
            api_key: this.api_key
        });
        console.log("url: " + url_logout);
        $.ajax({
            url: url_logout,
            type: "GET",
            headers: {
                'Accept': 'application/json'
            }
        }).done((data) => {
            console.log("Logout", data);
            if (data !== undefined) {
                if (data === true) {
                    this.isLoggedIn = false;
                    $("#login").fadeIn(2000);
                    $("#logout").fadeOut(2000);
                    this.usr = undefined;
                }
            }
        });
        this.deleteToken();
    };

    init(): void {

        let cookie = this.getToken();

        if (cookie._id !== "") {
            this.login(true, cookie);
        } else {
            this.code = window.location.search.replace(/.+code=/, '');

            if ((this.code !== "" && this.code.indexOf("/") < 0))
                this.login(false);
            else
                getData();
        }

    };

    /**
     * Logged to the user and returns the token
     */
    login(option: boolean, cookie?: any): void {

        if (!option) {

            let url = globals.api.getAPIUrl("login", {
                code: this.code,
                api_key: this.api_key
            });
            console.log("url: " + url);

            $.ajax({
                url: url,
                type: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }).done((tkn) => {
                this.usr = tkn.userData;
                this.axs_key = tkn.axs_key;
                window.console.dir(tkn);

                if (this.usr !== undefined) {
                    this.isLoggedIn = true;
                    this.usr.axs_key = this.axs_key;

                    console.log("Logueado Completamente: " + this.usr.name);

                    $("#login").fadeOut(2000);
                    $("#logout").fadeIn(2000);

                    this.drawUser(this.usr);
                    this.setToken(tkn);

                    getData();
                }
                else {
                    console.log("Error:", tkn);
                    window.alert("Error: Could not login to Github, please check if your email at Github is public, if not, set it public. If you still encounter this issue please inform at https://github.com/Fermat-ORG/fermat-org/issues");
                }
            });
        } else {
            this.usr = cookie.userData;
            this.axs_key = this.usr.axs_key;
            this.isLoggedIn = true;
            this.usr.axs_key = this.axs_key;

            console.log("Logueado Completamente: " + this.usr.name);

            $("#login").fadeOut(2000);
            $("#logout").fadeIn(2000);

            this.drawUser(this.usr);

            getData();
        }
    };

    private drawUser(user: UserData): void {
        let texture;

        texture = this.createTextureUser(user);
        let meshUserLogin = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({
                transparent: true,
                color: 0xFFFFFF
            }));

        (meshUserLogin.material as THREE.MeshBasicMaterial).map = texture;
        meshUserLogin.material.needsUpdate = true;
        meshUserLogin.scale.set(75, 75, 75);
        meshUserLogin.position.y = 28500;
        meshUserLogin.position.x = 50000;
        //scene.add(meshUserLogin);
    }

    private createTextureUser(user: UserData): THREE.Texture {

        let canvas = document.createElement('canvas');
        canvas.width = 183 * 5;
        canvas.height = 92 * 5;
        canvas.style.height = '100px';
        canvas.id = "canvasLogin";

        document.getElementById('containerLogin').appendChild(canvas);
        let ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;

        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        let pic = {
            src: user.avatar_url,
            alpha: 0.8,
            x: 0, y: 0, w: 0, h: 0
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

        let nameUser = {
            text: user.name,
            font: 'bold ' + 50 + 'px Arial',
            x: 0, y: 0, color: ''
        };
        nameUser.x = 120 * 2;
        nameUser.y = 135;
        nameUser.color = "#000000";

        let data = [pic, nameUser];

        this.drawPictureUser(data, ctx, texture);

        return texture;
    }

    private drawPictureUser(data: Array<any>, ctx: CanvasRenderingContext2D, texture: THREE.Texture): void {

        let image = new Image();
        let actual = data.shift();

        if (actual.src && actual.src != 'undefined') {
            image.onload = function () {
                if (actual.alpha)
                    ctx.globalAlpha = actual.alpha;
                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if (texture)
                    texture.needsUpdate = true;
                ctx.globalAlpha = 1;
                if (data.length !== 0) {
                    if (data[0].text)
                        this.drawTextUser(data, ctx, texture);
                    else
                        this.drawPictureUser(data, ctx, texture);
                }
            };

            image.onerror = () => {
                if (data.length !== 0) {
                    if (data[0].text)
                        this.drawTextUser(data, ctx, texture);
                    else
                        this.drawPictureUser(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        } else {
            if (data.length !== 0) {
                if (data[0].text)
                    this.drawTextUser(data, ctx, texture);
                else
                    this.drawPictureUser(data, ctx, texture);
            }
        }
    }

    private drawTextUser(data: Array<any>, ctx: CanvasRenderingContext2D, texture: THREE.Texture): void {

        let actual = data.shift();

        if (actual.color)
            ctx.fillStyle = actual.color;
        ctx.font = actual.font;
        if (actual.constraint)
            if (actual.wrap)
                Helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if (texture)
            texture.needsUpdate = true;
        ctx.fillStyle = "#FFFFFF";
        if (data.length !== 0) {
            if (data[0].text)
                this.drawTextUser(data, ctx, texture);
            else
                this.drawPictureUser(data, ctx, texture);
        }
    }

    private setToken(tkn: CookieData): void {
        this.setCookie("id", tkn.userData._id, 7);
        this.setCookie("key", tkn.axs_key, 7);
        this.setCookie("update", tkn.upd_at, 7);
        this.setCookie("v", tkn.userData.__v, 7);
        this.setCookie("avatar", tkn.userData.avatar_url, 7);
        this.setCookie("email", tkn.userData.email, 7);
        this.setCookie("github", tkn.userData.github_tkn, 7);
        this.setCookie("name", tkn.userData.name, 7);
        this.setCookie("usrnm", tkn.userData.usrnm, 7);
    }

    private deleteToken(): void {
        this.deleteCookie("id");
        this.deleteCookie("key");
        this.deleteCookie("update");
        this.deleteCookie("v");
        this.deleteCookie("avatar");
        this.deleteCookie("email");
        this.deleteCookie("github");
        this.deleteCookie("name");
        this.deleteCookie("usrnm");
    }

    private getToken(): CookieData {
        let tkn = {
            _id: this.getCookie("id"),
            userData: {
                __v: this.getCookie("v"),
                _id: this.getCookie("id"),
                avatar_url: this.getCookie("avatar"),
                axs_key: this.getCookie("key"),
                email: this.getCookie("email"),
                github_tkn: this.getCookie("github"),
                name: this.getCookie("name"),
                upd_at: this.getCookie("update"),
                usrnm: this.getCookie("usrnm")
            },
            axs_key: this.getCookie("key"),
            upd_at: this.getCookie("update")
        };

        return tkn;
    }

    private setCookie(name: string, value: string, days: number): void {
        let d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    }

    private getCookie(name: string): string {
        let cname = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1);
            if (c.indexOf(cname) === 0)
                return c.substring(cname.length, c.length);
        }
        return "";
    }

    private deleteCookie(name: string): void {
        let expires = "expires=Thu, 20 Dec 2012 00:00:00 UTC";
        document.cookie = name + "=; " + expires;
    }
}
