async function register(username, password) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function login(username, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function bookFlight(username, flight) {
  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, flight })
  });
  return res.json();
}

async function getLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();
  return data.leaderboard;
}

async function getHistory(username) {
  const res = await fetch(`/api/history/${username}`);
  const data = await res.json();
  return data.bookings;
}
