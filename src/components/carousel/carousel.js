export class Carousel extends HTMLElement {
    constructor() {
        super();
        
        this.abortController = new AbortController;

        this._width = null;
        this._index = 0;
        this._animation = null;
        this._timer = null;
        this._initialized = false;
    }

    connectedCallback() {
        // 防止重复初始化
        if (this._initialized) return;
        this._initialized = true;

        this.style.cssText = `
            position: relative;
            display: block;
            overflow-x: hidden;
        `;

        // 1. 先保存用户传入的元素（必须在 renderStaticElements 之前）
        const originalSlides = Array.from(this.children);

        this.initConfig();

        // 2. 渲染组件结构
        this.renderStaticElements();
        this.cacheStaticElements();

        // 3. 处理slides
        this.processSlides(originalSlides);

        this.cacheCarouselWidth();
        this.setResizeObserver();
        this.initCarouselPosition();
        this.startAutoSlide();
        this.bindEvents();
    }

    set width(value) {
        this._width = value;
        this.style.setProperty('--slide-width', value);
    }

    set index(value) {
        if (value < 1) {
            const targetX = -(parseFloat(this._width) * this.originalSlideCount);

            this._animation.onfinish = () => {
                this.slideContainerEl.animate(
                    [{ transform: `translateX(${targetX}px)` }],
                    { duration: 0, fill: 'forwards' }
                );
            };
            this._index = this.originalSlideCount;
        } else if (value > this.originalSlideCount) {
            const targetX = -parseFloat(this._width);

            this._animation.onfinish = () => {
                this.slideContainerEl.animate(
                    [{ transform: `translateX(${targetX}px)` }],
                    { duration: 0, fill: 'forwards' }
                );
            };
            this._index = 1;
        } else {
            this._index = value;
        }
    }

    initConfig() {
        this.interval = this.getAttribute('interval') || 6000;
        this.duration = this.getAttribute('duration') || 500;
    }

    renderStaticElements() {
        this.innerHTML = `
            <div class="carousel__slide-container"></div>
            <div class="carousel__mask"></div>
            <div class="carousel__slide-buttons">
                <button class="carousel__slide-left-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="carousel__size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button class="carousel__slide-right-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="carousel__size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            <style>
                .carousel__slide-container {
                    display: flex;
                    flex-direction: row;
                    height: 100%;
                    width: max-content;
                }
                .carousel__slide-container > * {
                    border: none;
                    width: var(--slide-width);
                    height: 100%;
                }

                .carousel__mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: var(--mask);
                    pointer-events: none;
                }

                .carousel__slide-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    align-content: center;
                    position: absolute;
                    width: 100%;
                    height: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    justify-content: space-between;
                }
                .carousel__slide-left-button,
                .carousel__slide-right-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    margin: 4%;
                    cursor: pointer;
                    border: none;
                    border-radius: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                }
                .carousel__slide-left-button svg,
                .carousel__slide-right-button svg {
                    width: 70%;
                    height: 70%;
                    stroke: #e7e7e7;
                }
            </style>
        `;
    }

    cacheStaticElements() {
        this.slideContainerEl = this.querySelector('.carousel__slide-container');
        this.slideLeftButtonEl = this.querySelector('.carousel__slide-left-button');
        this.slideRightButtonEl = this.querySelector('.carousel__slide-right-button');
    }

    // 接收保存的slides作为参数
    processSlides(originalSlides) {
        this.originalSlideCount = originalSlides.length;

        const startClone = originalSlides[originalSlides.length - 1].cloneNode(true);
        startClone.style.setProperty('position', 'relative');
        const endClone = originalSlides[0].cloneNode(true);
        endClone.style.setProperty('position', 'relative');

        this.slideContainerEl.appendChild(startClone);
        originalSlides.forEach(slide => {
            slide.style.setProperty('position', 'relative');
            this.slideContainerEl.appendChild(slide);
        });
        this.slideContainerEl.appendChild(endClone);

        this.slides = this.slideContainerEl.querySelectorAll(':scope > *');
    }

    cacheCarouselWidth() {
        this.width = this.offsetWidth + 'px';
    }

    handleSlideLeftButtonClick = () => {
        this.slideLeft();
        this.resetAutoSlide();
    }
    handleSlideRightButtonClick = () => {
        this.slideRight();
        this.resetAutoSlide();
    }
    bindEvents() {
        this.slideLeftButtonEl.addEventListener('click', this.handleSlideLeftButtonClick, { signal: this.abortController.signal });
        this.slideRightButtonEl.addEventListener('click', this.handleSlideRightButtonClick, { signal: this.abortController.signal });

        this.addEventListener('mouseenter', this.stopAutoSlide, { signal: this.abortController.signal });
        this.addEventListener('mouseleave', this.startAutoSlide, { signal: this.abortController.signal });
    }

    setResizeObserver() {
        this._resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const newWidth = entry.contentRect.width + 'px';
                const targetX = -(parseFloat(newWidth) * this._index);

                this.width = newWidth;

                this._animation = this.slideContainerEl.animate(
                    [{ transform: `translateX(${targetX}px)` }],
                    { duration: 0, fill: 'forwards' }
                );
            }
        });
        this._resizeObserver.observe(this);
    }

    initCarouselPosition() {
        this.slideContainerEl.style.transition = 'none';
        this.slideContainerEl.style.transform = `translateX(-${this._width})`;
        this.slideContainerEl.style.transition = 'transform';

        this._index = 1;
    }

    slideTo = (index, duration = 500) => {
        if (this._animation?.playState !== 'running') {
            const currentX = -(parseFloat(this._width) * this._index);
            const targetX = -(parseFloat(this._width) * index);

            this._animation = this.slideContainerEl.animate(
                [
                    { transform: `translateX(${currentX}px)` },
                    { transform: `translateX(${targetX}px)` }
                ],
                { duration: duration, easing: 'ease', fill: 'forwards' }
            );

            this.index = index;
        }
    }

    slideLeft = () => {
        if (this._animation?.playState !== 'running') {
            this.slideTo(this._index - 1, this.duration);
        }
    }
    slideRight = () => {
        if (this._animation?.playState !== 'running') {
            this.slideTo(this._index + 1, this.duration);
        }
    }

    startAutoSlide = () => {
        if (!this._timer) {
            this._timer = setInterval(() => {
                this.slideRight();
            }, this.interval);
        }
    }

    stopAutoSlide = () => {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    resetAutoSlide = () => {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    disconnectedCallback() {
        this.abortController.abort();
        this._resizeObserver.disconnect();
        this.stopAutoSlide();
    }
}

customElements.define('x-carousel', Carousel);