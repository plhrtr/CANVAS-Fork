import { Menu } from "menu";

let editorInstance = null;

export class Editor {
    constructor() {
        // singleton
        if (editorInstance) return editorInstance;
        editorInstance = this;

        this.menu = new Menu();
    }
}
