import sqlite3,json
c=sqlite3.connect('data-source/dictionary.db')
print(c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())
for word in ['sustainable','education','abandon','ability','the','research','environment']:
 print(word,c.execute('SELECT w.id,d.definition,d.pos,wd.example FROM words w JOIN word_definitions wd ON w.id=wd.word_id JOIN definitions d ON d.id=wd.definition_id WHERE w.word=? LIMIT 4',(word,)).fetchall())
 print(c.execute('SELECT p.ipa,p.region FROM words w JOIN pronunciations p ON p.word_id=w.id WHERE w.word=? LIMIT 4',(word,)).fetchall())
