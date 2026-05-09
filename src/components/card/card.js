import '../cover/cover.js';

export class Card extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: 'open' });
        this.abortController = new AbortController;
    }
    connectedCallback() {
        this.initConfig();

        this.defineStaticElements();
        this.cacheStaticElements();
    }

    initConfig = () => {
        this.href = this.getAttribute('href');
        this.src = this.getAttribute('src');
    }

    defineStaticElements = () => {
        this.shadowRoot.innerHTML = `
            <a href='${this.href}'>
                <x-cover data-background src='${this.src}'></x-cover>
                <div data-mask part='mask'>
                    <fieldset data-content part='content'>
                        <slot name='title' part='title'></slot>
                        <div part='paragraph'><slot></slot></div>
                    </fieldset>
                </div>
            </a>
            
            <style>
                :host {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                a {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                }

                [data-background] {
                    width: 100%;
                    height: 100%;
                }
                
                [data-mask] {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 35%;
                    background-color: rgba(0, 0, 0, 0.6);
                }
                [data-content] {
                    border: none;
                }
                ::slotted(*) {
                    color: white;
                }

                ::slotted([slot='title']) {
                    font-size: 19px;
                    font-weight: 500;
                }
            </style>
        `;
    }
    cacheStaticElements = () => {
        this.backgroundEl = this.shadowRoot.querySelector('[data-background]');
    }


    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('x-card', Card);