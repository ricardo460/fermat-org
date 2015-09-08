function Loader() {
    // reference to the object
    var that = this;

    /**
     * does an ajax request to check if repo folder exists
     * @method folderExists
     * @param  {Number}     index index of element
     */
    this.folderExists = function(index) {
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
                }
                if (found) console.log(repoDir);
                table[index].folder_found = found;
            });
        } else {
            table[index].folder_found = false;
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