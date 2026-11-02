
undefined4 FUN_00019fac(byte *param_1)

{
  int iVar1;
  FILE *__stream;
  int iVar2;
  undefined4 uVar3;
  undefined *puVar4;
  int iVar5;
  int iVar6;
  byte *pbVar7;
  uint uVar8;
  char acStack_8c [104];
  
  memset(acStack_8c,0,100);
  __stream = fopen("/bmdefsys/etc/bm_config.conf","wb");
  if (__stream == (FILE *)0x0) {
    syslog(3,"%s %d : open %s Fail ","bm_write_config_xml",0x62a,"/bmdefsys/etc/bm_config.conf");
    uVar3 = 0xffffffff;
  }
  else {
    fprintf(__stream,"%s%d\n","NTPEnable=",(uint)*param_1);
    fprintf(__stream,"%s%s\n","NTPServer=",param_1 + 1);
    fprintf(__stream,"%s%s\n","NTPServer2=",param_1 + 0x100);
    fprintf(__stream,"%s%s\n","NTPServer3=",param_1 + 0x1ff);
    fprintf(__stream,"%s%s\n","NTPServer4=",param_1 + 0x2fe);
    fprintf(__stream,"%s%d\n","NTPTimeout=",*(undefined4 *)(param_1 + 0x400));
    fprintf(__stream,"%s%d\n","NTPRetrySleep=",*(undefined4 *)(param_1 + 0x404));
    fprintf(__stream,"%s%d\n","NTPSyncInterval=",*(undefined4 *)(param_1 + 0x408));
    fprintf(__stream,"%s%s\n","Timezone=",param_1 + 0x40c);
    fprintf(__stream,"%s%d\n","TZ_DST_ENABLE=",(uint)param_1[0x42c]);
    fprintf(__stream,"%s%d\n","TZ_DST_START_M=",(uint)param_1[0x42d]);
    fprintf(__stream,"%s%d\n","TZ_DST_START_W=",(uint)param_1[0x42e]);
    fprintf(__stream,"%s%d\n","TZ_DST_START_D=",(uint)param_1[0x42f]);
    fprintf(__stream,"%s%d\n","TZ_DST_START_CLOCK=",(uint)param_1[0x430]);
    fprintf(__stream,"%s%d\n","TZ_DST_END_M=",(uint)param_1[0x431]);
    fprintf(__stream,"%s%d\n","TZ_DST_END_W=",(uint)param_1[0x432]);
    fprintf(__stream,"%s%d\n","TZ_DST_END_D=",(uint)param_1[0x433]);
    fprintf(__stream,"%s%d\n","TZ_DST_END_CLOCK=",(uint)param_1[0x434]);
    fprintf(__stream,"%s%d\n","web_language=",(uint)param_1[0x435]);
    fprintf(__stream,"%s%d\n","LanIp6Mode=",(uint)param_1[0x436]);
    fprintf(__stream,"%s%s\n","IP6_Priamry_DNS=",param_1 + 0x437);
    fprintf(__stream,"%s%s\n","IP6_Secondary_DNS=",param_1 + 0x477);
    fprintf(__stream,"%s%s\n","system_profile=",param_1 + 0x4b7);
    fprintf(__stream,"%s%s\n","gsm_default_profile=",param_1 + 0x8b7);
    fprintf(__stream,"%s%s\n","lte_default_profile=",param_1 + 0x937);
    fprintf(__stream,"%s%s\n","gpp2_default_profile=",param_1 + 0x9b7);
    fprintf(__stream,"%s%d\n","MacFilterMode=",(uint)param_1[0xa37]);
    fwrite("WiFi_MacFilter_List=",1,0x14,__stream);
    uVar8 = (uint)param_1[0xa38];
    if (uVar8 != 0) {
      iVar5 = 0;
      pbVar7 = param_1;
LAB_0001a2f8:
      do {
        if (iVar5 == 0) {
          puVar4 = &DAT_0006be88;
          if (param_1[0xa39] != 0) {
            puVar4 = &DAT_0006be84;
          }
          fprintf(__stream,"%s,%s,%s",puVar4,param_1 + 0xa3a,param_1 + 0xa5b);
          uVar8 = (uint)param_1[0xa38];
          iVar5 = 1;
          pbVar7 = pbVar7 + 0xb6;
          if (uVar8 < 2) break;
          goto LAB_0001a2f8;
        }
        iVar6 = 0;
        iVar1 = iVar5 * 0xb6;
        do {
          iVar2 = iVar6 * 0xb6;
          iVar6 = iVar6 + 1;
          iVar2 = strncasecmp((char *)(param_1 + iVar1 + 0xa5b),(char *)(param_1 + iVar2 + 0xa5b),
                              0x12);
          if (iVar2 == 0) {
            iVar5 = iVar5 + 1;
            pbVar7 = pbVar7 + 0xb6;
            if (iVar5 < (int)uVar8) goto LAB_0001a2f8;
            goto LAB_0001a358;
          }
        } while (iVar6 != iVar5);
        if (pbVar7[0xa39] == 0) {
          puVar4 = &DAT_0006be88;
        }
        else {
          puVar4 = &DAT_0006be84;
        }
        iVar6 = iVar5 * 0xb6;
        iVar5 = iVar5 + 1;
        pbVar7 = pbVar7 + 0xb6;
        fprintf(__stream,";%s,%s,%s",puVar4,param_1 + iVar6 + 0xa3a,param_1 + iVar1 + 0xa5b);
        uVar8 = (uint)param_1[0xa38];
        if ((int)uVar8 <= iVar5) break;
      } while( true );
    }
LAB_0001a358:
    fputc(10,__stream);
    fprintf(__stream,"%s%s\n","Country_code=",param_1 + 0x1155);
    fprintf(__stream,"%s%s\n","Default_lan_ip=",param_1 + 0x1158);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_default=",(uint)param_1[0x1167]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_enable=",(uint)param_1[0x1168]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_Schedule_hour=",(uint)param_1[0x1169]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_Schedule_minute=",(uint)param_1[0x116a]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_Schedule_Type=",(uint)param_1[0x116b]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_Schedule_WEEK=",(uint)param_1[0x116c]);
    fprintf(__stream,"%s%d\n","AUTOREBOOT_Schedule_DAY=",(uint)param_1[0x116d]);
    fprintf(__stream,"%s%d\n","AUTO_LOGOUT_TIME=",*(undefined4 *)(param_1 + 0x1170));
    fprintf(__stream,"%s%s\n","IP_REDIRECT=",param_1 + 0x1174);
    fprintf(__stream,"%s%d\n","batteryidletime=",(uint)param_1[0x1274]);
    fprintf(__stream,"%s%d\n","deepsleeptime=",(uint)param_1[0x1275]);
    fprintf(__stream,"%s%d\n","urlFilterEnable=",(uint)param_1[0x1276]);
    fprintf(__stream,"%s%s\n","urlFilterKeywords=",param_1 + 0x1277);
    fprintf(__stream,"%s%d\n","samba=",(uint)param_1[0x1637]);
    fprintf(__stream,"%s%d\n","netstat_enable=",(uint)param_1[0x1638]);
    fprintf(__stream,"%s%d\n","quota_limit=",*(undefined4 *)(param_1 + 0x163c));
    fprintf(__stream,"%s%d\n","week_start=",(uint)param_1[0x1640]);
    fprintf(__stream,"%s%d\n","recount_mday=",(uint)param_1[0x1641]);
    fprintf(__stream,"%s%d\n","block_onlimit=",(uint)param_1[0x1642]);
    fprintf(__stream,"%s%d\n","DefaultPasswd=",(uint)param_1[0x1643]);
    fprintf(__stream,"%s%d\n","nodogsplash_enable=",(uint)param_1[0x1644]);
    fprintf(__stream,"%s%s\n","nodogsplash_url=",param_1 + 0x1645);
    fprintf(__stream,"%s%s\n","nodogsplash_trusted_mac=",param_1 + 0x1a46);
    fprintf(__stream,"%s%d\n","wwan_ping_enable=",(uint)param_1[0x1baf]);
    fprintf(__stream,"%s%d\n","netstat_sim_type=",(uint)param_1[0x1bb0]);
    fprintf(__stream,"%s%d\n","netstat_data_total=",*(undefined4 *)(param_1 + 0x1bc4));
    fprintf(__stream,"%s%s\n","netstat_validity_period=",param_1 + 0x1bb1);
    fprintf(__stream,"%s%d\n","netstat_auto_check=",(uint)param_1[0x1bc8]);
    fprintf(__stream,"%s%d\n","lcd_off_time=",*(undefined4 *)(param_1 + 0x1bcc));
    fprintf(__stream,"%s%d\n","lcd_off_password=",*(undefined4 *)(param_1 + 0x1bd0));
    fprintf(__stream,"%s%d\n","wwan_upnp_disable=",(uint)param_1[0x1bd4]);
    fprintf(__stream,"%s%d\n","wwan_flood_block=",(uint)param_1[0x1bd5]);
    fprintf(__stream,"%s%d\n","webLogin_lock_time=",*(undefined4 *)(param_1 + 0x1bd8));
    fprintf(__stream,"%s%d\n","manual_wwanDns_enable=",(uint)param_1[0x1bdc]);
    fprintf(__stream,"%s%s\n","manual_priWwanDns_addr=",param_1 + 0x1bdd);
    fprintf(__stream,"%s%s\n","manual_secWwanDns_addr=",param_1 + 0x1bed);
    fprintf(__stream,"%s%d\n","apn_profile_mode=",(uint)param_1[0x1bfd]);
    fprintf(__stream,"%s%d\n","first_login=",(uint)param_1[0x1bfe]);
    fclose(__stream);
    FUN_000133f4(0);
    snprintf(acStack_8c,99,"fsync %s","/bmdefsys/etc/bm_config.conf");
    system(acStack_8c);
    uVar3 = 0;
  }
  return uVar3;
}

