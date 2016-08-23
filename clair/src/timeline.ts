
/**
 * @class Timeline
 *
 * @param {Array}  tasks     An array of numbers containing all task ids
 * @param {Object} [container] Container of the created timeline
 */
class Timeline {

    constructor(public tasks, public container) {

        let id = 0;

        for (let i = 0, tl = tasks.length; i < tl; i++) {

            let task = Helper.getSpecificTile(tasks[i]).data;

            if (task != null && task.life_cycle != null) {

                if (task.life_cycle.length !== 0) {

                    let schedule = task.life_cycle,
                        tile, wrap,
                        lastTarget = Helper.parseDate(schedule[0].reached),
                        lastReached = lastTarget;

                    let canvas = document.createElement('canvas');
                    let oldCanvas = Helper.getSpecificTile(tasks[i]).children[0].material.map.image;
                    canvas.width = oldCanvas.width;
                    canvas.height = oldCanvas.height;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(oldCanvas, 0, 0);

                    tile = canvas;
                    tile.style.position = 'relative';
                    tile.style.display = 'inline-block';

                    this.groups.push({
                        id: i,
                        content: tile
                    });

                    // First status marks the start point, not needed here
                    for (let j = 1, sl = schedule.length; j < sl; j++) {

                        let itemColor,
                            end,
                            item;

                        switch (schedule[j - 1].name) {
                            case "Concept":
                                itemColor = this.CONCEPT_COLOR; break;
                            case "Development":
                                itemColor = this.DEVEL_COLOR; break;
                            case "QA":
                                itemColor = this.QA_COLOR; break;
                        }


                        // Planned
                        if (schedule[j].target !== '') {

                            end = Helper.parseDate(schedule[j].target);

                            item = {
                                id: id++,
                                content: schedule[j - 1].name + ' (plan)',
                                start: lastTarget,
                                end: end,
                                group: i,
                                subgroup: 'plan',
                                style: 'background-color:' + itemColor
                            };

                            this.items.push(item);

                            lastTarget = end;
                        }

                        // Real
                        if (schedule[j].reached !== '') {

                            end = Helper.parseDate(schedule[j].reached);

                            item = {
                                id: id++,
                                content: schedule[j - 1].name + ' (real)',
                                start: lastReached,
                                end: end,
                                group: i,
                                subgroup: 'real',
                                style: 'background-color:' + itemColor
                            };

                            this.items.push(item);

                            lastReached = end;
                        }
                    }
                }
            }
        }
    }

    // Constants
    CONCEPT_COLOR = 'rgba(170,170,170,1)';
    DEVEL_COLOR = 'rgba(234,123,97,1)';
    QA_COLOR = 'rgba(194,194,57,1)';

    // Public properties
    groups = [];
    items = [];


    /**
     * Hides and destroys the timeline
     * @param {Number} [duration=1000] Duration of fading in milliseconds
     */
    hide(duration) {

        let _duration = duration || 1000;

        $('#timelineContainer').fadeTo(_duration, 0, function () { $('#timelineContainer').remove(); });
    };


    /**
     * Shows the timeline in it's given container, if it was null, creates one at the bottom
     * @param {Number} [duration=2000] Duration of fading in milliseconds
     */
    show(duration) {

        let _duration = duration || 2000;

        if (this.groups.length !== 0) {

            if (this.container == null) {
                this.container = document.createElement('div');
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

            let timeline = new vis.Timeline(this.container);
            timeline.setOptions({
                editable: false,
                minHeight: '100%',
                stack: false,
                align: 'center'
            });
            timeline.setGroups(this.groups);
            timeline.setItems(this.items);

            $(this.container).fadeTo(_duration, 1);
        }
    }
}