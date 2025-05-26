export async function getCurrentUser() {
  const res = await fetch('/users/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch current user');
  }

  return res.json();
}
