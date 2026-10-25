import sqlite3
import sys

pattern = sys.argv[1] if len(sys.argv) > 1 else '2019'
db_path = r'C:\Users\Antal\AppData\Local\Google\DriveFS\112594307878006789686\mirror_metadata_sqlite.db'
conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
cur = conn.cursor()
query = f"""
SELECT child.id, parent.local_title
FROM items child
JOIN stable_parents sp ON child.stable_id = sp.item_stable_id
JOIN items parent ON sp.parent_stable_id = parent.stable_id
WHERE child.local_title = 'protocol_cs.pdf' AND parent.local_title LIKE '%{pattern}%'
"""
cur.execute(query)
for r in cur.fetchall():
    print(r[0], r[1])
