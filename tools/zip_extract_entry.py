import sys,struct,zlib,subprocess
tail,url,size,want,out=sys.argv[1],sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5]
b=open(tail,'rb').read()
p=b.find(b'PK\x01\x02')
while p!=-1:
    (sig,vm,vn,fl,meth,mt,md,crc,cs,us,fnl,exl,cml,dn,ia,ea,lho)=struct.unpack('<IHHHHHHIIIHHHHHII',b[p:p+46])
    fn=b[p+46:p+46+fnl].decode('latin1')
    if want in fn: break
    p=b.find(b'PK\x01\x02',p+46+fnl+exl+cml)
end=lho+30+1024+cs
data=subprocess.run(['curl','-s','-r',f'{lho}-{end}',url],capture_output=True).stdout
fnl2,exl2=struct.unpack('<HH',data[26:30])
comp=data[30+fnl2+exl2:30+fnl2+exl2+cs]
res=zlib.decompress(comp,-15) if meth==8 else comp
open(out,'wb').write(res); print(fn,len(res))
