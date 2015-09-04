function Timeline ( tasks, container ) {
    
    this.groups = [];
    this.items = [];
    this.container = container;
    
    var id = 0;
    
    for( var i = 0; i < tasks.length; i++ ) {
        
        var task = table[ tasks[i] ];
        
        if ( task != null && task.life_cycle != null ) {
            
            var schedule = task.life_cycle;
            
            this.groups.push ( {
                id : i,
                content : task.group + '/' + task.layer + '/' + task.name
            });
            
            for( var j = 0; j < schedule.length; j++ ) {
                
                if ( schedule[j].target != '' ) {
                    this.items.push ( {
                        id : id,
                        content : schedule[j].name + ' <span style="color:#97B0F8;">(target)</span>',
                        start : parseDate( schedule[j].target ),
                        group : i
                    });
                    
                    id++;
                }
                
                if ( schedule[j].reached != '' ) {
                    this.items.push ( {
                        id : id,
                        content : schedule[j].name + ' <span style="color:#97B0F8;">(reached)</span>',
                        start : parseDate( schedule[j].reached ),
                        group : i
                    });
                    
                    id++;
                }
            }
        }
    }
}

Timeline.prototype.hide = function ( duration ) {
    
    var _duration = duration || 1000;
    
    $('#timelineContainer').fadeTo(_duration, 0, function() { $('#timelineContainer').remove(); });
}

Timeline.prototype.show = function ( duration ) {
    
    var _duration = duration || 2000;
    
    if ( this.groups.length != 0 ) {
        
        if ( this.container == null ) {
            this.container = document.createElement( 'div' );
            this.container.id = 'timelineContainer';
            this.container.style.position = 'absolute';
            this.container.style.left = '0px';
            this.container.style.right = '0px';
            this.container.style.bottom = '0px';
            this.container.style.height = '25%';
            this.container.style.overflowY = 'auto';
            this.container.style.borderStyle = 'ridge';
            this.container.style.opacity = 0;
            $('#container').append(this.container);
        }
        
        var timeline = new vis.Timeline( this.container );
        timeline.setOptions( { 
            editable : false,
            minHeight : '100%'
        } );
        timeline.setGroups( this.groups );
        timeline.setItems( this.items );
        
        $(this.container).fadeTo( _duration, 1 );
    }
}