export class ContentForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.abortController = new AbortController;
        this.defaultContent = this.getAttribute('default-content') || '';
    }
    connectedCallback() {
        this.defineInner();
        this.bindEvents();
    }
    defineInner() {
        this.shadowRoot.innerHTML = `
            <textarea data-content-input part='content-input'>${this.defaultContent}</textarea>
            <div data-buttons part='buttons'>
                <slot name='button'></slot>
                <slot name='submit-button'></slot>
            </div>
        `;
        this.contentInput = this.shadowRoot.querySelector('[data-content-input]');
        this.submitButtonSlot = this.shadowRoot.querySelector('slot[name="submit-button"]');
        this.submitButton = this.submitButtonSlot.assignedElements()[0];
    }
    submit = async () => {}
    bindEvents() {
        this.submitButton.addEventListener('click', this.submit, { signal: this.abortController.signal });
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('content-form', ContentForm);