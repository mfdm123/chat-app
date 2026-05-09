import './form-item.js';

export class Form extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: 'open' });
        this.abortController = null;
    }
    connectedCallback() {
        this.initConfig();

        this.renderStaticElements();
        this.cacheStaticElements();

        this.renderDynamicElements();

        this.bindEvents();
    }

    initConfig = () => {
        this.url = this.getAttribute('url');
        this.requestHeaders = null;

        this.onSuccess = this.getAttribute('onSuccess');
    }

    renderStaticElements = () => {
        this.shadowRoot.innerHTML = `
            <slot part='form-items'></slot>
            <slot name='submit-button' part='submit-button'></slot>

            <style>
                :host {
                    display: block;
                }

                slot[part='form-items'] {
                    display: flex;
                    flex-direction: column;
                }
            </style>
        `;
    }

    cacheStaticElements = () => {
        this.formItemsEls = this.shadowRoot.querySelector('slot[part="form-items"]').assignedElements().filter(el => el.matches('form-item'));
        this.submitButtonSlot = this.shadowRoot.querySelector('slot[name="submit-button"]');
        this.submitButtonEl = this.submitButtonSlot.assignedElements()[0];
    }

    renderDynamicElements = () => {
        if (!this.submitButtonEl) {
            const element = document.createElement('button');
            element.textContent = 'submit';
            element.setAttribute('slot', 'submit-button');
            this.submitButtonSlot.appendChild(element);

            this.submitButtonEl = element;
        }
    }

    checkValidity = () => {
        for (let i = 0; i < this.formItemsEls.length; i++) {
            const item = this.formItemsEls[i];
            if (!item.ifValid) {
                return false;
            }
        }
        return true;
    }

    getFormData = () => {
        const data = {};
        this.formItemsEls.forEach(item => {
            data[item.name] = item.inputEl.value;
        });
        return data;
    }

    submit = async () => {
        if (!this.checkValidity()) {
            this.dispatchEvent(new CustomEvent('x-form:invalid', {
                detail: { message: 'Please check whether the form is filled out properly.' },
                bubbles: true,
                composed: true
            }));
            console.log('Invalid form content.');
            return;
        }

        const data = this.getFormData();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.requestHeaders) {
            Object.assign(headers, this.requestHeaders);
        }
        const res = await fetch(this.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const result = await res.json();
            console.error(result.message);

            this.dispatchEvent(new CustomEvent('x-form:failure', {
                detail: { result },
                bubbles: true,
                composed: true
            }));
            return;
        }
        const result = await res.json();
        this.dispatchEvent(new CustomEvent('x-form:success', {
            detail: { result },
            bubbles: true,
            composed: true
        }));
    }

    bindEvents = () => {
        this.abortController = new AbortController;

        this.submitButtonEl.addEventListener('click', this.submit, { signal: this.abortController.signal });
    }

    disconnectedCallback() {
        if (this.abortController && !this.abortController.signal.aborted) {
            this.abortController.abort();
        }
    }
}

customElements.define('x-form', Form);