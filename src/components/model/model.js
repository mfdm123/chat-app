export class Model extends HTMLElement {
    constructor() {
        super();

        this.abortController = new AbortController;

        this._resizeObserver = null;
    }
    connectedCallback() {
        if (this.hasAttribute('opened')) {
            this.style.cssText = `
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: var(--model-height);
            `;
        } else {
            this.style.cssText = `
                display: none;
                height: var(--model-height);
            `;
        }
        
        const content = this.cacheContentElements();

        this.initConfig();
        this.renderStaticElements();
        this.cacheStaticElements();

        this.appendContentElements(content);

        this.bindEvents();
        this.setupResizeObserver();
    }

    static get observedAttributes() {
        return ['opened'];
    }

    attributeChangedCallback() {
        if (this.hasAttribute('opened')) {
            this.style.cssText = `
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: var(--model-height);
            `;
        } else {
            this.style.cssText = `
                display: none;
                height: var(--model-height);
            `;
        }
    }
    cacheContentElements = () => {
        const contentEls = Array.from(this.querySelectorAll('& > *:not([slot="close-button"])'));
        this.closeButtonEl = this.querySelector('[slot="close-button"]');
        return contentEls;
    }

    initConfig() {
        this.height = window.innerHeight + 'px';
        this.closeOnOverlay = this.hasAttribute('close-on-overlay');
    }
    set height(v) {
        this._height = v;
        this.style.setProperty('--model-height', v);
    }
    renderStaticElements() {
        this.innerHTML = `
            <div data-overlay class='model__overlay'>
                <div data-content class='model__content'>
                    <div data-close-button-container></div>
                </div>
            </div>

            <style>
                [data-overlay] {
                    z-index: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                }

                [data-content] {
                    z-index: 2;
                    display: block;
                    background-color: white;
                    border-radius: 4px;
                }

                [data-close-button-container] {
                    display: flex;
                    justify-content: end;
                }
            </style>
        `;
    }
    cacheStaticElements() {
        this.overlayEl = this.querySelector('[data-overlay]');
        this.contentEl = this.querySelector('[data-content]');
        this.closeButtonContainerEl = this.querySelector('[data-close-button-container]');
    }

    appendContentElements = (content) => {
        if (!this.closeButtonEl) {
            const defaultEl = document.createElement('button');
            defaultEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
            `;
            defaultEl.style.cssText = `
                width: 18px;
                height: 18px;
                border: none;
                background-color: transparent;
                margin: 4px 4px 0 0;
            `;
            this.closeButtonContainerEl.appendChild(defaultEl);
            this.closeButtonEl = defaultEl;
        }
        content.forEach(element => {
            this.contentEl.appendChild(element);
        });
    }

    close = () => {
        this.toggleAttribute('opened');
    }
    open = () => {
        this.toggleAttribute('opened');
    }
    toggle = () => {
        this.toggleAttribute('opened');
    }

    handleoverlayClick = (e) => {
        const actualTarget = e.composedPath()[0];
        if (actualTarget === this.overlayEl) {
            this.close();
        }
    }

    bindEvents = () => {
        if (this.closeOnOverlay) {
            this.overlayEl.addEventListener('click', this.handleoverlayClick, { signal: this.abortController.signal });
        }
        this.closeButtonEl.addEventListener('click', this.close, { signal: this.abortController.signal });
    }

    setupResizeObserver = () => {
        this._resizeObserver = new ResizeObserver(() => {
            this.height = window.innerHeight + 'px';
        });
        this._resizeObserver.observe(this);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('x-model', Model);