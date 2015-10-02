var testFlow = 
{
    flowName : 'Nombre que describe al flujo',
    flowData : [
        {
            title : 'Paso uno',
            desc : 'Paso inicial del flujo',
            element : 'bch/crypto vault/bitcoin currency',  // Grupo/Layer/Nombre
            next : [1]                                      // Una lista de indices del mismo array
        },
        {
            title : 'Paso dos',
            desc : 'Este le sigue al paso uno',
            element : 'ccm/reference wallet/discount wallet',
            next : [2]
        },
        {
            title : 'Paso tres',
            desc : 'Este se bifurca en dos pasos',
            element : 'bnp/reference wallet/bank notes',
            next : [3, 4]
        },
        {
            title : 'Paso tres punto a',
            desc : 'Este es uno de los que sigue del 3',
            element : 'dap/actor/asset issuer',
            next : []
        },
        {
            title : 'Paso tres punto b',
            desc : 'Este le sigue al del 3 tambien',
            element : 'cbp/reference wallet/crypto broker',
            next : []
        }
    ]
};

function ActionFlow(flow) {
    
    this.flow = flow || testFlow || [];
    var self = this;
    var objects = [];
    
    var i, l;
    
    for(i = 0, l = self.flow.flowData.length; i < l; i++) {
        self.flow.flowData[i].element = helper.searchElement(self.flow.flowData[i].element);
    }
    
    this.draw = function(initialX, initialY) {
        
        var title = createTextBox(self.flow.flowName, {
            height : window.TILE_DIMENSION.height, size : 36, textAlign : 'center', fontWeight : 'bold'
        });
        
        title.position.set(initialX, initialY + window.TILE_DIMENSION.height * 2, 0);
        objects.push(title);
        scene.add(title);
        
        var columnWidth = window.TILE_DIMENSION.width * 3,
            rowHeight = window.TILE_DIMENSION.width * 3;
        
        for(i = 0, l = self.flow.flowData.length; i < l; i++)
            drawTree(self.flow.flowData[i], initialX, initialY);
        
        
        
        function drawTree(root, x, y) {
            
            if(typeof root.drawn === 'undefined') {
                drawStep(root, x, y);
            
                var childCount = root.next.length,
                    startX = x - 0.5 * (childCount - 1) * columnWidth;

                if(childCount !== 0) {

                    var lineGeo = new THREE.Geometry();
                    var lineMat = new THREE.LineBasicMaterial({color : 0x000000});

                    var rootPoint = new THREE.Vector3(x, y - rowHeight / 2);

                    lineGeo.vertices.push(
                        new THREE.Vector3(x, y - rowHeight * 0.25, 0),
                        rootPoint);

                    var rootLine = new THREE.Line(lineGeo, lineMat);
                    objects.push(rootLine);
                    window.scene.add(rootLine);

                    var nextX, nextY, childLine;

                    for(var child = 0; child < childCount; child++) {

                        nextX = startX + child * columnWidth;
                        nextY = y - rowHeight;

                        lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                            rootPoint,
                            new THREE.Vector3(nextX, rootPoint.y, 0),
                            new THREE.Vector3(nextX, nextY + rowHeight * 0.05, 0)
                        );

                        childLine = new THREE.Line(lineGeo, lineMat);
                        objects.push(childLine);
                        window.scene.add(childLine);

                        drawTree(self.flow.flowData[root.next[child]], nextX, nextY);
                    }
                }
            }
            
            
            function drawStep(node, x, y) {
            
                var tile;
                
                var titleHeight = window.TILE_DIMENSION.height / 2;
                
                if(node.element !== -1) {
                    tile = window.objects[node.element];
                    tile.position.set(x - window.TILE_DIMENSION.width / 2, y - titleHeight * 3 / 2, 0);
                }

                var title = createTextBox(node.title, {size : 24, fontWeight : 'bold', height : titleHeight, textAlign : 'center'});
                title.position.set(x, y, 0);

                var description = createTextBox(node.desc, {width : window.TILE_DIMENSION.width});
                description.position.set(x + window.TILE_DIMENSION.width / 2, y - titleHeight * 3 / 2, 0);

                node.drawn = true;
                objects.push(title);
                objects.push(description);
                window.scene.add(title);
                window.scene.add(description);
            }
        }
    };
    
    //Private methods
    function createTextBox(text, params) {
        
        if(typeof params === 'undefined') params = {};
        
        params = $.extend({
            fontWeight : 'normal',
            size : 12,
            fontFamily : 'Arial',
            width : window.TILE_DIMENSION.width * 2,
            height : window.TILE_DIMENSION.height,
            background : '#CCCCCC',
            textColor : '#000000',
            textAlign : 'left'
        }, params);
        
        
        
        var width = params.width;
        var height = params.height;
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        
        var ctx = canvas.getContext('2d');
        ctx.font = params.fontWeight + ' ' + params.size + 'px ' + params.fontFamily;
        ctx.textAlign = params.textAlign;
        
        
        ctx.fillStyle = params.background;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = params.textColor;
        
        var start = (params.textAlign !== 'center') ? 0 : width / 2;
        
        //var height = Math.abs(helper.drawText(text, 0, font, ctx, width, font)) * 2;
        helper.drawText(text, start, params.size, ctx, width, params.size);
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({map : texture, vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff}));
        
        mesh.material.needsUpdate = true;
        texture.needsUpdate = true;
        
        return mesh;
    }
}