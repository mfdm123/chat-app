// export class Cover extends HTMLElement {
//     constructor() {
//         super();
        
//         this.attachShadow({ mode: 'open' });
//         this.abortController = new AbortController;

//         this._resizeObserver = null;
//     }
//     connectedCallback() {
//         this.initConfig();

//         this.renderStaticElements();
//         this.cacheStaticElements();

//         this.applyCoverEffect();

//         this.setupResizeObserver();
//     }

//     initConfig = () => {
//         this.src = this.getAttribute('src');
//     }

//     renderStaticElements() {
//         this.shadowRoot.innerHTML = `
//             <div data-container>
//                 <img src='${this.src}'>
//             </div>
//             <div data-content part='content'>
//                 <slot></slot>
//             </div>

//             <style>
//                 :host {
//                     display: block;
//                     position: relative;
//                 }
//                 [data-container] {
//                     position: absolute;
//                     display: flex;
//                     overflow: hidden;
//                     width: 100%;
//                     height: 100%;
//                     align-items: center;
//                     justify-content: center;
//                 }
//                 [data-content] {
//                     position: absolute;
//                     width: 100%;
//                     height: 100%;
//                     background-color: transparent;
//                 }
//             </style>
//         `;
//     }

//     cacheStaticElements = () => {
//         this.containerEl = this.shadowRoot.querySelector('[data-container]');
//         this.imgEl = this.shadowRoot.querySelector('img');

//         if (this.imgEl.complete) {
//             this.applyCoverEffect();
//         } else {
//             this.imgEl.onload = () => {
//                 this.applyCoverEffect();
//             };
//         }
//     }

//     applyCoverEffect = () => {
//         const img = this.imgEl;
//         const container = this.containerEl;
        
//         const imgRatio = img.naturalWidth / img.naturalHeight;
//         const containerRatio = container.clientWidth / container.clientHeight;
        
//         if (imgRatio >= containerRatio) {
//             this.containerEl.style.flexDirection = 'column';
//             img.style.width = 'auto';
//             img.style.height = '100%';
//         } else {
//             this.containerEl.style.flexDirection = 'row';
//             img.style.width = '100%';
//             img.style.height = 'auto';
//         }
//     }

//     setupResizeObserver = () => {
//         this._resizeObserver = new ResizeObserver(() => {
//             this.applyCoverEffect();
//         });
//         this._resizeObserver.observe(this);
//     }
//     disconnectedCallback() {
//         this.abortController.abort();
//         this._resizeObserver.disconnect();
//     }
// }

// customElements.define('x-cover', Cover);

export class Cover extends HTMLElement {
    constructor() {
        super();
        
        this.abortController = new AbortController;
        this._resizeObserver = null;
        this._initialized = false;
    }

    connectedCallback() {
        if (this._initialized) return;
        this._initialized = true;

        this.style.cssText = `
            display: block;
            position: relative;
        `;
        
        const content = Array.from(this.children);

        this.initConfig();

        this.renderStaticElements();
        this.cacheStaticElements();

        this.appendContent(content);

        this.applyCoverEffect();
        this.setupResizeObserver();
    }

    initConfig() {
        this.src = this.getAttribute('src');
    }

    renderStaticElements() {
        this.innerHTML = `
            <div class="cover__container">
                <img src="${this.src}">
            </div>
            <div class="cover__content"></div>

            <style>
                .cover__container {
                    position: absolute;
                    display: flex;
                    overflow: hidden;
                    width: 100%;
                    height: 100%;
                    align-items: center;
                    justify-content: center;
                }
                .cover__content {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                }
            </style>
        `;
    }

    cacheStaticElements() {
        this.containerEl = this.querySelector('.cover__container');
        this.contentEl = this.querySelector('.cover__content');
        this.imgEl = this.containerEl.querySelector('img');

        if (this.imgEl.complete) {
            this.applyCoverEffect();
        } else {
            this.imgEl.onload = () => {
                this.applyCoverEffect();
            };
        }
    }

    appendContent = (content) => {
        content.forEach(el => {
            this.contentEl.appendChild(el);
        });
    }

    applyCoverEffect = () => {
        const img = this.imgEl;
        const container = this.containerEl;
        
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = container.clientWidth / container.clientHeight;
        
        if (imgRatio >= containerRatio) {
            container.style.flexDirection = 'column';
            img.style.width = 'auto';
            img.style.height = '100%';
        } else {
            container.style.flexDirection = 'row';
            img.style.width = '100%';
            img.style.height = 'auto';
        }
    }

    setupResizeObserver() {
        this._resizeObserver = new ResizeObserver(() => {
            this.applyCoverEffect();
        });
        this._resizeObserver.observe(this);
    }

    disconnectedCallback() {
        this.abortController.abort();
        this._resizeObserver.disconnect();
    }
}

customElements.define('x-cover', Cover);