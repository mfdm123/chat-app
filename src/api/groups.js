export async function fetchGroups() {
  const res = await fetch(`http://localhost:3000/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
  if (!res.ok) {
    return console.error((await res.json()).message);
  }
  const groupsData = await res.json();
  return groupsData;
};

export async function deleteGroup(groupId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/${groupId}`, {
    method: 'DELETE',
    headers: { 'Authorization': "Bearer " + token }
  });
  if (!res.ok) {
    return console.error((await res.json()).message);
  }
  console.log((await res.json()).message);
};