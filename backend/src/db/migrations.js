import { db } from "./database.js";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS label_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      layout_json TEXT NOT NULL,
      fields_json TEXT NOT NULL,
      template_key TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_label_configs_updated
    AFTER UPDATE ON label_configs
    BEGIN
      UPDATE label_configs
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
  `);
}
