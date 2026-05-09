import '../dropdown/auto-close-dropdown.js';
import '../dropdown/static-dropdown.js';
import '../content-form/comment-form.js';

const testData = {
    isAuthor: true,
    id: 'id1',
    replyTo: 'id2',
    avatarImageUrl: 'url1',
    authorUsername: 'uid1',
    time: 'XXXX/XX/XX',
    likesCount: 0,
    userReaction: null
};

export class Comment extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.abortController = new AbortController;

        this.data = {};
        this.replies = new Map;
    }
    connectedCallback() {
        this.initConfig();
        this.defineInner();
        this.cacheElements();
        this.renderActionsElements();
        this.renderReactionsElements();
        this.bindEvents();
}

    initConfig = () => {
        this.isAuthor = this.data.isAuthor;
        this.id = this.data.id;
        this.replyTo = this.data.replyTo;
        this.avatarImageUrl = this.data.avatarImageUrl;
        this.authorUsername = this.data.authorUsername;
        this.time = this.data.time;
        this.content = this.data.content;
        this._likesCount = this.data.likesCount;
        this._userReaction = this.data.userReaction;
    }
    set likesCount(value) {
        this._likesCount = value;
        this.likesCountEl.textContent = value && (value > 0) ? `${value}` : '';
    }
    set userReaction(value) {
        this._userReaction = value;
        this.renderReactionsElements();
    }

    defineInner = () => {
        this.shadowRoot.innerHTML = `
            <div data-comment>
                <button data-avatar part='avatar'>
                    <img data-avatar-image sr*c=${this.avatarImageSrc}>
                </button>
                <div data-main>
                    <div data-header>
                        <span data-username>${this.authorUsername}</span>
                        <span data-time>${this.time}</span>
                    </div>
                    <div data-content>${this.content}</div>
                    <div data-edit-form>
                        <textarea data-edit-input></textarea>
                        <div data-buttons>
                            <button data-cancel-edit-button>cancel</button>
                            <button data-save-edit-button>save</button>
                        </div>
                    </div>
                    <div data-footer>
                        <div>
                            <button data-like-button>like</button>
                            <span data-likes-count>${this._likesCount && (this._likesCount > 0) ? `${this._likesCount}` : ''}</span>
                        </div>
                        <button data-dislike-button>dislike</button>
                        <button data-reply-button>reply</button>
                    </div>
                    <auto-close-dropdown data-options>
                        <button slot='trigger'>X</button>
                        <div data-actions></div>
                    </auto-close-dropdown>
                </div>
            </div>
            <comment-form data-reply-form reply-to="${this.id}">
                <button slot='button' data-cancel-reply-button>cancel</button>
                <button slot='submit-button'>reply</button>
            </comment-form>
            <static-dropdown data-reply-area>
                <button slot='trigger' data-reply-area-trigger>unfold</button>
                <div data-indentation-mark>|</div>
                <div data-reply-list></div>
            </static-dropdown>

            <style>
                :host {
                    display: grid;
                    [data-edit-form] {
                        display: none;
                    }
                    [data-reply-form] {
                        display: none;
                    }
                }
                :host([data-edit-mode]) {
                    [data-edit-form] {
                        display: block;
                    }
                    [data-header], 
                    [data-content], 
                    [data-footer],
                    [data-options] {
                        display: none;
                    }
                }
                :host([data-reply-mode]) {
                    [data-reply-form] {
                        display: block;
                    }
                    [data-reply-button] {
                        display: none;
                    }
                }

                [data-reply-area]::part(content) {
                    position: static;
                }
            </style>
        `;
    }

    cacheElements = () => {
        this.mainEl = this.shadowRoot.querySelector('[data-main]');
        this.contentEl = this.shadowRoot.querySelector('[data-content]');

        this.editInputEl = this.shadowRoot.querySelector('[data-edit-input]');
        this.cancelEditButtonEl = this.shadowRoot.querySelector('[data-cancel-edit-button]');
        this.saveEditButtonEl = this.shadowRoot.querySelector('[data-save-edit-button]');

        this.likesCountEl = this.shadowRoot.querySelector('[data-likes-count]');
        this.likeButtonEl = this.shadowRoot.querySelector('[data-like-button]');
        this.dislikeButtonEl = this.shadowRoot.querySelector('[data-dislike-button]');

        this.replyButtonEl = this.shadowRoot.querySelector('[data-reply-button]');
        this.replyFormEl = this.shadowRoot.querySelector('[data-reply-form]');
        this.cancelReplyButtonEl = this.shadowRoot.querySelector('[data-cancel-reply-button]');
        this.replyAreaEl = this.shadowRoot.querySelector('[data-reply-area]');
        this.replyAreaTriggerEl = this.shadowRoot.querySelector('[data-reply-area-trigger]');
        this.replyListEl = this.shadowRoot.querySelector('[data-reply-list]');

        this.actionsEl = this.shadowRoot.querySelector('[data-actions]');
        this.likeButtonEl = this.shadowRoot.querySelector('[data-like-button]');
        this.dislikeButtonEl = this.shadowRoot.querySelector('[data-dislike-button]');

        this.replyAreaEl.openCallback = () => { this.replyAreaTriggerEl.innerHTML = 'fold' };
        this.replyAreaEl.closeCallback = () => { this.replyAreaTriggerEl.innerHTML = 'unfold' };
    }

    renderActionsElements = () => {
        if (this.isAuthor) {
            this.actionsEl.innerHTML = `
                <button data-edit-button>edit</button>
                <button data-delete-button>delete</button>
            `;
            this.editButtonEl = this.actionsEl.querySelector('[data-edit-button]');
            this.deleteButtonEl = this.actionsEl.querySelector('[data-delete-button]');
        } else {
            this.actionsEl.innerHTML = `
                <button data-report-button>report</button>
            `;
            this.reportButtonEl = this.actionsEl.querySelector('[data-report-button]');
        }
    }

    renderReactionsElements = () => {
        if (this._userReaction === 1) {
            this.likeButtonEl.innerHTML = `liked`;
            this.dislikeButtonEl.innerHTML = `dislike`;
        } else if (this._userReaction === -1) {
            this.likeButtonEl.innerHTML = `like`;
            this.dislikeButtonEl.innerHTML = `disliked`;
        } else {
            this.likeButtonEl.innerHTML = `like`;
            this.dislikeButtonEl.innerHTML = `dislike`;
        }
    }

    editModeOn = () => {
        this.replyModeOff();
        this.editInputEl.value = this.contentEl.textContent;
        this.toggleAttribute('data-edit-mode', true);
    }
    editModeOff = () => {
        this.toggleAttribute('data-edit-mode', false);
    }
    editModeToggle = () => {
        if (this.hasAttribute('data-edit-mode')) {
            this.editModeOff();
        } else {
            this.editModeOn();
        }
    }

    replyModeOn = () => {
        this.toggleAttribute('data-reply-mode', true);
    }
    replyModeOff = () => {
        this.toggleAttribute('data-reply-mode', false);
    }
    replyModeToggle = () => {
        if (this.hasAttribute('data-reply-mode')) {
            this.replyModeOff();
        } else {
            this.replyModeOn();
        }
    }

    report = () => {}

    edit = () => {
        const newContent = this.editInputEl.value;

        if (newContent === this.contentEl.textContent) {
            return console.log('Nothing changed.');
        } else if (newContent === '') {
            return console.error('Content cannot be empty.');
        }

        this.newContent = newContent;
        this.dispatchEvent(new CustomEvent('x-comment:edit', {
            detail: { 
                newContent: newContent,
                commentId: this.id
            },
            bubbles: true,
            composed: true
        }));
    }
    editDone = () => {
        this.contentEl.textContent = this.newContent;
        this.editModeOff();
    }

    delete = () => {
        this.dispatchEvent(new CustomEvent('x-comment:delete', {
            detail: {
                commentId: this.id
            },
            bubbles: true,
            composed: true
        }));
    }

    react = (value) => {
        this.reactValue = value;
        this.dispatchEvent(new CustomEvent('x-comment:react', {
            detail: {
                commentId: this.id,
                value: value
            },
            bubbles: true,
            composed: true
        }));
    }
    reactDone = () => {
        const value = this.reactValue;
        if (value === 1) {
            this.userReaction = 1;
            this.likeButtonEl.textContent = 'liked';
            this.likesCount = this._likesCount + 1;
        } else if (value === -1) {
            this.userReaction = -1;
            this.dislikeButtonEl.textContent = 'disliked';
        }
    }

    updateReaction = (value) => {
        this.reactValue = value;
        this.dispatchEvent(new CustomEvent('x-comment:update-reaction', {
            detail: {
                commentId: this.id,
                value: value
            },
            bubbles: true,
            composed: true
        }));
    }
    updateReactionDone = () => {
        const value = this.reactValue;
        if (value === 1) {
            this.userReaction = 1;
            this.likesCount = this._likesCount + 1;
        } else if (value === -1) {
            this.userReaction = -1;
            this.likesCount = this._likesCount - 1;
        }
    }

    cancelReaction = () => {
        this.dispatchEvent(new CustomEvent('x-comment:cancel-reaction', {
            detail: {
                commentId: this.id
            },
            bubbles: true,
            composed: true
        }));
    }
    cancelReactionDone = () => {
        if (this._userReaction === 1) {
            this.likesCount = this._likesCount - 1;
        }
        this.userReaction = null;
    }

    handleLikeButtonClick = () => {
        if (!this._userReaction) {
            this.react(1);
        } else if (this._userReaction === 1) {
            this.cancelReaction();
        } else if (this._userReaction === -1) {
            this.updateReaction(1);
        }
    }
    handleDislikeButtonClick = () => {
        if (!this._userReaction) {
            this.react(-1);
        } else if (this._userReaction === -1) {
            this.cancelReaction();
        } else if (this._userReaction === 1) {
            this.updateReaction(-1);
        }
    }

    bindEvents() {
        if (this.isAuthor) {
            this.editButtonEl.addEventListener('click', this.editModeOn, { signal: this.abortController.signal });
        }
        this.saveEditButtonEl.addEventListener('click', this.edit, { signal: this.abortController.signal });
        this.cancelEditButtonEl.addEventListener('click', this.editModeOff, { signal: this.abortController.signal });

        this.deleteButtonEl.addEventListener('click', this.delete, { signal: this.abortController.signal });

        this.likeButtonEl.addEventListener('click', this.handleLikeButtonClick, { signal: this.abortController.signal });
        this.dislikeButtonEl.addEventListener('click', this.handleDislikeButtonClick, { signal: this.abortController.signal });

        this.replyButtonEl.addEventListener('click', this.replyModeOn, { signal: this.abortController.signal });
        this.cancelReplyButtonEl.addEventListener('click', this.replyModeOff, { signal: this.abortController.signal });
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('x-comment', Comment);