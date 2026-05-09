//App's socket.
import { socket } from "../App";

export async function fetchMessages(groupId) {
  const res = await fetch(`http://localhost:3000/${groupId}/messages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  if (!res.ok) {
    return console.error((await res.json()).message);
  }

  const fetchedMessagesData = await res.json();
  return fetchedMessagesData;
};

export function sendMessage(groupId, content) {
  socket.emit('message', {
    groupId,
    content
  });
}