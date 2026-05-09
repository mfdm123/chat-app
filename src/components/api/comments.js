export const baseUrl = 'http://localhost:3000';
const user = JSON.parse(localStorage.getItem('user'));
export const userId = user.id;

export async function getComments(baseUrl, userId) {
    const res = await fetch(baseUrl + `/api/comments?userId=${userId}`);
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function postComment(baseUrl, userId, content, replyTo) {
    const res = await fetch(baseUrl + '/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({
            userId: userId,
            content: content,
            replyTo: replyTo || null
        })
    });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function editComment(baseUrl, userId, commentId, content) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: content,
            userId: userId
        })
    });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function deleteComment(baseUrl, userId, commentId) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}?userId=${userId}`, { method: 'DELETE' });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}


export async function getReactionsDataOfComment(baseUrl, userId, commentId) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}/reactions?userId=${userId}`);
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function reactToComment(baseUrl, userId, commentId, value) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            value: value,
            userId: userId
        })
    });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function updateReactionToComment(baseUrl, userId, commentId, value) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}/reactions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            value: value,
            userId: userId
        })
    });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}

export async function cancelReactionToComment(baseUrl, userId, commentId) {
    const res = await fetch(baseUrl + `/api/comments/${commentId}/reactions?userId=${userId}`, {
        method: 'DELETE'
    });
    if (!res.ok) {
        return console.error((await res.json()).error);
    }
    return await res.json();
}