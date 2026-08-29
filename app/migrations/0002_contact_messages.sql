CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  lang TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
