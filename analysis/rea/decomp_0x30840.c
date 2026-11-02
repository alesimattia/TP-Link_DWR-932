
undefined4 FUN_00030428(int param_1,void *param_2,size_t param_3)

{
  int iVar1;
  size_t sVar2;
  char *pcVar3;
  char acStack_230 [264];
  char acStack_128 [264];
  
  sVar2 = param_3;
  if (299 < param_3) {
    sVar2 = 300;
  }
  memset(&DAT_0007fb34,0,300);
  memcpy(&DAT_0007fb34,param_2,sVar2);
  iVar1 = memcmp(&DAT_0007fc60,"wpa_passphrase",0xe);
  if (iVar1 == 0) {
    memset(acStack_230,0,0x108);
    memset(acStack_128,0,0x108);
LAB_00030688:
    memset((char *)(param_1 + 0x56c),0,0x108);
    strcpy(acStack_128,&DAT_0007fb34);
    FUN_00015be8(acStack_128,acStack_230,0x108);
    strcpy((char *)(param_1 + 0x56c),acStack_230);
    return 1;
  }
  iVar1 = memcmp(&DAT_0007fc60,&DAT_0006fdd4,4);
  if (iVar1 == 0) {
    *(undefined1 *)(param_1 + 0xb) = 1;
    memset((void *)(param_1 + 0xc),0,0x100);
    param_3 = sVar2;
LAB_000306dc:
    pcVar3 = (char *)(param_1 + 0xc);
    memcpy(pcVar3,&DAT_0007fb34,param_3);
    sVar2 = strlen(pcVar3);
    FUN_0000ec38(pcVar3,sVar2);
    return 1;
  }
  iVar1 = memcmp(&DAT_0007fc60,"wep_key_index",0xd);
  if (iVar1 == 0) {
    iVar1 = atoi(&DAT_0007fb34);
    *(char *)(param_1 + 300) = (char)iVar1;
    return 1;
  }
  iVar1 = memcmp(&DAT_0007fc60,"wep_key",7);
  if (iVar1 == 0) {
    memset(acStack_128,0,0x108);
    memset(acStack_230,0,0x108);
    memset((char *)(param_1 + 0x13c),0,0x108);
    memset((void *)(param_1 + 0x248),0,0x108);
    memset((void *)(param_1 + 0x354),0,0x108);
    memset((void *)(param_1 + 0x460),0,0x108);
    strcpy(acStack_230,&DAT_0007fb34);
    FUN_00015be8(acStack_230,acStack_128,0x108);
    strcpy((char *)(param_1 + 0x13c),acStack_128);
    return 1;
  }
  iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_ssid",0xc);
  if (iVar1 == 0) {
    *(undefined1 *)(param_1 + 0xb) = 1;
    memset((void *)(param_1 + 0xc),0,0x100);
    if (0xff < param_3) {
      param_3 = 0x100;
    }
    goto LAB_000306dc;
  }
  iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wep_key_str1",0x14);
  if (iVar1 == 0) {
    pcVar3 = (char *)(param_1 + 0x13c);
LAB_000307c8:
    memset(acStack_230,0,0x108);
    memset(acStack_128,0,0x108);
    strcpy(acStack_128,&DAT_0007fb34);
    FUN_00015be8(acStack_128,acStack_230,0x108);
    memset(pcVar3,0,0x108);
    strcpy(pcVar3,acStack_230);
  }
  else {
    iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wep_key_str2",0x14);
    if (iVar1 == 0) {
      pcVar3 = (char *)(param_1 + 0x248);
    }
    else {
      iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wep_key_str3",0x14);
      if (iVar1 == 0) {
        pcVar3 = (char *)(param_1 + 0x354);
        goto LAB_000307c8;
      }
      iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wep_key_str4",0x14);
      if (iVar1 != 0) {
        iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wpa_password",0x14);
        if (iVar1 != 0) {
          iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_wapi_password",0x15);
          if (iVar1 == 0) {
            memset(acStack_128,0,0x108);
            memset(acStack_230,0,0x108);
            memset((void *)(param_1 + 0x678),0,0x108);
            strcpy(acStack_230,&DAT_0007fb34);
            FUN_00015be8(acStack_230,acStack_128,0x108);
            sVar2 = strlen(acStack_128);
            if (0x107 < sVar2) {
              sVar2 = 0x108;
            }
            memcpy((void *)(param_1 + 0x678),acStack_128,sVar2);
            return 1;
          }
          iVar1 = memcmp(&DAT_0007fc60,&DAT_0006fe94,3);
          if (iVar1 != 0) {
            iVar1 = memcmp(&DAT_0007fc60,"wps_pin",7);
            if (iVar1 == 0) {
              memcpy(&DAT_0007fa1c,&DAT_0007fb34,sVar2);
              return 1;
            }
            iVar1 = memcmp(&DAT_0007fc60,"bm_wlan_countrycode",0x13);
            if (iVar1 != 0) {
              return 1;
            }
            *(undefined1 *)(param_1 + 0x11c) = 1;
            memcpy((void *)(param_1 + 0x11d),&DAT_0007fb34,sVar2);
            return 1;
          }
          iVar1 = memcmp(&DAT_0007fb34,"pbc_start",9);
          if (iVar1 == 0) {
            DAT_0007fa14 = 1;
            DAT_0007fa30 = 2;
            return 1;
          }
          iVar1 = memcmp(&DAT_0007fb34,"pin_start",9);
          if (iVar1 != 0) {
            iVar1 = memcmp(&DAT_0007fb34,"wps_stop",8);
            if (iVar1 != 0) {
              DAT_0007fa30 = 0;
              return 1;
            }
            DAT_0007fa14 = 0;
            DAT_0007fa30 = 2;
            return 1;
          }
          DAT_0007fa14 = 2;
          DAT_0007fa30 = 2;
          return 1;
        }
        memset(acStack_230,0,0x108);
        memset(acStack_128,0,0x108);
        goto LAB_00030688;
      }
      pcVar3 = (char *)(param_1 + 0x460);
    }
    memset(acStack_128,0,0x108);
    memset(acStack_230,0,0x108);
    strcpy(acStack_230,&DAT_0007fb34);
    FUN_00015be8(acStack_230,acStack_128,0x108);
    memset(pcVar3,0,0x108);
    strcpy(pcVar3,acStack_128);
  }
  return 1;
}

