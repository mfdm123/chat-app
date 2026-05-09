export class Dropdown extends HTMLElement {
    constructor() {
        super();
        this.abortController = new AbortController;
        this.handleOutsideClick = () => {};
        this.isOpened = false;
        this.openCallback = () => {};
        this.closeCallback = () => {};
    }
    connectedCallback() {
        this.style.cssText = `
            position: relative;
        `;
        const contentEls = this.cacheContentElements();

        this.initConfig();

        this.configHandleOutsideClick();

        this.renderStaticElements();
        this.close();
        if (this.align === 'left') {
            this.content.style.right = 'none';
            this.content.style.left = '0';
        } else if (this.align === 'right') {
            this.content.style.left = 'none';
            this.content.style.right = '0';
        } else if (this.align === 'center') {
            this.content.style.right = 'none';
            this.content.style.left = '50%';
            this.content.style.transform = 'translateX(-50%)';
        }

        this.appendContentElements(contentEls);
        this.bindEvents();
    }
    cacheContentElements = () => {
        const contentEls = Array.from(this.querySelectorAll('& > *:not([slot="trigger"])'));
        this.trigger = this.querySelector('[slot="trigger"]');
        return contentEls;
    }
    initConfig() {
        this.align = this.getAttribute('align');
        this.isAutoClose = this.hasAttribute('auto-close');
    }
    renderStaticElements() {
        this.innerHTML = `
            <div data-trigger-container></div>
            <fieldset data-content class='dropdown__content'></fieldset>

            <style>
                [data-trigger-container] {
                    height: 100%;
                }
                [data-content] {
                    z-index: 1;
                    width: max-content;
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                }
            </style>
        `;
        
        this.triggerContainer = this.querySelector('[data-trigger-container]');
        this.content = this.querySelector('[data-content]');
    }
    appendContentElements = (contentEls) => {
        if (!this.trigger) {
            const defaultEl = document.createElement('button');
            defaultEl.innerHTML = 'trigger';
            defaultEl.classList.add('dropdown__trigger');
            this.trigger = defaultEl;
            this.triggerContainer.append(defaultEl);
        } else {
            this.trigger.classList.add('dropdown__trigger');
            this.triggerContainer.append(this.trigger);
        }

        contentEls.forEach(element => {
            this.content.appendChild(element);
        });
    }
    configHandleOutsideClick = () => {
        if (this.isAutoClose) {
            this.handleOutsideClick = (e) => {
                const path = e.composedPath();
                if (path.includes(this.trigger)) {
                    return;
                } else {
                    this.close();
                }
            }
        } else {
            this.handleOutsideClick = (e) => {
                const path = e.composedPath();
                if (path.includes(this)) {
                    return;
                } else {
                    this.close();
                }
            }
        }
    }
    open = () => {
        document.addEventListener('click', this.handleOutsideClick, { signal: this.abortController.signal });
        this.content.style.display = 'flex';
        this.isOpened = true;
        this.openCallback();
    }
    close = () => {
        document.removeEventListener('click', this.handleOutsideClick);
        this.content.style.display = 'none';
        this.isOpened = false;
        this.closeCallback();
    }
    toggle = () => {
        if (this.isOpened) {
            this.close();
        } else {
            this.open();
        }
    }
    bindEvents() {
        this.trigger.addEventListener('click', this.toggle, { signal: this.abortController.signal });
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('x-dropdown', Dropdown);