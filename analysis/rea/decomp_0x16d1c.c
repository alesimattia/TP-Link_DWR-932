
undefined4 FUN_00016a94(undefined4 param_1,undefined4 param_2,uint param_3,undefined4 param_4)

{
  int iVar1;
  uint uVar2;
  char cStack000000fc;
  byte bStack000000fd;
  char in_stack_00000104;
  int in_stack_00000108;
  char in_stack_0000010c;
  char cStack00000110;
  byte bStack00000111;
  char cStack00000112;
  char cStack00000113;
  char cStack00000114;
  byte bStack00000115;
  char cStack00000116;
  int in_stack_00000118;
  byte in_stack_0000011c;
  int in_stack_00000120;
  int in_stack_00000124;
  char in_stack_0000012c;
  char in_stack_00000238;
  char in_stack_00000344;
  char in_stack_00000450;
  int in_stack_00000558;
  char in_stack_00000770;
  short in_stack_00000772;
  char in_stack_00000774;
  short in_stack_00000776;
  char in_stack_00000980;
  char acStack_248 [512];
  int local_48;
  int local_44;
  int local_40;
  int local_3c;
  int local_38;
  int local_34;
  int local_30;
  int local_2c;
  char local_7;
  char local_5;
  undefined4 uStack_4;
  
  uStack_4 = param_4;
  memset(acStack_248,0,0x200);
  local_7 = (char)(param_3 >> 8);
  if (local_7 != '\0') {
    uVar2 = param_3 >> 0x10 & 0xff;
    iVar1 = 1 - uVar2;
    if (1 < uVar2) {
      iVar1 = 0;
    }
    snprintf(acStack_248,0x1ff,"%d",iVar1);
    FUN_000161e8("wlan0","wlan_disabled",acStack_248);
  }
  local_5 = (char)(param_3 >> 0x18);
  if (local_5 != '\0') {
    FUN_000161e8("wlan0",&DAT_0006b0fc,&uStack_4);
  }
  if (cStack00000110 != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(uint)bStack00000111);
    FUN_000161e8("wlan0","channel",acStack_248);
    if ((byte)(bStack00000111 - 0xc) < 2) {
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
  }
  if (in_stack_00000104 != '\0') {
    if (in_stack_00000108 == 0) {
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0",&DAT_0006b130,acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
    else if (in_stack_00000108 == 3) {
      snprintf(acStack_248,0x1ff,"%d",2);
      FUN_000161e8("wlan0",&DAT_0006b130,acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
    else if (in_stack_00000108 == 4) {
      snprintf(acStack_248,0x1ff,"%d",8);
      FUN_000161e8("wlan0",&DAT_0006b130,acStack_248);
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
    else if (in_stack_00000108 == 1) {
      snprintf(acStack_248,0x1ff,"%d",3);
      FUN_000161e8("wlan0",&DAT_0006b130,acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
    else if (in_stack_00000108 == 2) {
      snprintf(acStack_248,0x1ff,"%d",0xb);
      FUN_000161e8("wlan0",&DAT_0006b130,acStack_248);
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","channel_bonding",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
    }
  }
  if (cStack00000112 != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(uint)(cStack00000113 != '\0'));
    FUN_000161e8("wlan0","channel_bonding",acStack_248);
    if (cStack00000113 == '\x01') {
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","autoch_1611_enable",acStack_248);
    }
    else if (cStack00000113 == '\0') {
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","autoch_1611_enable",acStack_248);
    }
    else if (cStack00000113 == '\x02') {
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","coexist_enabled",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","autoch_1611_enable",acStack_248);
    }
  }
  if (in_stack_00000770 != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(int)in_stack_00000772);
    FUN_000161e8("wlan0","beacon_interval",acStack_248);
  }
  if (in_stack_00000774 != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(int)in_stack_00000776);
    FUN_000161e8("wlan0","dtim_period",acStack_248);
  }
  if (cStack000000fc != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(uint)bStack000000fd);
    FUN_000161e8("wlan0","hidden_ssid",acStack_248);
  }
  if (cStack00000114 != '\0') {
    snprintf(acStack_248,0x1ff,"%d",(uint)bStack00000115);
    FUN_000161e8("wlan0","supported_sta_num",acStack_248);
  }
  if (in_stack_0000010c != '\0') {
    snprintf(acStack_248,0x1ff,"%d",1);
    FUN_000161e8("wlan0","countrycode_enable",acStack_248);
    snprintf(acStack_248,0x1ff,"%d",&stack0x0000010d);
    FUN_000161e8("wlan0","countrycode",acStack_248);
  }
  if (cStack00000116 != '\0') {
    if (in_stack_00000118 == 0) {
      snprintf(acStack_248,0x1ff,"%d",0);
      FUN_000161e8("wlan0","encrypt",acStack_248);
      FUN_000161e8("wlan0","wsc_auth",&DAT_0006b248);
      FUN_000161e8("wlan0","wsc_enc",&DAT_0006b248);
    }
    else if (in_stack_00000118 == 1) {
      uVar2 = (uint)in_stack_0000011c;
      snprintf(acStack_248,0x1ff,"%d",1);
      FUN_000161e8("wlan0","encrypt",acStack_248);
      snprintf(acStack_248,0x1ff,"%d",(uint)in_stack_0000011c);
      FUN_000161e8("wlan0","wep_default_key",acStack_248);
      if (in_stack_00000120 == 1) {
        snprintf(acStack_248,0x1ff,"%d",0);
        FUN_000161e8("wlan0","auth_type",acStack_248);
      }
      else if (in_stack_00000120 == 2) {
        snprintf(acStack_248,0x1ff,"%d",1);
        FUN_000161e8("wlan0","auth_type",acStack_248);
      }
      else {
        snprintf(acStack_248,0x1ff,"%d",2);
        FUN_000161e8("wlan0","auth_type",acStack_248);
      }
      iVar1 = in_stack_00000124;
      if (in_stack_00000124 == 0) {
        snprintf(acStack_248,0x1ff,"%d",1);
        FUN_000161e8("wlan0",&DAT_0006b188,acStack_248);
        if (*(int *)(&stack0x00000128 + uVar2 * 0x10c) == 0) {
          snprintf(acStack_248,0x1ff,"%d",1);
          FUN_000161e8("wlan0","wep_key_type",acStack_248);
          if (in_stack_0000012c != '\0') {
            FUN_000161e8("wlan0","wepkey1_64_hex",&stack0x0000012c);
          }
          if (in_stack_00000238 != '\0') {
            FUN_000161e8("wlan0","wepkey2_64_hex",&stack0x00000238);
          }
          if (in_stack_00000344 != '\0') {
            FUN_000161e8("wlan0","wepkey3_64_hex",&stack0x00000344);
          }
          if (in_stack_00000450 != '\0') {
            FUN_000161e8("wlan0","wepkey4_64_hex",&stack0x00000450);
          }
        }
        else {
          snprintf(acStack_248,0x1ff,"%d",0);
          FUN_000161e8("wlan0","wep_key_type",acStack_248);
          if (in_stack_0000012c != '\0') {
            local_48 = iVar1;
            local_44 = iVar1;
            local_40 = iVar1;
            local_3c = iVar1;
            local_38 = iVar1;
            local_34 = iVar1;
            local_30 = iVar1;
            local_2c = iVar1;
            FUN_00016090(&stack0x0000012c,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey1_64_asc",&local_48);
          }
          if (in_stack_00000238 != '\0') {
            local_48 = 0;
            local_44 = 0;
            local_40 = 0;
            local_3c = 0;
            local_38 = 0;
            local_34 = 0;
            local_30 = 0;
            local_2c = 0;
            FUN_00016090(&stack0x00000238,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey2_64_asc",&local_48);
          }
          if (in_stack_00000344 != '\0') {
            local_48 = 0;
            local_44 = 0;
            local_40 = 0;
            local_3c = 0;
            local_38 = 0;
            local_34 = 0;
            local_30 = 0;
            local_2c = 0;
            FUN_00016090(&stack0x00000344,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey3_64_asc",&local_48);
          }
          if (in_stack_00000450 != '\0') {
            local_48 = 0;
            local_44 = 0;
            local_40 = 0;
            local_3c = 0;
            local_38 = 0;
            local_34 = 0;
            local_30 = 0;
            local_2c = 0;
            FUN_00016090(&stack0x00000450,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey4_64_asc",&local_48);
          }
        }
      }
      else if (in_stack_00000124 == 1) {
        snprintf(acStack_248,0x1ff,"%d",2);
        FUN_000161e8("wlan0",&DAT_0006b188,acStack_248);
        if (*(int *)(&stack0x00000128 + uVar2 * 0x10c) == 0) {
          snprintf(acStack_248,0x1ff,"%d",1);
          FUN_000161e8("wlan0","wep_key_type",acStack_248);
          if (in_stack_0000012c != '\0') {
            FUN_000161e8("wlan0","wepkey1_128_hex",&stack0x0000012c);
          }
          if (in_stack_00000238 != '\0') {
            FUN_000161e8("wlan0","wepkey2_128_hex",&stack0x00000238);
          }
          if (in_stack_00000344 != '\0') {
            FUN_000161e8("wlan0","wepkey3_128_hex",&stack0x00000344);
          }
          if (in_stack_00000450 != '\0') {
            FUN_000161e8("wlan0","wepkey4_128_hex",&stack0x00000450);
          }
        }
        else {
          snprintf(acStack_248,0x1ff,"%d",0);
          FUN_000161e8("wlan0","wep_key_type",acStack_248);
          if (in_stack_0000012c != '\0') {
            memset(&local_48,0,0x20);
            FUN_00016090(&stack0x0000012c,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey1_128_asc",&local_48);
          }
          if (in_stack_00000238 != '\0') {
            memset(&local_48,0,0x20);
            FUN_00016090(&stack0x00000238,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey2_128_asc",&local_48);
          }
          if (in_stack_00000344 != '\0') {
            memset(&local_48,0,0x20);
            FUN_00016090(&stack0x00000344,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey3_128_asc",&local_48);
          }
          if (in_stack_00000450 != '\0') {
            memset(&local_48,0,0x20);
            FUN_00016090(&stack0x00000450,&local_48,0x1f);
            FUN_000161e8("wlan0","wepkey4_128_asc",&local_48);
          }
        }
      }
    }
    else if (in_stack_00000118 - 2U < 3) {
      snprintf(acStack_248,0x1ff,"%d",2);
      FUN_000161e8("wlan0","wpa_auth",acStack_248);
      if (in_stack_00000118 == 2) {
        snprintf(acStack_248,0x1ff,"%d");
        FUN_000161e8("wlan0","encrypt",acStack_248);
        snprintf(acStack_248,0x1ff,"%d",1);
        FUN_000161e8("wlan0","psk_enable",acStack_248);
        FUN_000161e8("wlan0","wsc_auth",&DAT_0006b36c);
      }
      else if (in_stack_00000118 == 3) {
        snprintf(acStack_248,0x1ff,"%d",4);
        FUN_000161e8("wlan0","encrypt",acStack_248);
        snprintf(acStack_248,0x1ff,"%d",2);
        FUN_000161e8("wlan0","psk_enable",acStack_248);
        FUN_000161e8("wlan0","wsc_auth",&DAT_0006b370);
      }
      else {
        snprintf(acStack_248,0x1ff,"%d",6);
        FUN_000161e8("wlan0","encrypt",acStack_248);
        snprintf(acStack_248,0x1ff,"%d",3);
        FUN_000161e8("wlan0","psk_enable",acStack_248);
        FUN_000161e8("wlan0","wsc_auth",&DAT_0006b370);
      }
      if (in_stack_00000118 == 2 || in_stack_00000118 == 4) {
        if (in_stack_00000558 == 0) {
          snprintf(acStack_248,0x1ff,"%d",1);
          FUN_000161e8("wlan0","wpa_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b374);
        }
        else if (in_stack_00000558 == 1) {
          snprintf(acStack_248,0x1ff,"%d",2);
          FUN_000161e8("wlan0","wpa_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b378);
        }
        else {
          snprintf(acStack_248,0x1ff,"%d",3);
          FUN_000161e8("wlan0","wpa_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b378);
        }
      }
      if (in_stack_00000118 - 3U < 2) {
        if (in_stack_00000558 == 0) {
          snprintf(acStack_248,0x1ff,"%d",1);
          FUN_000161e8("wlan0","wpa2_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b374);
        }
        else if (in_stack_00000558 == 1) {
          snprintf(acStack_248,0x1ff,"%d",2);
          FUN_000161e8("wlan0","wpa2_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b378);
        }
        else {
          snprintf(acStack_248,0x1ff,"%d",3);
          FUN_000161e8("wlan0","wpa2_cipher",acStack_248);
          FUN_000161e8("wlan0","wsc_enc",&DAT_0006b378);
        }
      }
      snprintf(acStack_248,0x1ff,"%s",&stack0x0000055c);
      FUN_000161e8("wlan0","wpa_psk",acStack_248);
    }
  }
  if (((cStack000000fc != '\0') && (bStack000000fd != 0)) ||
     ((cStack00000116 != '\0' &&
      ((in_stack_00000118 - 1U < 2 || ((in_stack_00000118 - 3U < 2 && (in_stack_00000558 == 0)))))))
     ) {
    FUN_000161e8("wlan0","wsc_disabled",&DAT_0006b248);
  }
  if (in_stack_00000980 == '\0') {
    system("/bmdefsys/usr/bin/rtltools/script/init.sh &");
  }
  system("sync");
  return 0;
}

