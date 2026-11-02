import sys,struct
b=open(sys.argv[1],'rb').read()
i=b.rfind(b'PK\x05\x06')
p=b.find(b'PK\x01\x02')
while p!=-1 and p<i:
    (sig,vm,vn,fl,meth,mt,md,crc,cs,us,fnl,exl,cml,dn,ia,ea,lho)=struct.unpack('<IHHHHHHIIIHHHHHII',b[p:p+46])
    fn=b[p+46:p+46+fnl].decode('latin1')
    print(f'  {fn!r} comp={cs} uncomp={us} enc={fl&1}')
    p=b.find(b'PK\x01\x02',p+46+fnl+exl+cml)
