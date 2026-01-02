# ADS-B Pi System Overview

## What Is This?

This is a **portable ADS-B aircraft tracking station**. It:

1. **Receives ADS-B signals** from aircraft using an RTL-SDR radio dongle
2. **Decodes position/altitude/speed** data using readsb
3. **Creates its own WiFi hotspot** (`adsbpi-air`) so you can connect from any device
4. **Serves a live aircraft map** via tar1090 web interface
5. **Provides performance graphs** showing signal strength, aircraft counts, etc.

### Use Case
Connect your phone/tablet to the `adsbpi-air` WiFi network and open a browser to see real-time aircraft positions on a map - no internet required. Useful for aviation enthusiasts, pilots, or anyone wanting to track nearby aircraft.

### Current URLs (when connected to AP)
| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://10.30.3.1/dashboard/ | Flight ops dashboard |
| **Aircraft Map** | http://10.30.3.1/tar1090/ | Live aircraft positions |
| **Performance** | http://10.30.3.1/graphs1090/ | Signal/receiver stats |

---

## Flight Ops Dashboard

The custom dashboard provides flight crew tools accessible offline via the Pi's AP.

### Layout
```
┌─────────────────────────────────────────────┐
│  UTC Clock  │  Active Timer 1  │  Timer 2  │  <- Persistent strip
├─────────────────────────────────────────────┤
│  [Timers] [Tools] [Fuel] [Layover] [FDP]   │  <- Tab navigation
├─────────────────────────────────────────────┤
│              Tab Content                    │
└─────────────────────────────────────────────┘
```

### Active Timers Strip
Always visible at top of all pages:
- **UTC Clock** - Current Zulu time
- **Running Timers** - Mini progress rings with countdown values
- Click any timer to jump to Timers tab

### Tabs

| Tab | Features |
|-----|----------|
| **Timers** | 5 configurable countdown/stopwatch timers (APU, etc.) |
| **Tools** | OOOI calculator, ETA countdown, TOW calculator, Acceleration height, Max landing fuel |
| **Nav** | Crosswind calculator (graphical), Hold entry calculator (SVG), ISA deviation |
| **Fuel** | Fuel uplift verification, unit converter, tank split |
| **Layover** | Rest period calculator |
| **FDP** | Flight duty period calculator with live tracking |
| **Ref** | Timezone converter, Scratchpad (persistent), SNOWTAM/GRF decoder |

### Aircraft Presets
TOW and MLF calculators support: B738, B38M, B39M

### FZ Destination Timezones
UTC offset dropdowns include common flydubai destinations:
- UTC+0: LGW
- UTC+1: BEG/PRG/ZAG
- UTC+2: CAI/AMM/TLV/ATH
- UTC+3: RUH/JED/KWI/BAH/DOH
- UTC+3:30: IKA/THR
- UTC+4: DXB/MCT/TBS
- UTC+4:30: KBL
- UTC+5: KHI/LHE/ISB/TAS
- UTC+5:30: DEL/BOM/COK/CMB
- UTC+6: DAC/ALA
- UTC+7: BKK

---

## System Information

| Property | Value |
|----------|-------|
| Hostname | adsbpi-air |
| Hardware | Raspberry Pi 3 Model B Rev 1.2 |
| OS | Debian 13 (Trixie) aarch64 |
| Kernel | 6.12.47+rpt-rpi-v8 |
| RAM | 906 MB |
| Storage | 59 GB SD card (7.8 GB used) |
| User | adsbpi-air |

## Network Configuration

### Interfaces

| Interface | IP Address | Role |
|-----------|------------|------|
| eth0 | 192.168.33.125/24 (DHCP) | Main network uplink |
| wlan0 | 10.30.3.1/24 (static) | Access Point |

### Access Point (hostapd)

| Property | Value |
|----------|-------|
| SSID | adsbpi-air |
| Channel | 6 |
| Mode | 802.11n (2.4GHz) |
| Security | WPA2-PSK |
| Password | 12345678 |

### DHCP/DNS (dnsmasq)

- Serves DHCP on 10.30.3.0/24 subnet
- DNS resolver on 10.30.3.1:53

## SSH Access

```bash
ssh -i ~/.ssh/adsbpi-air adsbpi-air@192.168.33.125
# or via AP:
ssh -i ~/.ssh/adsbpi-air adsbpi-air@10.30.3.1
```

**SSH Key Location:** `~/.ssh/adsbpi-air` (private), `~/.ssh/adsbpi-air.pub` (public)

## ADS-B Stack

### readsb (ADS-B Decoder)

| Property | Value |
|----------|-------|
| Status | Enabled (fails without RTL-SDR) |
| Version | 3.16.8 |
| Config | /etc/default/readsb |
| JSON Output | /run/readsb/ |

**Ports:**
- 30001: Raw TCP input
- 30002: Raw TCP output
- 30003: SBS output (BaseStation format)
- 30004, 30104: Beast TCP input
- 30005: Beast TCP output

**Configuration:**
```
RECEIVER_OPTIONS="--device 0 --device-type rtlsdr --gain auto --ppm 0"
DECODER_OPTIONS="--max-range 450 --write-json-every 1"
NET_OPTIONS="--net-connector=127.0.0.1,2947,gpsd_in --net ..."
```

### tar1090 (Web Interface)

| Property | Value |
|----------|-------|
| Status | Running |
| URL | http://10.30.3.1/tar1090/ |
| Install Path | /usr/local/share/tar1090/ |

### graphs1090 (Performance Graphs)

| Property | Value |
|----------|-------|
| Status | Running |
| URL | http://10.30.3.1/graphs1090/ |
| Install Path | /usr/share/graphs1090/ |

### gpsd (GPS Daemon)

| Property | Value |
|----------|-------|
| Status | Running |
| Port | 2947 (localhost only) |
| Devices | None connected |

## Web Server (lighttpd)

| Port | Purpose |
|------|---------|
| 80 | Main web server |
| 8504 | tar1090 alternate port |
| 8542 | graphs1090 alternate port |

### URL Mappings

| URL Path | Local Path |
|----------|------------|
| /tar1090/ | /usr/local/share/tar1090/html/ |
| /tar1090/data/ | /run/readsb/ |
| /graphs1090/ | /usr/share/graphs1090/html/ |

## Running Services

| Service | Description |
|---------|-------------|
| hostapd | WiFi Access Point |
| dnsmasq | DHCP/DNS server |
| lighttpd | Web server |
| readsb | ADS-B decoder (needs RTL-SDR) |
| tar1090 | ADS-B web interface |
| graphs1090 | Performance graphs |
| collectd | System statistics |
| gpsd | GPS daemon |
| ssh | SSH server |
| NetworkManager | Network management |

## Enabled Services (systemd)

```
readsb.service
tar1090.service
graphs1090.service
lighttpd.service
collectd.service
hostapd.service
dnsmasq.service
ssh.service
NetworkManager.service
```

## Software Status

| Software | Installed |
|----------|-----------|
| Python 3.13 | Yes |
| Node.js | v20.19.6 |
| npm | v10.8.2 |
| Git | Yes (default) |

## Custom Services

### adsb-dashboard.service
- **Purpose:** Serves the Flight Ops dashboard
- **Port:** 3000 (proxied via lighttpd at /dashboard/)
- **Config:** `/etc/systemd/system/adsb-dashboard.service`
- **Project:** `/home/adsbpi-air/adsb-air/`

## Directory Structure

```
/etc/default/readsb          # readsb configuration
/etc/hostapd/hostapd.conf    # AP configuration
/etc/dnsmasq.conf            # DHCP/DNS configuration
/etc/lighttpd/               # Web server config
/usr/local/share/tar1090/    # tar1090 installation
/usr/share/graphs1090/       # graphs1090 installation
/run/readsb/                 # readsb JSON output (runtime)
/run/tar1090/                # tar1090 chunks (runtime)
/run/graphs1090/             # graphs images (runtime)
```

## Hardware Requirements

For full operation, connect:
1. **RTL-SDR dongle** - for ADS-B reception
2. **GPS receiver** - for accurate positioning and timing (optional)

## Dashboard Deployment

The Flight Ops dashboard is deployed and running:
- **URL:** http://10.30.3.1/dashboard/
- **Service:** `adsb-dashboard.service` (Node.js)
- **Proxy:** lighttpd `/dashboard` → localhost:3000
- **Config:** `/etc/lighttpd/conf-available/89-dashboard.conf`
