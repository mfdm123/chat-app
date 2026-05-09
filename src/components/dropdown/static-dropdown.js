import './dropdown.js';
import { Dropdown } from './dropdown.js';

export class StaticDropdown extends Dropdown {
    constructor() {
        super();
    }
    handleOutsideClick = () => {}
    open = () => {
        this.content.toggleAttribute('data-opened', true);
        this.openCallback();
    }
    close = () => {
        this.content.toggleAttribute('data-opened', false);
        this.closeCallback();
    }
}

customElements.define('static-dropdown', StaticDropdown);