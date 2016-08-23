class Loader {

    /**
     * [getStamp description]
     * @method getStamp
     * @return {[type]} [description]
     */
    getStamp() {
        var img = document.createElement("img");
        img.className = 'stamp';
        img.src = 'images/alt_not_found.png';
        img.alt = 'Not Found';
        img.style.width = '90%';
        //img.style.margin = '35% 0 0 0';
        //img.style["margin-right"] = '80%';
        img.style.left = '5%';
        img.style.top = '40%';
        img.style.position = 'absolute';
        return img;
    }

    /**
     * check all elements in table
     * @method findThemAll
     */
    findThemAll() {
        /*for (var i = 0, l = globals.table.length; i < l; i++) {
            if (!table[i].found && table[i].code_level == "concept") {
                var strIndex = "#" + i;
                $(strIndex).append(this.getStamp());
            }
        }*/
    };
}