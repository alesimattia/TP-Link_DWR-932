
undefined4 FUN_00031214(undefined4 param_1,undefined4 param_2)

{
  int iVar1;
  uint uVar2;
  size_t sVar3;
  int iVar4;
  uint uVar5;
  uint uVar6;
  undefined4 uVar7;
  undefined1 *__s;
  undefined *puVar8;
  uint local_f18 [2];
  undefined1 auStack_f10 [12];
  char acStack_f04 [257];
  byte local_e03;
  undefined4 local_e00;
  undefined4 local_df8;
  byte local_def;
  byte local_ded;
  byte local_deb;
  uint local_de8;
  byte local_de4;
  undefined4 local_de0;
  undefined4 local_ddc;
  undefined4 local_dd8;
  char acStack_dd4 [264];
  undefined4 local_ccc;
  char acStack_cc8 [264];
  undefined4 local_bc0;
  char acStack_bbc [264];
  undefined4 local_ab4;
  char acStack_ab0 [264];
  int local_9a8;
  char acStack_9a4 [534];
  short sStack_78e;
  short sStack_78a;
  char acStack_584 [516];
  char acStack_380 [512];
  undefined4 local_180;
  int local_17c;
  char acStack_178 [20];
  undefined4 local_164;
  char acStack_60 [64];
  
  memset(acStack_380,0,0x200);
  memset(acStack_584,0,0x201);
  memset(auStack_f10,0,0x98c);
  memset(&local_180,0,0x120);
  FUN_0000ea10(param_1,200,param_2);
  FCGX_PutStr(&DAT_0006fed8,1,param_1);
  iVar1 = FUN_00016110("wlan0","wlan_disabled",acStack_584,0x200);
  if (iVar1 == 0) {
    uVar2 = atoi(acStack_584);
    local_f18[0] = (uVar2 ^ 1) & 0xff;
  }
  else {
    local_f18[0] = 0;
  }
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_enable");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar1 = FUN_00016110("wlan0",&DAT_0006fdd4,acStack_584,0x200);
  if (iVar1 == 0) {
    sVar3 = strlen(acStack_584);
    strncpy(acStack_f04,acStack_584,sVar3);
  }
  sVar3 = strlen(acStack_f04);
  iVar1 = -(sVar3 * 6 + 0xf & 0xfffffff8);
  sVar3 = strlen(acStack_f04);
  __s = auStack_f10 + iVar1;
  memset(__s,0,sVar3 * 6 + 1);
  FUN_00015cd0(acStack_f04,__s);
  *(undefined1 **)((int)local_f18 + iVar1) = __s;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_ssid");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","hidden_ssid",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar5 = atoi(acStack_584);
    uVar2 = uVar5 & 0xff;
    local_e03 = (byte)uVar5;
  }
  else {
    uVar2 = (uint)local_e03;
  }
  *(uint *)((int)local_f18 + iVar1) = uVar2;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_hidden");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","supported_sta_num",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar5 = atoi(acStack_584);
    uVar2 = uVar5 & 0xff;
    local_deb = (byte)uVar5;
  }
  else {
    uVar2 = (uint)local_deb;
  }
  *(uint *)((int)local_f18 + iVar1) = uVar2;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_maxClient");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","countrycode",acStack_584,0x200);
  if (iVar4 == 0) {
    sVar3 = strlen(acStack_584);
    strncpy(&DAT_0007e5d9,acStack_584,sVar3);
  }
  *(undefined **)((int)local_f18 + iVar1) = &DAT_0007e5d9;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_countrycode");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0",&DAT_00070100,acStack_584,0x200);
  if (iVar4 == 0) {
    uVar2 = atoi(acStack_584);
    uVar5 = uVar2 & 0xff;
    if ((uVar2 & 4) == 0) {
      local_e00 = 1;
    }
    else {
      local_e00 = 2;
    }
    if (uVar5 == 1) {
      local_df8 = 0;
    }
    else if (uVar5 == 2) {
      local_df8 = 3;
    }
    else if (uVar5 == 8) {
      local_df8 = 4;
    }
    else if (uVar5 == 4) {
      local_df8 = 5;
    }
    else if (uVar5 == 3) {
      local_df8 = 1;
    }
    else if (uVar5 == 0xb) {
      local_df8 = 2;
    }
    else if (uVar5 == 0xc) {
      local_df8 = 6;
    }
  }
  *(undefined4 *)((int)local_f18 + iVar1) = local_e00;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_band");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(undefined4 *)((int)local_f18 + iVar1) = local_df8;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_mode");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","channel",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar5 = atoi(acStack_584);
    uVar2 = uVar5 & 0xff;
    local_def = (byte)uVar5;
  }
  else {
    uVar2 = (uint)local_def;
  }
  *(uint *)((int)local_f18 + iVar1) = uVar2;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_channel");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","channel_bonding",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    local_ded = (byte)iVar4;
  }
  iVar4 = FUN_00016110("wlan0","autoch_1611_enable",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    uVar2 = iVar4 + (uint)local_ded & 0xff;
    local_ded = (byte)(iVar4 + (uint)local_ded);
  }
  else {
    uVar2 = (uint)local_ded;
  }
  *(uint *)((int)local_f18 + iVar1) = uVar2;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","ch_width");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","beacon_interval",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    sStack_78e = (short)iVar4;
  }
  *(int *)((int)local_f18 + iVar1) = (int)sStack_78e;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_beacon_interval");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","dtim_period",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    sStack_78a = (short)iVar4;
  }
  *(int *)((int)local_f18 + iVar1) = (int)sStack_78a;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_dtim_period");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","encrypt",acStack_584,0x200);
  uVar2 = local_de8;
  if (iVar4 == 0) {
    uVar5 = atoi(acStack_584);
    uVar5 = uVar5 & 0xff;
    uVar2 = uVar5;
    if ((uVar5 != 0) && (uVar5 != 1)) {
      if (uVar5 == 2) {
        local_de8 = uVar5;
        iVar4 = FUN_00016110("wlan0","wpa_cipher",acStack_584,0x200);
      }
      else if (uVar5 == 4) {
        local_de8 = 3;
        iVar4 = FUN_00016110("wlan0","wpa2_cipher",acStack_584,0x200);
      }
      else {
        uVar2 = local_de8;
        if (uVar5 != 6) goto LAB_0003188c;
        local_de8 = 4;
        iVar4 = FUN_00016110("wlan0","wpa2_cipher",acStack_584,0x200);
      }
      uVar2 = local_de8;
      if (iVar4 == 0) {
        local_9a8 = atoi(acStack_584);
        local_9a8 = local_9a8 + -1;
        uVar2 = local_de8;
      }
    }
  }
LAB_0003188c:
  local_de8 = uVar2;
  *(uint *)((int)local_f18 + iVar1) = local_de8;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_security");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  memset(acStack_60,0,0x40);
  iVar4 = FUN_00016110("wlan0","auth_type",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar2 = atoi(acStack_584);
    if ((uVar2 & 0xff) == 0) {
      local_de0 = 1;
    }
    else if ((uVar2 & 0xff) == 1) {
      local_de0 = 2;
    }
    else {
      local_de0 = 3;
    }
  }
  *(undefined4 *)((int)local_f18 + iVar1) = local_de0;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_auth");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0",&DAT_00070180,acStack_584,0x200);
  if (iVar4 == 0) {
    uVar2 = atoi(acStack_584);
    uVar2 = uVar2 & 0xff;
    if (uVar2 == 1) {
      local_ddc = 0;
    }
    else if (uVar2 == 2) {
      local_ddc = 1;
    }
  }
  else {
    uVar2 = 0;
  }
  *(undefined4 *)((int)local_f18 + iVar1) = local_ddc;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_len");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","wep_default_key",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar6 = atoi(acStack_584);
    uVar5 = uVar6 & 0xff;
    local_de4 = (byte)uVar6;
  }
  else {
    uVar5 = (uint)local_de4;
  }
  *(uint *)((int)local_f18 + iVar1) = uVar5;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_default_index");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","wep_key_type",acStack_584,0x200);
  if (iVar4 == 0) {
    uVar5 = atoi(acStack_584);
    uVar5 = uVar5 & 0xff;
    if (uVar5 == 0) {
      local_dd8 = 1;
      local_ccc = 1;
      local_bc0 = 1;
      local_ab4 = 1;
    }
    else if (uVar5 == 1) {
      local_dd8 = 0;
      local_ccc = 0;
      local_bc0 = 0;
      local_ab4 = 0;
    }
  }
  else {
    uVar5 = 0;
  }
  if (uVar2 == 1) {
    uVar7 = 0x40;
  }
  else {
    uVar7 = 0x80;
  }
  if (uVar5 == 0) {
    puVar8 = &DAT_000700b4;
  }
  else {
    puVar8 = &DAT_000700b8;
  }
  *(undefined **)((int)local_f18 + iVar1) = puVar8;
  snprintf(acStack_60,0x3f,"wepkey1_%d_%s",uVar7);
  iVar4 = FUN_00016110("wlan0",acStack_60,acStack_584,0x200);
  if (iVar4 == 0) {
    if (uVar5 == 0) {
      FUN_0001602c(acStack_584,acStack_dd4,0x107);
    }
    else {
      sVar3 = strlen(acStack_584);
      strncpy(acStack_dd4,acStack_584,sVar3);
    }
  }
  *(undefined4 *)((int)local_f18 + iVar1) = local_dd8;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type1");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  sVar3 = strlen(acStack_dd4);
  FUN_000158b8(acStack_dd4,sVar3);
  *(char **)((int)local_f18 + iVar1) = acStack_dd4;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str1");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(undefined4 *)((int)local_f18 + iVar1) = local_ccc;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type2");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  if (uVar2 == 1) {
    uVar7 = 0x40;
  }
  else {
    uVar7 = 0x80;
  }
  if (uVar5 == 0) {
    puVar8 = &DAT_000700b4;
  }
  else {
    puVar8 = &DAT_000700b8;
  }
  *(undefined **)((int)local_f18 + iVar1) = puVar8;
  snprintf(acStack_60,0x3f,"wepkey2_%d_%s",uVar7);
  iVar4 = FUN_00016110("wlan0",acStack_60,acStack_584,0x200);
  if (iVar4 == 0) {
    if (uVar5 == 0) {
      FUN_0001602c(acStack_584,acStack_cc8,0x107);
    }
    else {
      sVar3 = strlen(acStack_584);
      strncpy(acStack_cc8,acStack_584,sVar3);
    }
  }
  sVar3 = strlen(acStack_cc8);
  FUN_000158b8(acStack_cc8,sVar3);
  *(char **)((int)local_f18 + iVar1) = acStack_cc8;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str2");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(undefined4 *)((int)local_f18 + iVar1) = local_bc0;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type3");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  if (uVar2 == 1) {
    uVar7 = 0x40;
  }
  else {
    uVar7 = 0x80;
  }
  if (uVar5 == 0) {
    puVar8 = &DAT_000700b4;
  }
  else {
    puVar8 = &DAT_000700b8;
  }
  *(undefined **)((int)local_f18 + iVar1) = puVar8;
  snprintf(acStack_60,0x3f,"wepkey3_%d_%s",uVar7);
  iVar4 = FUN_00016110("wlan0",acStack_60,acStack_584,0x200);
  if (iVar4 == 0) {
    if (uVar5 == 0) {
      FUN_0001602c(acStack_584,acStack_bbc,0x107);
    }
    else {
      sVar3 = strlen(acStack_584);
      strncpy(acStack_bbc,acStack_584,sVar3);
    }
  }
  sVar3 = strlen(acStack_bbc);
  FUN_000158b8(acStack_bbc,sVar3);
  *(char **)((int)local_f18 + iVar1) = acStack_bbc;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str3");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(undefined4 *)((int)local_f18 + iVar1) = local_ab4;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type4");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  if (uVar2 == 1) {
    uVar7 = 0x40;
  }
  else {
    uVar7 = 0x80;
  }
  if (uVar5 == 0) {
    puVar8 = &DAT_000700b4;
  }
  else {
    puVar8 = &DAT_000700b8;
  }
  *(undefined **)((int)local_f18 + iVar1) = puVar8;
  snprintf(acStack_60,0x3f,"wepkey4_%d_%s",uVar7);
  iVar4 = FUN_00016110("wlan0",acStack_60,acStack_584,0x200);
  if (iVar4 == 0) {
    if (uVar5 == 0) {
      FUN_0001602c(acStack_584,acStack_ab0,0x107);
    }
    else {
      sVar3 = strlen(acStack_584);
      strncpy(acStack_ab0,acStack_584,sVar3);
    }
  }
  sVar3 = strlen(acStack_ab0);
  FUN_000158b8(acStack_ab0,sVar3);
  *(char **)((int)local_f18 + iVar1) = acStack_ab0;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str4");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(int *)((int)local_f18 + iVar1) = local_9a8;
  snprintf(acStack_380,0x1ff,"\"%s\":%d,","bm_wlan_wpa_type");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","wpa_psk",acStack_584,0x200);
  if (iVar4 == 0) {
    sVar3 = strlen(acStack_584);
    strncpy(acStack_9a4,acStack_584,sVar3);
  }
  sVar3 = strlen(acStack_9a4);
  FUN_000158b8(acStack_9a4,sVar3);
  *(char **)((int)local_f18 + iVar1) = acStack_9a4;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\",","bm_wlan_wpa_password");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(uint *)((int)local_f18 + iVar1) = (uint)DAT_0007debb;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","bm_macFilter_mode");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  iVar4 = FUN_00016110("wlan0","wsc_disabled",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    if (iVar4 == 0) {
      iVar4 = FUN_00016110("wlan0","wsc_method",acStack_584,0x200);
      if (iVar4 == 0) {
        iVar4 = atoi(acStack_584);
        if (iVar4 == 1) {
          local_180 = 2;
        }
        else {
          local_180 = 1;
        }
      }
    }
    else {
      local_180 = 0;
    }
  }
  iVar4 = FUN_00016110("wlan0","wsc_configured",acStack_584,0x200);
  if (iVar4 == 0) {
    iVar4 = atoi(acStack_584);
    if (iVar4 == 0) {
      local_164 = 1;
    }
    else {
      local_164 = 2;
    }
  }
  iVar4 = FUN_00016110("wlan0","wsc_pin",acStack_584,0x200);
  if (iVar4 == 0) {
    sVar3 = strlen(acStack_584);
    strncpy(acStack_178,acStack_584,sVar3);
  }
  *(undefined4 *)((int)local_f18 + iVar1) = local_164;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","bm_wps_enable");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(undefined4 *)((int)local_f18 + iVar1) = local_180;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","bm_wps_type");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  if (local_17c == 1) {
    *(undefined4 *)((int)local_f18 + iVar1) = 2;
    snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","bm_wps_pin_mode");
  }
  else {
    *(undefined4 *)((int)local_f18 + iVar1) = 1;
    snprintf(acStack_380,0x1ff,"\"%s\":\"%d\",","bm_wps_pin_mode");
  }
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  *(char **)((int)local_f18 + iVar1) = acStack_178;
  snprintf(acStack_380,0x1ff,"\"%s\":\"%s\"","bm_wps_ap_pin");
  sVar3 = strlen(acStack_380);
  FCGX_PutStr(acStack_380,sVar3,param_1);
  FCGX_PutStr(&DAT_0006ffa8,1,param_1);
  return 200;
}

