import API_BASE from "../config";

export async function fetchUserDataByToken(token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  const result = await res.json();
  const { user } = result;
  return user;
}