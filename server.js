const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, "db.json");
const CONFIG_FILE = path.join(__dirname, "config.json");

let config = fs.readJsonSync(CONFIG_FILE);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ======= Вспомогательные функции =======
function loadDB() {
  return fs.readJsonSync(DB_FILE);
}

function saveDB(db) {
  fs.writeJsonSync(DB_FILE, db, { spaces: 2 });
}

function sendDiscordNotification(message) {
  if (!config.WEBHOOK_URL || config.WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_URL_HERE") return;
  axios.post(config.WEBHOOK_URL, { content: message }).catch(console.log);
}

function calculateLevel(points) {
  if (points >= 1000) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 100) return "Silver";
  return "Bronze";
}

// ======= API =======

// Регистрация
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  if (db.users.find(u => u.username === username)) {
    return res.json({ success: false, message: "Пользователь уже существует" });
  }
  const newUser = { username, password, points: 0, level: "Bronze", bookings: [] };
  db.users.push(newUser);
  saveDB(db);
  res.json({ success: true });
});

// Вход
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (!user) return res.json({ success: false, message: "Неверный логин или пароль" });
  res.json({ success: true, user });
});

// Поиск рейсов (заглушка)
app.get("/api/flights", (req, res) => {
  const db = loadDB();
  res.json({ flights: db.flights });
});

// Бронирование рейса
app.post("/api/book", (req, res) => {
  const { username, flight } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.json({ success: false, message: "Пользователь не найден" });

  const pointsEarned = Math.floor(Math.random() * 200) + 50;
  user.points += pointsEarned;
  user.level = calculateLevel(user.points);

  const booking = { username, flight, points: pointsEarned, date: new Date().toISOString() };
  db.bookings.push(booking);
  user.bookings.push(booking);

  saveDB(db);

  sendDiscordNotification(`${username} забронировал рейс ${flight} и получил ${pointsEarned} баллов!`);

  res.json({ success: true, pointsEarned, level: user.level });
});

// Таблица лидеров
app.get("/api/leaderboard", (req, res) => {
  const db = loadDB();
  const leaderboard = [...db.users].sort((a, b) => b.points - a.points).slice(0, 10);
  res.json({ leaderboard });
});

// История полётов пользователя
app.get("/api/history/:username", (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.username === req.params.username);
  if (!user) return res.json({ success: false, message: "Пользователь не найден" });
  res.json({ bookings: user.bookings });
});

// ======= Запуск сервера =======
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
