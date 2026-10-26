import sqlite3

db_path = r'C:\Users\Antal\AppData\Local\Google\DriveFS\112594307878006789686\mirror_metadata_sqlite.db'
conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
cur = conn.cursor()
cur.execute("SELECT id, local_title FROM items WHERE local_title LIKE 'Catalog%'")
for r in cur.fetchall():
    print(r)

