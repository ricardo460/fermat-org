/**
 * @author Isaias Taborda
 * @lastmodifiedBy Emmanuel Colina
 * function creates a guide to help inexperienced users navigate the site
 */
function Guide() {

    this.addButton = function(){

        function showHelp() {
            if(!document.getElementById("modal-help-div")) {
                var div = document.createElement("div");
                div.id="modal-help-div";
                div.dataset.state = "hidden";

                div.innerHTML = `
                <div id="modal-help">
                    <div id="modal-close-div"><button id="modal-help-close"></button></div>
                    <div id="modal-close-shadow">
                        <div id="modal-close-icon">
                          <div><img src="images/guide/alert.png"></div>
                        </div>

                        <div id="modal-help-text">
                          <ul>
                            <li><p>Use the blue arrows yo navigate through the site.</p></li>
                            <li><p>You can zoom in, or zoom out, using the scroll wheel or by<br>
                            dragging your mouse while holding down the S key and left click.</p></li>
                            <li><p>Press the Esc key in any view to return to its starting position</p></li>
                            <li><p>After you zoom in, hold down left click and drag your mouse to <br>pan across the page view</p></li>
                          </ul>
                        </div>
                    </div>
                </div>
                `;

                document.body.appendChild(div);
                
                document.getElementById("modal-help-close").onclick = function() {
                    var div = document.getElementById("modal-help-div");
                    div.dataset.state = "hidden";
                    
                    var area = document.getElementById("hidden-area");
                    window.helper.hide(area, 1000);
                };

                window.onresize = function() {

                    var button = document.getElementById("modal-help-close");
                    button.style.width = button.offsetHeight + "px";
                    button.style.backgroundSize= button.offsetHeight + "px";

                    var m = document.getElementById("modal-help");
                    var div = document.getElementById("modal-help-div");
                    var w = (m.offsetHeight*1.4) + "px";
                    m.style.width = w;

                    var m_y = (window.innerHeight/2) - (m.offsetHeight/2);

                    div.style.top = m_y + "px";
                };
            }
            
            var div = document.getElementById("modal-help-div");
            div.dataset.state = "show";
            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            window.onresize();
        }

        var text = 'Help',
            button = 'helpButton',
            side = 'left';

        window.buttonsManager.createButtons(button, text, showHelp, null, null, side);
    };

    this.buttonWorkFlowRepair = function(){

        function showHelp() {
            if(!document.getElementById("modal-help-div")) {
                var div = document.createElement("div");
                div.id="modal-help-div";
                div.dataset.state = "hidden";

                div.innerHTML = `
                <div id="modal-help">
                    <div id="modal-close-div"><button id="modal-help-close"></button></div>
                    <div id="modal-close-shadow">
                        <div id="modal-close-icon">
                          <div><img src="images/guide/alert.png"></div>
                        </div>

                        <div id="modal-help-text">
                          <ul>
                            <li><p>In the Repair Mode, the you must assign in each step with a <br>
                            red ! sign a specific component, in your left pane you can see<br>
                            the steps, and those that are invalid with a red symbol !</p></li>
                            <li><p>Select in the pane any step with an error by clicking on it <br>
                            to enable the component selection.</p></li>
                            <li><p>Select in the table the componen you want to assign to that <br>
                            step, automatically it will change its ! icon for a green mark <br>
                            showing it is valid now.</p></li>
                            <li><p>Repeat for any other step with error. When done, click on the <br>
                            "Continue" button and you will go to the previous view.</p></li>
                          </ul>
                        </div>
                    </div>
                </div>
                `;

                document.body.appendChild(div);
                
                document.getElementById("modal-help-close").onclick = function() {
                    var div = document.getElementById("modal-help-div");
                    div.dataset.state = "hidden";
                    
                    var area = document.getElementById("hidden-area");
                    window.helper.hide(area, 1000);
                };

                window.onresize = function() {

                    var button = document.getElementById("modal-help-close");
                    button.style.width = button.offsetHeight + "px";
                    button.style.backgroundSize= button.offsetHeight + "px";

                    var m = document.getElementById("modal-help");
                    var div = document.getElementById("modal-help-div");
                    var w = (m.offsetHeight*1.4) + "px";
                    m.style.width = w;

                    var m_y = (window.innerHeight/2) - (m.offsetHeight/2);

                    div.style.top = m_y + "px";
                };
            }
            
            var div = document.getElementById("modal-help-div");
            div.dataset.state = "show";
            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            window.onresize();
        }

        var text = 'Help',
            button = 'helpButton',
            side = 'right';

        window.buttonsManager.createButtons(button, text, showHelp, null, null, side);
    };
}