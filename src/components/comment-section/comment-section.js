import { baseUrl, userId, postComment, getComments, reactToComment, deleteComment, editComment, cancelReactionToComment, updateReactionToComment } from '../api/comments.js';
import '../comment/comment.js';
import '../content-form/comment-form.js';

class CommentSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.abortController = new AbortController;

        this.initialComments = new Map;
        this.replyTree = new Map;
        this.commentEls = new Map;
    }
    async connectedCallback() {
        this.initConfig();
        await this.loadComments();
        this.defineInner();
        this.cacheElements();
        this.buildReplyTree();
        this.renderCommentsElements('root');
        this.bindEvents();
    }

    initConfig() {
        this.baseUrl = baseUrl;
        this.currentUserId = userId;
    }

    defineInner() {
        this.shadowRoot.innerHTML = `
            <comment-form>
                <button slot='submit-button'>post</button>
            </comment-form>
            <div data-comment-list>
            </div>
        `;
    }
    cacheElements() {
        this.commentListEl = this.shadowRoot.querySelector('[data-comment-list]');
    }

    async loadComments() {
        const comments = await getComments(this.baseUrl, this.currentUserId);
        comments.forEach((comment) => {
            this.initialComments.set(comment.id, comment);
        });
    }

    buildReplyTree = () => {
        this.initialComments.forEach((comment, commentId) => {
            const replyTo = comment.reply_to;
            if (!replyTo) {
                if (!this.replyTree.has('root')) {
                    this.replyTree.set('root', []);
                }
                this.replyTree.get('root').push(commentId);
            } else {
                if (!this.replyTree.has(replyTo)) {
                    this.replyTree.set(replyTo, []);
                }
                this.replyTree.get(replyTo).push(commentId);
            }
        });
    }

    renderCommentsElements = (commentId) => {
        const repliesIds = this.replyTree.get(commentId);
        if (!repliesIds) {
            return;
        }
        repliesIds.forEach((replyId) => {
            const reply = this.initialComments.get(replyId);
            const replyTo = reply.reply_to;
            const replyEl = this.createCommentElement(reply);
            const repliedComment = this.commentEls.get(replyTo);
            if (!replyTo) {
                this.commentListEl.appendChild(replyEl);
            } else {
                repliedComment.replyListEl.appendChild(replyEl);
            }
            this.renderCommentsElements(replyId);
        });
    }

    createCommentElement = (comment) => {
        const commentEl = document.createElement('x-comment');
        commentEl.data = {
            isAuthor: (comment.user_id === this.currentUserId),
            id: comment.id,
            replyTo: comment.reply_to,
            avatarImageUrl: 'url1',
            authorUsername: comment.username,
            time: comment.time,
            content: comment.content,
            likesCount: comment.likes_count,
            userReaction: comment.user_reaction
        };
        this.commentEls.set(comment.id, commentEl);
        return commentEl;
    }

    createNewCommentElement = (newComment) => {
        const replyTo = newComment.reply_to;

        const commentEl = this.createCommentElement(newComment);
        if (!replyTo) {
            this.commentListEl.appendChild(commentEl);
        } else {
            const repliedComment = this.commentEls.get(replyTo);
            repliedComment.replyListEl.appendChild(commentEl);
        }
    }

    handlePostCommentEvent = async (e) => {
        const commentForm = e.composedPath()[0];
        const detail = e.detail;
        const content = detail.content;
        const replyTo = detail.replyTo;

        const result = await postComment(this.baseUrl, this.currentUserId, content, replyTo);
        if (!result.error) {
            commentForm.clearInput();
            this.createNewCommentElement(result);
        } else {
            console.error('Failed to post comment.');
        }
    }

    handleDeleteEvent = async (e) => {
        const commentEl = e.composedPath()[0];
        const detail = e.detail;
        const commentId = detail.commentId;

        const result = await deleteComment(this.baseUrl, this.currentUserId, commentId);
        if (result?.success) {
            commentEl.remove();
        } else {
            console.error('Failed to delete the comment.');
        }
    }

    handleEditEvent = async (e) => {
        const commentEl = e.composedPath()[0];
        const detail = e.detail;
        const commentId = detail.commentId;
        const newContent = detail.newContent;

        const result = await editComment(this.baseUrl, this.currentUserId, commentId, newContent);
        if (result?.success) {
            commentEl.editDone();
        } else {
            console.error('Failed to edit the comment.');
        }
    }

    handleReactEvent = async (e) => {
        const commentEl = e.composedPath()[0];
        const detail = e.detail;
        const value = detail.value;
        const commentId = detail.commentId;

        const result = await reactToComment(this.baseUrl, this.currentUserId, commentId, value);
        if (result?.success) {
            commentEl.reactDone();
        } else {
            console.error('Failed to react to the comment.');
        }
    }

    handleUpdateReactionEvent = async (e) => {
        const commentEl = e.composedPath()[0];
        const detail = e.detail;
        const value = detail.value;
        const commentId = detail.commentId;
    
        const result = await updateReactionToComment(this.baseUrl, this.currentUserId, commentId, value);
        if (result?.success) {
            commentEl.updateReactionDone();
        } else {
            console.error('Failed to update Reaction to the comment.');
        }
    }

    handleCancelReactionEvent = async (e) => {
        const commentEl = e.composedPath()[0];
        const detail = e.detail;
        const commentId = detail.commentId;
        
        const result = await cancelReactionToComment(this.baseUrl, this.currentUserId, commentId);
        if (result?.success) {
            commentEl.cancelReactionDone();
        } else {
            console.error('Failed to cancel reaction to the comment.');
        }
    }

    bindEvents = () => {
        this.addEventListener('comment-form:post-comment', this.handlePostCommentEvent, { signal: this.abortController.signal });

        this.addEventListener('x-comment:edit', this.handleEditEvent, { signal: this.abortController.signal });
        this.addEventListener('x-comment:delete', this.handleDeleteEvent, { signal: this.abortController.signal });

        this.addEventListener('x-comment:react', this.handleReactEvent, { signal: this.abortController.signal });
        this.addEventListener('x-comment:update-reaction', this.handleUpdateReactionEvent, { signal: this.abortController.signal });
        this.addEventListener('x-comment:cancel-reaction', this.handleCancelReactionEvent, { signal: this.abortController.signal });
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define('comment-section', CommentSection);