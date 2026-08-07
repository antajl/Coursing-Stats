const db = require('better-sqlite3')('D:/Site/CoursingStats/data/coursing-stats.db');
const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
console.log(stmt.all());
db.close();
