import sys,struct,zlib,subprocess
tail,url,want,nbytes,out=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5]
b=open(tail,'rb').read()
p=b.find(b'PK\x01\x02')
while p!=-1:
    (sig,vm,vn,fl,meth,mt,md,crc,cs,us,fnl,exl,cml,dn,ia,ea,lho)=struct.unpack('<IHHHHHHIIIHHHHHII',b[p:p+46])
    fn=b[p+46:p+46+fnl].decode('latin1')
    if want in fn: break
    p=b.find(b'PK\x01\x02',p+46+fnl+exl+cml)
data=subprocess.run(['curl','-s','-r',f'{lho}-{lho+nbytes}',url],capture_output=True).stdout
fnl2,exl2=struct.unpack('<HH',data[26:30])
d=zlib.decompressobj(-15)
res=d.decompress(data[30+fnl2+exl2:])
open(out,'wb').write(res); print(fn,'meth',meth,'decoded',len(res))
