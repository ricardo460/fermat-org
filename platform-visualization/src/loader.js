function Loader() {

    this.folderExists = function(index) {
        var repoDir = helper.getRepoDir(table[index]);
        //console.log(index);
        console.log(repoDir);
        /*$.ajax({
            url: "get_contents.php?url=" + repoDir,
            method: "GET"
        }).done(function(result) {
        	//console.log(index);
        	var res = JSON.parse(result);
        	console.dir(result);
            //alert("success");
        }).fail(function(result, error) {
        	//console.log(index);
            console.dir(result);
            console.dir(error);
        });*/

    };

    for (var i = 0, l = table.length; i < l; i++) {
        this.folderExists(i);
    }
}

//var loader = new Loader();