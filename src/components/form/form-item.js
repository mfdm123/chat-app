export class FormItem extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: 'open' });
        this.abortController = null;

        this.configs = {
            text: [
                '.*',
                'Invalid input'
            ],
            //用户名正则，4到16位（字母，数字，下划线，减号）
            username: [
                '^[a-zA-Z0-9_-]{4,16}$',
                'Username must be 4-16 characters and can only contain letters, numbers, underscores, and hyphens.'
            ],
            //密码强度正则，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
            password: [
                String.raw`^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$`,
                'Password must be 15-20 characters and include uppercase, lowercase, numbers, and special characters.'
            ],
            //正整数正则
            positiveInteger: [
                String.raw`^\d+$`,
                'Invalid input'
            ],
            //负整数正则
            negativeInteger: [
                String.raw`^-\d+$`,
                'Invalid input'
            ],
            //整数正则
            integer: [
                String.raw`^-?\d+$`,
                'Invalid input'
            ],
            //正数正则
            positiveNumber: [
                String.raw`^\d*\.?\d+$`,
                'Invalid input'
            ],
            //负数正则
            negativeNumber: [
                String.raw`^-\d*\.?\d+$`,
                'Invalid input'
            ],
            //数字正则
            number: [
                String.raw`^-?\d*\.?\d+$`,
                'Invalid input'
            ],
            //Email正则
            email: [
                String.raw`^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$`,
                'Invalid input'
            ],
            //手机号正则
            phoneNumber: [
                String.raw`^1[34578]\d{9}$`,
                'Invalid input'
            ],
            //身份证号（18位）正则
            IDNumber: [
                String.raw`^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$`,
                'Invalid input'
            ],
            //URL正则
            URL: [
                String.raw`^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$`,
                'Invalid input'
            ],
            //ipv4地址正则
            IPv4: [
                String.raw`^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`,
                'Invalid input'
            ],
        };
        this.pattern = null;
        this.errorMessage = null;

        this.ifValid = null;
    }
    connectedCallback() {
        this.initConfig();

        this.renderStaticElements();
        this.cacheStaticElements();

        this.renderDynamicElements();

        this.bindEvents();

        // this.debug();
    }
    debug = () => {
        console.log(this.pattern, this.errorMessage);
    }

    initConfig() {
        this.type = this.getAttribute('type') || 'text';
        if (!this.configs[this.type]) {
            throw new Error('Invalid type.');
        }

        this.label = this.getAttribute('label') || this.type;
        this.placeholder = this.getAttribute('placeholder') || '';
        this.name = this.getAttribute('name') || this.type || this.label;
        this.defaultValue = this.getAttribute('default-value') || '';
        this.isDisabled = this.hasAttribute('disabled');

        //Config pattern.
        this.pattern = this.getAttribute('pattern') || this.configs[this.type][0];
        this.errorMessage = this.getAttribute('error-message') || this.configs[this.type][1];
        this.isRequired = this.hasAttribute('required');
        this.minlength = parseInt(this.getAttribute('minlength'));
        this.maxlength = parseInt(this.getAttribute('maxlength'));
    }

    renderStaticElements() {
        this.shadowRoot.innerHTML = `
            <div data-label-row>
                <label data-label>${this.label}</label>
            </div>
            <div data-message></div>

            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                }

                [data-label] {
                    font-size: 15px;
                }
                
                [data-message] {
                    min-height: 20px;
                    font-size: 13px;
                }

                input, textarea {
                    font-size: 16px;
                }
            </style>
        `;
    }
    cacheStaticElements() {
        this.labelRowEl = this.shadowRoot.querySelector('[data-label-row]');
        this.labelEl = this.shadowRoot.querySelector('[data-label]');
        this.messageEl = this.shadowRoot.querySelector('[data-message]');
    }

    renderDynamicElements() {
        if (this.isRequired) {
            const requiredMark = document.createElement('span');
            requiredMark.textContent = '*';
            requiredMark.style.color = 'red';
            this.labelRowEl.appendChild(requiredMark);
        }

        if (this.type !== 'textarea') {
            const inputEl = document.createElement('input');

            inputEl.type = this.type;
            inputEl.placeholder = this.placeholder;
            inputEl.name = this.name || this.type;
            inputEl.value = this.defaultValue;
            inputEl.disabled = this.isDisabled;
            inputEl.style.cssText = `
                height: 26px;
            `;

            this.inputEl = inputEl;
            this.shadowRoot.insertBefore(inputEl, this.messageEl);
        } else {
            const inputEl = document.createElement('textarea');
            
            inputEl.placeholder = this.placeholder;
            inputEl.name = this.name || this.type || this.label;
            inputEl.value = this.defaultValue;
            inputEl.disabled = this.isDisabled;

            this.inputEl = inputEl;
            this.shadowRoot.insertBefore(inputEl, this.messageEl);
        }
    }

    showValid = (message) => {
        this.messageEl.style.cssText = `
            color: green;
            display: flex;
            flex-direction: row;
            align-items: center;
            column-gap: 7px;
        `;
        this.messageEl.innerHTML = `
            <svg width='16px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
            </svg>
            <span>${message || ''}</span>
        `;
    }
    showError = (message) => {
        this.messageEl.style.color = 'red';
        this.messageEl.textContent = message || 'Invalid input.';
    }

    validate = () => {
        const content = this.inputEl.value;

        if (this.isRequired) {
            if (content.length === 0) {
                this.showError();
                this.ifValid = false;
                return false;
            }
        }

        if (this.minlength) {
            if (content.length < this.minlength) {
                this.showError();
                this.ifValid = false;
                return false;
            }
        }

        if (this.maxlength) {
            if (content.length > this.maxlength) {
                this.showError();
                this.ifValid = false;
                return false;
            }
        }

        if (!this.pattern) {
            this.showValid();
            this.ifValid = true;
            return true;
        } else {
            const regex = new RegExp(this.pattern);
            if (regex.test(content)) {
                this.showValid();
                this.ifValid = true;
                return true;
            } else {
                this.showError(this.errorMessage);
                this.ifValid = false;
                return false;
            }
        }
    }

    bindEvents() {
        this.abortController = new AbortController;

        this.inputEl.addEventListener('change', this.validate, { signal: this.abortController.signal });
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('form-item', FormItem);