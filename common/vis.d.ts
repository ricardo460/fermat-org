declare namespace vis {
    export class Timeline {
        constructor(container: HTMLDivElement);
        setOptions(options: Object);
        setGroups(groups: any[]);
        setItems(items: any[]);
    }
}

declare module 'vis' {
    export = vis;
}