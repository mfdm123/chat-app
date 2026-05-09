import { StaticDropdown } from '../dropdown/static-dropdown.js';

export class AccordionItem extends StaticDropdown {
    constructor() {
        super();
    }
    initConfig() {
        this.static = this.hasAttribute('static');
    }
    defineInner() {
        super.defineInner();
        if (this.static) {
            this.content.style.position = 'static';
        }
    }
    openCallback = () => {
        this.dispatchEvent(new CustomEvent('accordion-item:open', {
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('accordion-item', AccordionItem);