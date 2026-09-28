from PIL import Image,ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for size in [192,512]:
 im=Image.new('RGB',(size,size),'#6952e6');d=ImageDraw.Draw(im)
 points=[(.22,.42),(.33,.70),(.67,.70),(.78,.42),(.59,.54),(.50,.28),(.41,.54)]
 d.polygon([(int(x*size),int(y*size)) for x,y in points],fill='white')
 d.rounded_rectangle((int(.33*size),int(.76*size),int(.67*size),int(.81*size)),radius=int(.02*size),fill='#f7cb67')
 im.save(root/'public'/('icon-'+str(size)+'.png'))
