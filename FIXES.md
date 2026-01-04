# Flight Ops Dashboard - Fixes Tracker

## Schedule Tab Fixes

- [x] Remove "enter your flight roster below" text
- [x] Fix tail number button - no entry box was appearing
- [x] Fix flight number button - no entry box was appearing
- [x] Fix Add Sector button - was not adding sectors
- [x] Tail picker: Add common fleet letters at top (F, M, N, E, G, P, K)
- [x] Tail picker: Remove numbers (Dubai tails don't have numbers)
- [x] Tail picker: Fix layout so letters don't overflow the box
- [ ] Auto-capitalize inputs (stand number, tail number, etc.)
- [ ] Time picker OK button should close the modal
- [ ] Add time difference display between STD/ATD and STA/ATA (delays)
- [ ] Redesign sector layout: Column 1 = STD (top) / STA (bottom), Column 2 = OOOI with O and I aligned to STD/STA, delays next to that
- [ ] Schedule times disappear on page refresh (localStorage not saving)

## Timers Tab Fixes

- [x] Fix blank Timers page
- [x] Timers flash continuously when done until reset

## NAV Tab Features

- [x] Coordinates / LIDO Converter
  - Supports input: Decimal degrees, DMS, DMM compact (N25151E055218), LIDO Formats 1-3, ARINC 424
  - Outputs all formats: DD, DMS, DMM, DMM Compact, LIDO 1/2/3, ARINC 424
  - Auto-detects input format
  - Validates coordinate ranges

## LMC Tab (Last Minute Change Calculator)

- [x] LMC Calculator with correction tables
  - Aircraft: 737-800, 737-8, 737-9 (all 189Y config)
  - PAX zones: OA (front), OB (mid), OC (rear)
  - Cargo zones: FH (forward hold), AH (aft hold), BLK (bulk)
  - Fuel zones: CTR (center tank), WING (wing tanks)
  - Calculates weight changes and IU corrections
  - Validates: Weight ≤500kg, IU ≤5.0, ZFW ≥45,000kg
  - Checks MZFW, RTOW, RLW limits
  - Manual method: max 3 changes, Skybook: max 10
  - Outputs PASS/REJECT with new loadsheet / performance recalc guidance

## Future Features

- [ ] ETOPS FMC message builder
- [ ] 126.9 call builder (position reports)

## Info Strip Fixes

- [x] UTC and DXB time not showing

## Technical Fixes Applied

- Changed `let` to `var` for ALL global variables to fix scoping issues:
  - currentSectorCount, flightPickerFieldId, flightPickerValue, flightPickerSuffix, tailPickerValue
  - pickerCallback, pickerValue, pickerMaxLength, pickerFormatCommas, pickerFirstInput
  - selectedAircraft, timers, animationFrameId, etaManualStartTime
  - lastFrameTime, fdpSetupCollapsed, isaTempNegative, scratchpadHistory
- Moved `currentSectorCount` declaration to top of script for proper initialization
- Set up systemd service and lighttpd proxy on Raspberry Pi

## Deployment Notes

- Local dev: `/home/chasingskye/adsb-air/`
- Pi location: `/home/adsbpi-air/adsb-air/`
- Pi SSH: `ssh -i ~/.ssh/adsbpi-air adsbpi-air@192.168.33.125`
- Sync command: `rsync -avz -e "ssh -i ~/.ssh/adsbpi-air" /home/chasingskye/adsb-air/public/index.html adsbpi-air@192.168.33.125:/home/adsbpi-air/adsb-air/public/index.html`
- Restart service: `ssh -i ~/.ssh/adsbpi-air adsbpi-air@192.168.33.125 "sudo systemctl restart adsb-dashboard"`
- Access URL: `10.30.3.1/dashboard` (via Pi AP)
