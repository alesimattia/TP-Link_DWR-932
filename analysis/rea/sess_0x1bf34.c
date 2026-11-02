
undefined4 FUN_0001be88(int param_1,int param_2,int *param_3)

{
  FILE *pFVar1;
  int iVar2;
  size_t sVar3;
  size_t sVar4;
  undefined4 uVar5;
  char *__s;
  int local_1f4;
  char local_1f0 [260];
  int local_ec [2];
  int local_e4 [5];
  char acStack_d0 [36];
  int local_ac;
  int local_a8;
  int local_a4;
  int local_a0;
  int local_9c;
  int local_98;
  int local_94;
  int local_90;
  undefined1 local_8c;
  int local_88;
  __suseconds_t local_84;
  int local_80;
  int local_7c;
  int local_78;
  int local_74;
  int local_70;
  int local_6c;
  undefined4 local_68;
  undefined4 local_64;
  undefined4 local_60;
  undefined4 local_5c;
  undefined4 local_58;
  undefined4 local_54;
  undefined4 local_50;
  undefined4 local_4c;
  undefined4 local_48;
  undefined4 local_44;
  undefined4 local_40;
  undefined4 local_3c;
  undefined4 local_38;
  undefined4 local_34;
  int local_30;
  timeval local_2c;
  int local_24 [2];
  
  local_1f4 = param_2;
  memset(local_1f0,0,0x101);
  local_ac = 0;
  local_a8 = 0;
  local_a4 = 0;
  local_a0 = 0;
  local_9c = 0;
  local_98 = 0;
  local_94 = 0;
  local_90 = 0;
  local_8c = 0;
  memset(local_ec,0,0x40);
  local_48 = 0;
  local_44 = 0;
  local_40 = 0;
  local_3c = 0;
  local_68 = 0;
  local_64 = 0;
  local_60 = 0;
  local_5c = 0;
  local_58 = 0;
  local_54 = 0;
  local_50 = 0;
  local_4c = 0;
  local_38 = 0;
  local_34 = 0;
  local_30 = 0;
  FUN_0001bb84();
  pFVar1 = fopen("/www/qcmap_session","r");
  if (pFVar1 != (FILE *)0x0) {
    fread(local_ec,1,0x1f,pFVar1);
    fclose(pFVar1);
    syslog(6,"%s :ip %s ,name %s","doLogin",local_e4,acStack_d0);
    iVar2 = strncmp(acStack_d0,"WEB",3);
    if (((iVar2 == 0) && (iVar2 = strncmp((char *)local_e4,"0.0.0.0",7), iVar2 != 0)) &&
       ((gettimeofday(&local_2c,(__timezone_ptr_t)0x0), DAT_0007e5f4 == 0 ||
        (local_2c.tv_sec - local_ec[0] < DAT_0007e5f4)))) {
      inet_pton(2,(char *)local_e4,local_24);
      *param_3 = local_24[0];
      syslog(6,"%s : WEB login ","doLogin");
      return 0x191;
    }
  }
  iVar2 = FUN_0001ba88("/bmdefsys/www/lighttpd.user",&local_68,local_1f0);
  if (iVar2 < 0) {
    syslog(6,"%s : Open password file failed ","doLogin");
  }
  else {
    sVar3 = strlen((char *)&local_68);
    sVar4 = strlen((char *)(param_1 + 4));
    if (sVar4 < sVar3) {
      sVar4 = sVar3;
    }
    iVar2 = strncmp((char *)&local_68,(char *)(param_1 + 4),sVar4);
    if (iVar2 == 0) {
      __s = (char *)(param_1 + 0x25);
      sVar4 = strlen(__s);
      iVar2 = FUN_0000ec38(__s,sVar4);
      if (iVar2 == -1) {
        syslog(6,"%s : unencode  error ","doLogin");
      }
      else if (__s == (char *)0x0) {
        syslog(6,"%s :md5 sum error ","doLogin");
      }
      else {
        if (local_1f0[0] != '\0') {
          sVar3 = strlen(local_1f0);
          sVar4 = strlen(__s);
          if (sVar4 < sVar3) {
            sVar4 = sVar3;
          }
          iVar2 = strncmp(local_1f0,__s,sVar4);
          if (iVar2 == 0) {
            syslog(6,"%s : login_count --->%d ","doLogin",(uint)(byte)DAT_0007f084);
            pFVar1 = popen("< /dev/urandom tr -dc A-Z-a-z-0-9 | head -c32","r");
            if (pFVar1 != (FILE *)0x0) {
              local_8c = 0;
              local_ac = iVar2;
              local_a8 = iVar2;
              local_a4 = iVar2;
              local_a0 = iVar2;
              local_9c = iVar2;
              local_98 = iVar2;
              local_94 = iVar2;
              local_90 = iVar2;
              fgets((char *)&local_ac,0x20,pFVar1);
              pclose(pFVar1);
            }
            uVar5 = FUN_00011b4c();
            iVar2 = DAT_0007f090;
            if (DAT_0007f090 == local_1f4) {
              DAT_0007f094 = local_ac;
              DAT_0007f098 = local_a8;
              DAT_0007f09c = local_a4;
              DAT_0007f0a0 = local_a0;
              DAT_0007f0a4 = local_9c;
              DAT_0007f0a8 = local_98;
              DAT_0007f0ac = local_94;
              DAT_0007f0b0 = local_90;
              DAT_0007f08c = uVar5;
              memcpy((void *)(param_1 + 0x126),&local_ac,0x20);
              syslog(6,"%s : login_count --->%d,mSessionIdentifier-->%s ","doLogin",
                     (uint)(byte)DAT_0007f084,(void *)(param_1 + 0x126));
              pFVar1 = fopen("/www/qcmap_session","w+");
              if (pFVar1 != (FILE *)0x0) {
                FUN_0000ed7c(2,&local_1f4,&local_48);
                local_88 = 0;
                local_84 = 0;
                local_80 = 0;
                local_7c = 0;
                local_78 = 0;
                local_74 = 0;
                local_70 = 0;
                local_6c = 0;
                gettimeofday(&local_2c,(__timezone_ptr_t)0x0);
                local_80 = local_48;
                local_7c = local_44;
                local_78 = local_40;
                local_74 = local_3c;
                local_88 = local_2c.tv_sec;
                local_84 = local_2c.tv_usec;
                local_70 = DAT_0007e5f4;
                local_6c = CONCAT13(local_6c._3_1_,0x505041);
                fwrite(&local_88,1,0x1f,pFVar1);
                fclose(pFVar1);
              }
              pFVar1 = fopen("/www/login_attempt","w+");
            }
            else {
              if ((byte)DAT_0007f084 != 0) {
                *param_3 = DAT_0007f090;
                syslog(6,"%s : max login clients ","doLogin");
                return 0x191;
              }
              if (DAT_0007f090 != 0) {
                return uVar5;
              }
              DAT_0007f090 = local_1f4;
              DAT_0007f094 = local_ac;
              DAT_0007f098 = local_a8;
              DAT_0007f09c = local_a4;
              DAT_0007f0a0 = local_a0;
              DAT_0007f0a4 = local_9c;
              DAT_0007f0a8 = local_98;
              DAT_0007f0ac = local_94;
              DAT_0007f0b0 = local_90;
              DAT_0007f08c = uVar5;
              memcpy((void *)(param_1 + 0x126),&local_ac,0x20);
              DAT_0007f084._0_1_ = (byte)DAT_0007f084 + 1;
              syslog(6,"%s : login_count --->%d,mSessionIdentifier-->%s ","doLogin",
                     (uint)(byte)DAT_0007f084,(void *)(param_1 + 0x126));
              pFVar1 = fopen("/www/qcmap_session","w+");
              if (pFVar1 != (FILE *)0x0) {
                FUN_0000ed7c(2,&local_1f4,&local_48);
                local_88 = iVar2;
                local_84 = iVar2;
                local_80 = iVar2;
                local_7c = iVar2;
                local_78 = iVar2;
                local_74 = iVar2;
                local_70 = iVar2;
                local_6c = iVar2;
                gettimeofday(&local_2c,(__timezone_ptr_t)0x0);
                local_80 = local_48;
                local_7c = local_44;
                local_78 = local_40;
                local_74 = local_3c;
                local_88 = local_2c.tv_sec;
                local_84 = local_2c.tv_usec;
                local_70 = DAT_0007e5f4;
                local_6c = CONCAT13(local_6c._3_1_,0x505041);
                fwrite(&local_88,1,0x1f,pFVar1);
                fclose(pFVar1);
              }
              pFVar1 = fopen("/www/login_attempt","w+");
            }
            if (pFVar1 != (FILE *)0x0) {
              local_30 = 0;
              local_34 = 0;
              local_38 = uVar5;
              fwrite(&local_38,1,0xc,pFVar1);
              fclose(pFVar1);
              return 200;
            }
            return 200;
          }
        }
        syslog(6,"%s : correct password","doLogin");
        uVar5 = FUN_00011b4c();
        pFVar1 = fopen("/www/login_attempt","r");
        if (pFVar1 == (FILE *)0x0) {
          local_30 = 0;
        }
        else {
          memset(local_ec,0,0x40);
          fread(local_ec,1,0xc,pFVar1);
          fclose(pFVar1);
          local_30 = local_e4[0] + 1;
        }
        local_34 = 0;
        local_38 = uVar5;
        pFVar1 = fopen("/www/login_attempt","w+");
        if (pFVar1 != (FILE *)0x0) {
          fwrite(&local_38,1,0xc,pFVar1);
          fclose(pFVar1);
        }
      }
    }
    else {
      syslog(6,"%s :  correct username ","doLogin");
    }
  }
  return 0x191;
}

