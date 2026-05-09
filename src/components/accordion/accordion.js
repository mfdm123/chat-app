import './accordion-item.js';

export class Accordion extends HTMLElement {
    constructor() {
        super();

        this.abortController = new AbortController;
    }
    connectedCallback() {
        this.initConfig();
        this.bindEvents();
    }
    initConfig() {
        this.exclusive = this.hasAttribute('exclusive');
    }

    handleItemOpenEvent = (e) => {
        const targetItem = e.composedPath()[0].closest('accordion-item');
        this.querySelectorAll('accordion-item').forEach((item) => {
            if (item !== targetItem) {
                item.close();
            }
        });
    }
    bindEvents() {
        if (this.exclusive) {
            this.addEventListener('accordion-item:open', this.handleItemOpenEvent, { signal: this.abortController.signal });
        }
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('x-accordion', Accordion);