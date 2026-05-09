import './dropdown.js';
import { Dropdown } from './dropdown.js';

export class AutoCloseDropdown extends Dropdown {
    constructor() {
        super();
    }
    handleOutsideClick = (e) => {
        const path = e.composedPath();
        if (path.includes(this.trigger)) {
            return;
        } else {
            this.close();
        }
    }
}

customElements.define('auto-close-dropdown', AutoCloseDropdown);