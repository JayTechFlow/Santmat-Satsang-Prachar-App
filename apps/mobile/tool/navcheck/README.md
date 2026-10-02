# Physical back-navigation checks

Hardware verification for the canonical Back policy. `test/navigation/` proves
the logic against a simulated navigator; this proves the shipped APK against
the real Android Back key, the real IME, and a real process.

## Prerequisites

- `adb` on the `PATH`, device unlocked, USB debugging authorised.
- The release APK installed and signed in:
  ```bash
  flutter build apk --release
  adb install -r build/app/outputs/flutter-apk/app-release.apk
  ```
- A signed-in account whose catalogue search returns a hit, and at least one
  saved favourite. Case O1 needs a matching query; G1 needs a favourite and
  otherwise reports `SKIPPED` rather than a false pass.

Pin a device with `ANDROID_SERIAL` if more than one is attached.

## Running

```bash
cd apps/mobile/tool/navcheck
python3 back_matrix.py          # full 17-case matrix
python3 harness.py              # ad-hoc: print the foreground screen's labels
```

`harness.py` also works standalone — it dumps the visible text of whatever is
currently on screen, which is the quickest way to find a label to assert on.

## What it asserts

For every case the app must still be in the foreground afterwards, so Back can
never exit the app from a secondary screen, and the expected destination screen
must be showing. The process id is captured so an accidental exit is
unambiguous rather than inferred from a screenshot.

Covered: the four tabs, Search reached from a non-Home tab, the AppBar back
affordance, Search → Player → Back → Search, Audio → Player → Back → Audio,
both drawer destinations, the nested player from a favourite, ten bottom-nav
cycles, root double-back exit including the expired-window case, and ten cold
starts. The run ends by reading the logcat buffer and failing if any
`FATAL EXCEPTION`, `E/flutter`, `ANR`, `WIN DEATH`, or layout overflow is
present.

## Notes on brittleness

- Assertions match on visible Hindi labels, so a copy change to the tested
  strings will surface as a failure rather than a silent pass.
- Tap targets are resolved from the accessibility hierarchy by label wherever
  one exists. The few that genuinely cannot be — catalogue rows and the shell
  mini player — are expressed as ratios of the screen, so the checks survive a
  change of pixel density.
- `verify_geometry()` enforces only the aspect ratio. On a device with a
  different aspect ratio the script refuses to run, because the ratio-based
  taps would land on arbitrary pixels and the results would mean nothing. Re-derive
  the points in `back_matrix.py` and re-run before trusting a new layout.
- Case S1 may report `presses=2`: on Search the soft keyboard consumes the first
  Back and the second reaches the app. That is IME behaviour, not a navigation
  defect.
