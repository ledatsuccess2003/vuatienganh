"""Import the user's book, preserving chapter, printed order and supplemental entries.
Usage: python scripts/import-ebook.py path/to/book.pdf
Requires pypdf. IPA sources already used by this project's main dictionary.
"""
import collections, hashlib, json, pathlib, re, sys, unicodedata
from pypdf import PdfReader

ROOT = pathlib.Path(__file__).resolve().parents[1]
TOPICS = ['ENVIRONMENT','ENERGY','EDUCATION','WORK','HEALTH','CRIME','TECHNOLOGY','GOVERNMENT SPENDING','TRANSPORTATION','CITY LIFE','FAMILY & CHILDREN','LANGUAGES','ANIMALS','MEDIA AND ADVERTISING','FOOD AND DIET']
VI = ['Môi trường','Năng lượng','Giáo dục','Công việc','Sức khỏe','Tội phạm','Công nghệ','Chi tiêu chính phủ','Giao thông','Cuộc sống thành thị','Gia đình & trẻ em','Ngôn ngữ','Động vật','Truyền thông & quảng cáo','Thực phẩm & chế độ ăn']
def vietnamese(s):
    return bool(re.search('[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]',s.lower()))
def clean(s):
    return re.sub(r'\s+',' ',s).strip()

source=pathlib.Path(sys.argv[1]); reader=PdfReader(source)
blocks=[]; chapters=[]; current=None; active=False; chapter=None
for page, p in enumerate(reader.pages,1):
    for raw in p.extract_text().splitlines():
        line=clean(raw)
        if not line or line.isdigit(): continue
        if line in TOPICS:
            active=True; chapter=TOPICS.index(line)+1
            chapters.append(dict(id=chapter,name=VI[chapter-1],title=line,page=page))
            continue
        if line.startswith('BÀI TẬP'): active=False
        if not active: continue
        match=re.match(r'^(\d+)\.\s*(.*)',line)
        if match:
            current=dict(chapter=chapter,number=int(match[1]),page=page,lines=[])
            blocks.append(current); line=match[2]
        if current: current['lines'].append((page,line))

words=[]; errors=[]
for b in blocks:
    lines=b['lines']; k=0; header=lines[k][1]
    while ':' not in header:
        k+=1; header+=' '+lines[k][1]
    word,meaning=header.split(':',1); k+=1
    while k<len(lines) and vietnamese(lines[k][1]) and lines[k][1]!='Từ vựng học thêm':
        meaning+=' '+lines[k][1]; k+=1
    example=[]; exampleVi=[]
    while k<len(lines) and lines[k][1]!='Từ vựng học thêm':
        text=lines[k][1]
        (exampleVi if exampleVi or vietnamese(text) else example).append(text); k+=1
    main=dict(id=f"a-{b['chapter']:02}-{b['number']:02}-00",chapter=b['chapter'],number=b['number'],page=b['page'],kind='main',word=clean(word),meaning=clean(meaning),example=clean(' '.join(example)),exampleVi=clean(' '.join(exampleVi)))
    if not main['example'] or not main['exampleVi']: errors.append(main)
    words.append(main); extra=[]; k+=1
    for pg,text in lines[k:]:
        if text=='Từ vựng học thêm': continue
        if pg==95 and text=='các biện pháp khẩn cấp: những động vật quý hiếm':
            text='rare animals: những động vật quý hiếm'
        # A colon separates English headword from Vietnamese meaning. Wrapped
        # lines belong to the previous entry, including a wrapped English headword.
        if ':' in text and not vietnamese(text.split(':',1)[0]):
            extra.append([pg,text])
        elif extra: extra[-1][1]+=' '+text
        else: errors.append({'orphan':text,'page':pg})
    for i,(pg,text) in enumerate(extra,1):
        w,m=text.split(':',1)
        words.append(dict(id=f"a-{b['chapter']:02}-{b['number']:02}-{i:02}",chapter=b['chapter'],number=b['number'],page=pg,kind='extra',word=clean(w),meaning=clean(m),example=main['example'],exampleVi=main['exampleVi'],contextId=main['id']))
        if pg==95 and w=='rare animals':
            words[-1]['editorNote']='Sửa lỗi đầu mục trang 95: sách in “các biện pháp khẩn cấp: những động vật quý hiếm”. Cụm “rare animals” được đối chiếu từ câu ví dụ ngay phía trên.'

assert len(chapters)==15, chapters
for ch in chapters:
    nums=[b['number'] for b in blocks if b['chapter']==ch['id']]
    assert nums==list(range(1,21)), (ch,nums)
assert not errors, errors
assert all(w['word'] and w['meaning'] and not vietnamese(w['word']) for w in words)

# Visible source errors verified against the rendered pages. Keep an audit trail.
corrections={
 'a-07-06-01':('word','international organisations','Sửa “ternational organisations” thiếu “in”; đối chiếu câu ví dụ ngay trên bảng.'),
 'a-12-17-03':('word','academic writing','Sửa “cademic writing” thiếu “a”; đối chiếu câu ví dụ ngay trên bảng.'),
 'a-02-07-00':('meaning','các vụ tai nạn hạt nhân','Sửa lỗi gõ tiếng Việt “tai hạn” thành “tai nạn”.'),
 'a-09-17-00':('meaning','camera giám sát / an ninh','Sửa lỗi gõ tiếng Việt “anh ninh” thành “an ninh”.'),
 'a-06-13-00':('meaning','lao động công ích (hình phạt phục vụ cộng đồng)','Làm rõ “community service” trong ngữ cảnh hình phạt của chủ đề Crime; sách dịch chung là “dịch vụ cộng đồng”.'),
 'a-09-15-00':('meaning','việc đình chỉ quyền sử dụng giấy phép lái xe','Làm rõ “licence suspension” là đình chỉ quyền sử dụng giấy phép; sách ghi “tịch thu giấy phép lái xe”.'),
}
for w in words:
    if w['id'] in corrections:
        field,value,note=corrections[w['id']];w['sourceOriginal']=w[field];w[field]=value;w['editorNote']=note

# Do not pretend a concatenation of dictionary entries is connected-speech IPA.
# Store individual dictionary tokens, with both variants and explicit missing values.
ipas={}
for locale in ['UK','US']:
    d={}
    for line in (ROOT/f'data-source/en_{locale}.txt').read_text(encoding='utf-8').splitlines():
        if '\t' in line:
            w,ipa=line.split('\t',1); d[w.lower()]=ipa
    ipas[locale]=d
tokens={}
for index,w in enumerate(words):
    w['order']=index
    for t in re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)*",re.sub(r'\([^)]*\)','',w['word'])):
        t=t.lower()
        tokens[t]=dict(uk=ipas['UK'].get(t,''),us=ipas['US'].get(t,''))
book=dict(id='ebook-a',version=1,title='Học từ vựng qua e-book A',source='IELTS Vocabulary — IELTS Nguyễn Huyền',sourceFile=source.name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),pages=len(reader.pages),chapters=chapters,words=words,pronunciation=tokens)
(ROOT/'public/ebook-a.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(main=len(blocks),extra=len(words)-len(blocks),total=len(words),chapters=[dict(**ch,count=sum(w['chapter']==ch['id'] for w in words)) for ch in chapters],missingIPA=[t for t,v in tokens.items() if not v['uk'] or not v['us']]),ensure_ascii=False,indent=2))
