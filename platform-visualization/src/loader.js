function Loader() {
    // reference to the object
    var that = this;

    /**
     * [getStamp description]
     * @method getStamp
     * @return {[type]} [description]
     */
    function getStamp() {
        var img = document.createElement("img");
        img.className = 'stamp';
        img.src = 'images/not_found.png';
        img.alt = 'Not Found';
        img.style.width = '15%';
        img.style.margin = '5% 80% 0 0';
        //img.style["margin-right"] = '80%';
        //img.style["margin-top"] = '5%';
        return img;
    }

    /**
     * does an ajax request to check if repo folder exists
     * @method folderExists
     * @param  {Number}     index index of element
     */
    this.folderExists = function(index) {
        var strIndex = "#" + index;
        var repoDir = helper.getRepoDir(table[index]);
        if (repoDir) {
            $.ajax({
                url: "get_contents.php?url=" + repoDir,
                method: "GET"
            }).done(function(result) {
                var res = JSON.parse(result);
                var found = true;
                if (res.message && res.message == "Not Found") {
                    found = false;
                    $(strIndex).append(getStamp());
                } else {
                    console.log(repoDir);
                }
                table[index].folder_found = found;
            });
        } else {
            table[index].folder_found = false;
            $(strIndex).append(getStamp());
        }
    };

    /**
     * check all elements in table
     * @method findThemAll
     */
    this.findThemAll = function() {
        for (var i = 0, l = table.length; i < l; i++) {
            that.folderExists(i);
        }
    };
}