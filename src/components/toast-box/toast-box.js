export class ToastBox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.style.cssText = `
            display: block;
            position: fixed;
            pointer-events: none;
        `;
        this.initConfig();
        this.renderStaticElements();
        this.cacheStaticElements();
    }
    initConfig() {
        this.interval = this.getAttribute('interval') || 2000;
    }
    renderStaticElements() {
        this.innerHTML = `
            <div class='toast-box__toasts-container'></div>

            <style>
                .toast-box__toasts-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
            </style>
        `;
    }
    cacheStaticElements() {
        this.toastsContainerEl = this.querySelector('& > .toast-box__toasts-container');
    }
    show = (content) => {
        const newToast = document.createElement('div');
        newToast.classList.add('toast-box__toast');
        newToast.innerHTML = content;
        newToast.style.cssText = `
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            background-color: white;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            opacity: 1;
        `;
        this.toastsContainerEl.appendChild(newToast);
        //appear.
        newToast.offsetHeight;
        newToast.animate(
            [
                {
                    transform: 'translateY(-60px)',
                    opacity: '0'
                },
                {
                    transform: 'none',
                    opacity: '1'
                }
            ],
            { duration: 300, easing: 'ease-in', fill: 'forwards' }
        );

        setTimeout(() => {
            //disapear.
            newToast.offsetHeight;
            const disappearAnimation = newToast.animate(
                [
                    {
                        transform: 'none',
                        opacity: '1'
                    },
                    {
                        transform: 'translateY(60px)',
                        opacity: '0'
                    }
                ],
                { duration: 300, easing: 'ease-in', fill: 'forwards' }
            );

            //Clear the element.
            disappearAnimation.onfinish = () => {
                newToast.remove();
            }
        }, this.interval);
    }
}

customElements.define('toast-box', ToastBox);