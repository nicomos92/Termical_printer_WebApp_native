import { app } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./db/migrations.js";

runMigrations();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend iniciado en http://localhost:${env.port}`);
});
