
undefined4 FUN_00016294(void *param_1)

{
  int iVar1;
  uint uVar2;
  uint uVar3;
  size_t sVar4;
  undefined4 uVar5;
  undefined *puVar6;
  char acStack_25c [516];
  char acStack_58 [68];
  
  memset(acStack_25c,0,0x201);
  memset(param_1,0,0x98c);
  iVar1 = FUN_00016110("wlan0","wlan_disabled",acStack_25c,0x200);
  if (iVar1 == 0) {
    *(undefined1 *)((int)param_1 + 9) = 1;
    iVar1 = atoi(acStack_25c);
    *(byte *)((int)param_1 + 10) = (byte)iVar1 ^ 1;
  }
  iVar1 = FUN_00016110("wlan0",&DAT_0006b0fc,acStack_25c,0x200);
  if (iVar1 == 0) {
    sVar4 = strlen(acStack_25c);
    strncpy((char *)((int)param_1 + 0xc),acStack_25c,sVar4);
  }
  iVar1 = FUN_00016110("wlan0","hidden_ssid",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(char *)((int)param_1 + 0x10d) = (char)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","supported_sta_num",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(char *)((int)param_1 + 0x125) = (char)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","countrycode",acStack_25c,0x200);
  if (iVar1 == 0) {
    sVar4 = strlen(acStack_25c);
    strncpy((char *)((int)param_1 + 0x11d),acStack_25c,sVar4);
  }
  iVar1 = FUN_00016110("wlan0",&DAT_0006b130,acStack_25c,0x200);
  if (iVar1 == 0) {
    uVar2 = atoi(acStack_25c);
    uVar3 = uVar2 & 0xff;
    if ((uVar2 & 4) == 0) {
      uVar5 = 1;
    }
    else {
      uVar5 = 2;
    }
    *(undefined4 *)((int)param_1 + 0x110) = uVar5;
    if (uVar3 == 1) {
      *(undefined4 *)((int)param_1 + 0x118) = 0;
    }
    else if (uVar3 == 2) {
      *(undefined4 *)((int)param_1 + 0x118) = 3;
    }
    else if (uVar3 == 8) {
      *(undefined4 *)((int)param_1 + 0x118) = 4;
    }
    else if (uVar3 == 4) {
      *(undefined4 *)((int)param_1 + 0x118) = 5;
    }
    else if (uVar3 == 3) {
      *(undefined4 *)((int)param_1 + 0x118) = 1;
    }
    else if (uVar3 == 0xb) {
      *(undefined4 *)((int)param_1 + 0x118) = 2;
    }
    else if (uVar3 == 0xc) {
      *(undefined4 *)((int)param_1 + 0x118) = 6;
    }
  }
  iVar1 = FUN_00016110("wlan0","channel",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(char *)((int)param_1 + 0x121) = (char)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","beacon_interval",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(short *)((int)param_1 + 0x782) = (short)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","dtim_period",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(short *)((int)param_1 + 0x786) = (short)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","encrypt",acStack_25c,0x200);
  if (iVar1 == 0) {
    uVar2 = atoi(acStack_25c);
    uVar2 = uVar2 & 0xff;
    if ((uVar2 == 0) || (uVar2 == 1)) {
      *(uint *)((int)param_1 + 0x128) = uVar2;
    }
    else {
      if (uVar2 == 2) {
        *(undefined4 *)((int)param_1 + 0x128) = 2;
        iVar1 = FUN_00016110("wlan0","wpa_cipher",acStack_25c,0x200);
      }
      else {
        if (uVar2 == 4) {
          *(undefined4 *)((int)param_1 + 0x128) = 3;
        }
        else {
          if (uVar2 != 6) goto LAB_00016524;
          *(undefined4 *)((int)param_1 + 0x128) = 4;
        }
        iVar1 = FUN_00016110("wlan0","wpa2_cipher",acStack_25c,0x200);
      }
      if (iVar1 == 0) {
        iVar1 = atoi(acStack_25c);
        *(int *)((int)param_1 + 0x568) = iVar1 + -1;
      }
    }
  }
LAB_00016524:
  memset(acStack_58,0,0x40);
  iVar1 = FUN_00016110("wlan0","auth_type",acStack_25c,0x200);
  if (iVar1 == 0) {
    uVar2 = atoi(acStack_25c);
    if ((uVar2 & 0xff) == 0) {
      *(undefined4 *)((int)param_1 + 0x130) = 1;
    }
    else {
      if ((uVar2 & 0xff) == 1) {
        uVar5 = 2;
      }
      else {
        uVar5 = 3;
      }
      *(undefined4 *)((int)param_1 + 0x130) = uVar5;
    }
  }
  iVar1 = FUN_00016110("wlan0",&DAT_0006b188,acStack_25c,0x200);
  if (iVar1 == 0) {
    uVar2 = atoi(acStack_25c);
    uVar2 = uVar2 & 0xff;
    if (uVar2 == 1) {
      *(undefined4 *)((int)param_1 + 0x134) = 0;
    }
    else if (uVar2 == 2) {
      *(undefined4 *)((int)param_1 + 0x134) = 1;
    }
  }
  else {
    uVar2 = 0;
  }
  iVar1 = FUN_00016110("wlan0","wep_default_key",acStack_25c,0x200);
  if (iVar1 == 0) {
    iVar1 = atoi(acStack_25c);
    *(char *)((int)param_1 + 300) = (char)iVar1;
  }
  iVar1 = FUN_00016110("wlan0","wep_key_type",acStack_25c,0x200);
  if (iVar1 == 0) {
    uVar3 = atoi(acStack_25c);
    uVar3 = uVar3 & 0xff;
    if (uVar3 == 0) {
      *(undefined4 *)((int)param_1 + 0x138) = 1;
      *(undefined4 *)((int)param_1 + 0x244) = 1;
      *(undefined4 *)((int)param_1 + 0x350) = 1;
      *(undefined4 *)((int)param_1 + 0x45c) = 1;
    }
    else if (uVar3 == 1) {
      *(undefined4 *)((int)param_1 + 0x138) = 0;
      *(undefined4 *)((int)param_1 + 0x244) = 0;
      *(undefined4 *)((int)param_1 + 0x350) = 0;
      *(undefined4 *)((int)param_1 + 0x45c) = 0;
    }
  }
  else {
    uVar3 = 0;
  }
  if (uVar2 == 1) {
    uVar5 = 0x40;
  }
  else {
    uVar5 = 0x80;
  }
  if (uVar3 == 0) {
    puVar6 = &DAT_0006b0dc;
  }
  else {
    puVar6 = &DAT_0006b0e0;
  }
  snprintf(acStack_58,0x3f,"wepkey1_%d_%s",uVar5,puVar6);
  iVar1 = FUN_00016110("wlan0",acStack_58,acStack_25c,0x200);
  if (iVar1 == 0) {
    if (uVar3 == 0) {
      FUN_0001602c(acStack_25c,(int)param_1 + 0x13c,0x107);
    }
    else {
      sVar4 = strlen(acStack_25c);
      strncpy((char *)((int)param_1 + 0x13c),acStack_25c,sVar4);
    }
  }
  if (uVar2 == 1) {
    uVar5 = 0x40;
  }
  else {
    uVar5 = 0x80;
  }
  if (uVar3 == 0) {
    puVar6 = &DAT_0006b0dc;
  }
  else {
    puVar6 = &DAT_0006b0e0;
  }
  snprintf(acStack_58,0x3f,"wepkey2_%d_%s",uVar5,puVar6);
  iVar1 = FUN_00016110("wlan0",acStack_58,acStack_25c,0x200);
  if (iVar1 == 0) {
    if (uVar3 == 0) {
      FUN_0001602c(acStack_25c,(int)param_1 + 0x248,0x107);
    }
    else {
      sVar4 = strlen(acStack_25c);
      strncpy((char *)((int)param_1 + 0x248),acStack_25c,sVar4);
    }
  }
  if (uVar2 == 1) {
    uVar5 = 0x40;
  }
  else {
    uVar5 = 0x80;
  }
  if (uVar3 == 0) {
    puVar6 = &DAT_0006b0dc;
  }
  else {
    puVar6 = &DAT_0006b0e0;
  }
  snprintf(acStack_58,0x3f,"wepkey3_%d_%s",uVar5,puVar6);
  iVar1 = FUN_00016110("wlan0",acStack_58,acStack_25c,0x200);
  if (iVar1 == 0) {
    if (uVar3 == 0) {
      FUN_0001602c(acStack_25c,(int)param_1 + 0x354,0x107);
    }
    else {
      sVar4 = strlen(acStack_25c);
      strncpy((char *)((int)param_1 + 0x354),acStack_25c,sVar4);
    }
  }
  if (uVar2 == 1) {
    uVar5 = 0x40;
  }
  else {
    uVar5 = 0x80;
  }
  if (uVar3 == 0) {
    puVar6 = &DAT_0006b0dc;
  }
  else {
    puVar6 = &DAT_0006b0e0;
  }
  snprintf(acStack_58,0x3f,"wepkey4_%d_%s",uVar5,puVar6);
  iVar1 = FUN_00016110("wlan0",acStack_58,acStack_25c,0x200);
  if (iVar1 == 0) {
    if (uVar3 == 0) {
      FUN_0001602c(acStack_25c,(int)param_1 + 0x460,0x107);
    }
    else {
      sVar4 = strlen(acStack_25c);
      strncpy((char *)((int)param_1 + 0x460),acStack_25c,sVar4);
    }
  }
  iVar1 = FUN_00016110("wlan0","wpa_psk",acStack_25c,0x200);
  if (iVar1 == 0) {
    sVar4 = strlen(acStack_25c);
    strncpy((char *)((int)param_1 + 0x56c),acStack_25c,sVar4);
  }
  return 0;
}

