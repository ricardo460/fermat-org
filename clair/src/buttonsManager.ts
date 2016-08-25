/**
 * @author Ricardo Delgado
 */
class ButtonsManager {

    objects = {
        left: {
            buttons: []
        },
        right: {
            buttons: []
        }
    };

    /**
     * @author Ricardo Delgado
     * All the buttons and their functions are added.
     * @param {String} id  Tile ID.
     */
    actionButtons(id: string, callback: () => void): void {
        this.removeAllButtons();
        globals.screenshotsAndroid.showButtonScreenshot(id);
        globals.tableEdit.addButton(id);
    };

    /**
     * @author Ricardo Delgado
     * creation of button and its function is added.
     * @param {String}  id  Button ID.
     * @param {String} text  Button text.
     * @param {Function} callback Function to call when finished.    
     */
    createButtons(id: string, text: string, callback: () => void, _x?: number, _type?: any, _side?: any): HTMLElement {

        if (!document.getElementById(id)) {

            let object = {
                id: id,
                text: text
            };

            let x = _x || 5,
                type = _type || 'button',
                side = _side || 'left';

            let idSucesor = "backButton";

            if (side === 'right')
                idSucesor = '';
            else
                side = 'left';

            if (this.objects[side].buttons.length !== 0)
                idSucesor = Helper.getLastValueArray(this.objects[side].buttons).id;


            let button = document.createElement(type),
                sucesorButton = document.getElementById(idSucesor);

            button.id = id;
            button.className = 'actionButton';
            button.style.position = 'absolute';
            button.innerHTML = text;
            button.style.top = '10px';
            button.style[side] = this.calculatePosition(sucesorButton, side, x);
            button.style.zIndex = '10';
            button.style.opacity = '0';

            button.addEventListener('click', function () {
                if (typeof (callback) === 'function')
                    callback();
            });

            document.body.appendChild(button);
            this.objects[side].buttons.push(object);
            Helper.show(button, 1000);

            return button;
        }
    };

    /**
     * @author Ricardo Delgado
     * Eliminates the desired button.
     * @param {String}  id  Button ID.
     * @param {Function} callback Function to call when finished.    
     */
    deleteButton(id: string, callback: () => void): void {

        for (let side in this.objects) {
            for (let i = 0; i < this.objects[side].buttons.length; i++) {
                if (this.objects[side].buttons[i].id === id) {
                    this.objects[side].buttons.splice(i, 1);
                    Helper.hide($('#' + id), 1000, false, callback);
                }
            }
        }
    };

    /**
     * @author Ricardo Delgado
     * Removes all created buttons. 
     */
    removeAllButtons(action?: boolean): void {

        if (this.objects.left.buttons.length !== 0 || this.objects.right.buttons.length !== 0) {

            let side = 'left';

            if (this.objects[side].buttons.length === 0)
                side = 'right';

            let actualButton = this.objects[side].buttons.shift();

            if ($('#' + actualButton.id) != null)
                Helper.hide($('#' + actualButton.id), 1000);

            this.removeAllButtons(action);
        }
        else {
            if (!action)
                globals.fieldsEdit.removeAllFields();
        }
    };

    calculatePosition(sucesorButton: HTMLElement, side: string, x: number): string {

        if (side === 'left')
            return ((sucesorButton.offsetLeft + sucesorButton.clientWidth + x) + 'px');
        else {
            if (!sucesorButton)
                return (x + 'px');
            else
                return ((window.innerWidth - sucesorButton.offsetLeft + x) + 'px');
        }
    }
}