
int FUN_0001c6a4(int param_1,int param_2)

{
  FILE *__s;
  int local_30;
  int local_2c;
  int local_28;
  int local_24;
  int local_20;
  int local_1c;
  int local_18;
  int local_14;
  
  if ((DAT_0007f090 == param_2) &&
     (param_1 = memcmp(&DAT_0007f094,(void *)(param_1 + 0x126),0x20), param_1 == 0)) {
    DAT_0007f084._0_1_ = (byte)DAT_0007f084 - 1;
    DAT_0007f08c = 0;
    DAT_0007f090 = 0;
    DAT_0007f094 = 0;
    DAT_0007f098 = 0;
    DAT_0007f09c = 0;
    DAT_0007f0a0 = 0;
    DAT_0007f0a4 = 0;
    DAT_0007f0a8 = 0;
    DAT_0007f0ac = 0;
    DAT_0007f0b0 = 0;
    DAT_0007f0b4 = 0;
    DAT_0007f0b8 = 0;
    syslog(6,"%s : find  ,login_count---> %d  ","doLogout",(uint)(byte)DAT_0007f084);
    __s = fopen("/www/qcmap_session","w+");
    if (__s != (FILE *)0x0) {
      local_30 = param_1;
      local_2c = param_1;
      local_28 = param_1;
      local_24 = param_1;
      local_20 = param_1;
      local_1c = param_1;
      local_18 = param_1;
      local_14 = param_1;
      strncpy((char *)&local_28,"0.0.0.0",0x10);
      local_14 = CONCAT13(local_14._3_1_,0x505041);
      local_18 = DAT_0007e5f4;
      fwrite(&local_30,1,0x1f,__s);
      fclose(__s);
    }
    param_1 = 200;
  }
  return param_1;
}

