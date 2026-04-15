require("dotenv").config({ path: require("path").join(__dirname, ".env"), override: true });
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(__dirname, process.env.DATABASE_PATH)
  : path.join(__dirname, "..", "ackerman-tools.db");
const db = new sqlite3.Database(DB_PATH);

db.all("SELECT id, username, created_at FROM users ORDER BY created_at DESC", (err, users) => {
  if (err) return console.error("users error:", err);
  console.log(`\n=== USERS (${users.length} total) ===`);
  console.table(users);

  db.all("SELECT u.username, p.app_id, p.provider, p.status, p.created_at FROM purchases p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC", (err2, purchases) => {
    if (err2) return console.error("purchases error:", err2);
    console.log(`\n=== PURCHASES (${purchases.length} total) ===`);
    console.table(purchases);
    db.close();
  });
});
