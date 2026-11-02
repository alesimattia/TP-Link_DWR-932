---
name: dwr932-f1-cpufreq
description: DWR-932 F1 fw 01.11 - governor e limiti di frequenza della CPU FATTI 2026-11-02: comportamento stock reale (kernel performance → power_config ondemand → pe_service commuta per carico), thermal-engine, patch dati di pe_service con hook custom_cpufreq.sh, sezione in custom.cgi, deploy, test, limiti
metadata:
  type: project
---
UI/deploy → [[dwr932-f1-webui-mod]]. Inventario funzioni → [[dwr932-f1-hidden-features]]. Root/adb → [[dwr932-f1-rootaccess]].

RICHIESTA UTENTE (2026-11-02): governor selezionabile dalla pagina custom.cgi + frequenza minima e massima; default = comportamento di prima delle modifiche. L'utente credeva "CPU fissa a 998 MHz": FALSO (vedi sotto) → default scelto = "auto" (stock reale); "performance" = fissa al massimo, selezionabile. Se l'utente chiede di nuovo "default al massimo", il default è solo il fallback di leggi_governor/cgov (auto).

STOCK REALE (verificato su device + RE)
- cpu0 unico core, driver "msm", freq 300000 600000 748800 998400 kHz; governor compilati: performance powersave userspace ondemand conservative; kernel CONFIG_CPU_FREQ_DEFAULT_GOV_PERFORMANCE (/proc/config.gz).
- /etc/rc5.d/S50power_config: soc_id 149 (ramo 9x25) → echo ondemand > scaling_governor (+ power collapse). ondemand stock: sampling_rate 10000, up_threshold 95, down_differential 3, io_is_busy 0, sampling_down_factor 1.
- pe_service (/bmdefsys/usr/bin, 5 processi, avviato da /bmdefsys/etc/init.d/start_pe_service_le; md5 originale 774198f3…, sha256 efa94d89…): FUN_0000c128 (power_led_monitor, LED/SMS/deep sleep) a fine ciclo chiama FUN_0000b5b8 = carico % da /proc/stat su 1 s; carico >= 51 (0x33) → FUN_0000b5f0 = system("echo performance > …/scaling_governor") (stringa 0xe064, file 0x6064); dopo 61 (0x3d) campioni consecutivi < 51 → FUN_0000b600 = system("echo ondemand > …") (0xe0b0, file 0x60b0). Latch bVar1/bVar2: scrive solo sulle transizioni. Ciclo ~2 s → ~2 min di riposo prima di ondemand. Blocco eseguito solo se DAT_0000fcdc != 0 (stato deep sleep impostato dal segnale di deep_sleep_server, handler FUN_0000954c).
- Misurato prima delle modifiche: 95% del tempo a 300 MHz (time_in_state), governor ondemand. La vecchia nota "performance fisso @998" era un campione preso sotto carico.
- mbimd: scrive performance solo durante aggiornamento firmware MBIM (qbi_fwupd_linux.c) → irrilevante.
- thermal-engine 01.11 (md5 f9cb13e5…, diverso dal 01.04; copia in scratchpad, non versionata): nessun /etc/thermal-engine.conf (config built-in). FUN_00012bd4(cpu,freq) scrive scaling_max_freq e abbassa scaling_min_freq se freq < min. Chiamata dalla richiesta del dispositivo "cpu" (codice non delimitato da Ghidra a 0x13510: scrive solo se il livello cambia rispetto all'ultimo applicato, iniziale = cpuinfo_max; a fine mitigazione scrive cpuinfo_max 998400) e dall'handler hotplug FUN_00012d94 (mai attivo: 1 core). msm_thermal del kernel: enabled=N. Temperature a riposo ~38 °C (tsens_tz_sensor0-4, gradi interi); thermal_zone5/6 = pa_therm0 (valori tipo 763573) e pa_therm1: la pagina considera solo tsens_tz_sensor*.
- Il kernel 3.4 conserva min/max al cambio di governor (verificato).

IMPLEMENTAZIONE (sorgenti in analysis/device-pull-0111/modified/)
- bm_custom.conf: cpu_governor=auto|performance|ondemand|conservative|powersave, cpu_min_freq, cpu_max_freq (kHz tra le disponibili, min <= max). Assenti/invalidi → auto + cpuinfo_min/max.
- pe_service modificato (tools/pe_service_patch.py, verifica sha256 originale; 138 byte, solo le 2 stringhe, NUL in coda): "/bmdefsys/usr/bin/custom_cpufreq.sh pe performance|ondemand". md5 2cddca0c…, sha256 03ae0468…. Copia in modified/pe_service. Backup sul device /cache/pe_service.orig.
- custom_cpufreq.sh (/bmdefsys/usr/bin, root 755): `applica` = min:=cpuinfo_min, max:=FMAX, min:=FMIN (ordine valido da qualunque stato), poi governor (auto → ultima richiesta di pe_service in /tmp/custom_cpufreq.pe, altrimenti ondemand); `pe <gov>` = registra in /tmp/custom_cpufreq.pe e applica solo se auto. Scrive il governor solo se diverso.
- init.d/custom_cpufreq + /etc/rc5.d/S99custom_cpufreq: start = applica (dopo S50power_config).
- custom.cgi: sezione "CPU: governor e frequenze" dopo Beacon e DTIM (stato: governor in uso, frequenza, limiti, time_in_state %, temperatura max tsens; avvisi se limiti ≠ salvati o pe_service non modificato/in attesa di riavvio via /proc/<pid>/exe "(deleted)"); POST action=cpu (gov in whitelist, fmin/fmax in scaling_available_frequencies, err_cpu se min > max) → conf_set ×3 + applica → 303 cpu_ok|err_val|err_cpu. Nessun riavvio.
- Hash 2026-11-02: custom.cgi 95f645db…, custom_cpufreq.sh 9f9a25fc…, init 9a6a5c6f…, pe_service 03ae0468….

DEPLOY / RIPRISTINO
- tools/dwr_deploy_ui.sh: richiede anche /cache/custom_cpufreq.sh.new, custom_cpufreq.init.new, pe_service.new (md5 verificato); accetta pe_service installato solo se originale o già modificato; sostituzione con cp -p + cat su .tmp + mv (cat > sul file in esecuzione = ETXTBSY). Il nuovo pe_service è attivo solo DOPO UN RIAVVIO. `--ripristina` rimette /cache/pe_service.orig, toglie script/init/link, riporta 300000-998400 + ondemand.
- Upgrade firmware: sovrascrive pe_service e cancella tutto; reset di fabbrica: no (bm_custom.conf e /bmdefsys/usr/bin non toccati).

TEST (2026-11-02, note in analysis/notes/device-cpufreq-*.txt)
- deploy OK; boot (tools/dwr_cpufreq_boot.sh prepara|verifica) 5/5: dopo riavvio S99 applica powersave 300000-748800 sopra l'ondemand di power_config; pe_service caricato dal file modificato; l'hook aveva già registrato "performance" del boot e ignorato.
- tools/dwr_cpufreq_test.sh 42/42 (pagina, 401, CSRF/Origin, validazione, effetti in sysfs, pe, configurazioni corrotte). "tr: short write" = rumore di grep -q.
- tools/dwr_cpufreq_e2e.sh (staccato con setsid + sleep 2, log /cache/cpufreq_e2e.log, ~10 min; durante l'esecuzione niente adb frequente): 14/14 (device-cpufreq-e2e-0111.txt): auto → performance 2 s dopo il carico, 998,4 MHz, ondemand dopo 125-126 s di riposo; powersave 300-748,8 resta powersave a 300 MHz per 15 s di carico, richiesta performance registrata e ignorata; ritorno ad auto riprende la richiesta in sospeso.
- STATO LASCIATO: auto, 300000-998400 (= stock).

LIMITI
- Mitigazione termica: thermal-engine vince; a fine mitigazione i limiti tornano 300–998,4 MHz fino al prossimo Applica/riavvio (la pagina lo segnala). Non contrastato di proposito.
- Applica durante una mitigazione attiva rialza il massimo (thermal-engine non riscrive finché il livello non cambia): rischio basso, temperature normali ~38 °C.
- powersave/massimo basso: riduce throughput Wi-Fi/routing (driver rtl8192es SDIO usa la CPU).
- userspace escluso: ridondante con min/max (performance+max X o powersave+min X = frequenza fissa X).
