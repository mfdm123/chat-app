import { ContentForm } from './content-form.js';

export class CommentForm extends ContentForm {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
        this.replyTo = this.getAttribute('reply-to');
        this.userId = this.getAttribute('user-id');
    }
    clearInput() {
        this.contentInput.value = '';
    }
    submit = async () => {
        this.dispatchEvent(new CustomEvent('comment-form:post-comment', {
            detail: {
                content: this.contentInput.value,
                replyTo: this.replyTo,
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('comment-form', CommentForm);