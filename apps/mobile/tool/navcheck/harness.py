#!/usr/bin/env python3
"""Shared device helpers for the physical back-navigation checks.

Every assertion in the matrix is driven through the real Android Back key and
the real accessibility hierarchy, never through Flutter's test framework, so a
pass here means the shipped APK behaves correctly on hardware.

Target selection follows the standard adb convention: set ANDROID_SERIAL to
pin one device, or leave it unset when exactly one device is attached.

Where a tap target can be found by its visible label it is resolved from the
hierarchy at run time. The few that genuinely cannot (list rows, the shell mini
player) are given as ratios of the screen, so the checks keep working on a
different pixel density. verify_geometry() refuses to run at all when the
aspect ratio is unexpected, because a mismatched layout would make those taps
land on arbitrary pixels and the results meaningless.
"""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

PKG = "com.santmat.santmat_satsang_prachar"
ACTIVITY = f"{PKG}/.MainActivity"

# The layout this harness was calibrated against. Only the aspect ratio is
# enforced; absolute size is allowed to differ.
BASE_ASPECT = 2400 / 1080
ASPECT_TOLERANCE = 0.02


class GeometryMismatch(RuntimeError):
    pass


def sh(*a, timeout=180):
    return subprocess.run(
        ["adb", *a], capture_output=True, text=True, timeout=timeout
    ).stdout


def sh_ok(*a, timeout=180):
    return subprocess.run(["adb", *a], capture_output=True, text=True, timeout=timeout).returncode == 0


def screen_size():
    """Physical display size as (width, height) in pixels."""
    out = sh("shell", "wm", "size")
    m = re.search(r"(\d+)x(\d+)", out)
    if m:
        return int(m.group(1)), int(m.group(2))
    out = sh("shell", "dumpsys", "display")
    m = re.search(r"real\s+\d+\s+x\s+\d+:\s+(\d+)x(\d+)", out)
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def device_model():
    out = sh("shell", "getprop", "ro.product.model").strip()
    return out or "unknown"


def verify_geometry():
    """Fail loudly rather than tapping arbitrary pixels on an unexpected layout."""
    w, h = screen_size()
    if w <= 0 or h <= 0:
        raise GeometryMismatch("could not read the display size from adb")
    long_, short = max(w, h), min(w, h)
    aspect = long_ / short
    if abs(aspect - BASE_ASPECT) > ASPECT_TOLERANCE:
        raise GeometryMismatch(
            f"screen is {w}x{h} (aspect {aspect:.3f}); this harness was "
            f"calibrated for aspect {BASE_ASPECT:.3f}. Re-derive the tap points "
            f"in back_matrix.py before running on this layout."
        )
    return w, h


_SIZE = {}


def ratio(x, y):
    """A point expressed as a fraction of the screen, e.g. ratio(.5, .9)."""
    w, h = _SIZE.get("px") or verify_geometry()
    _SIZE["px"] = (w, h)
    return int(round(x * w)), int(round(y * h))


def state():
    """(pid, focused window) for the app under test."""
    pid = sh("shell", "pidof", PKG).strip()
    out = sh("shell", "dumpsys", "window")
    m = re.search(r"mCurrentFocus=Window\{[^}]* ([\w./]+)\}", out)
    return pid, (m.group(1) if m else "?")


def foregrounded():
    pid, f = state()
    return (pid != "" and PKG in f), f


def tree(retries=5):
    for _ in range(retries):
        sh("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        x = sh("shell", "cat", "/sdcard/ui.xml")
        if "<hierarchy" in x:
            try:
                return ET.fromstring(x)
            except ET.ParseError:
                pass
        time.sleep(1.2)
    return None


def labels(root=None):
    """{visible text: centre point} for the current hierarchy."""
    root = tree() if root is None else root
    out = {}
    if root is None:
        return out
    for n in root.iter("node"):
        t = (n.get("text") or "").strip() or (n.get("content-desc") or "").strip()
        if not t:
            continue
        b = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", n.get("bounds", ""))
        if not b:
            continue
        x1, y1, x2, y2 = map(int, b.groups())
        out.setdefault(t, ((x1 + x2) // 2, (y1 + y2) // 2))
    return out


def find(root, *needles, exact=False, bottom=False):
    """Locate a label. `bottom` prefers the lowest match, which is how the
    bottom navigation bar is addressed when a tab merges text and icon."""
    hits = []
    for t, pos in labels(root).items():
        for nd in needles:
            if (t == nd) if exact else (nd in t):
                hits.append((pos[1], t, pos))
                break
    if not hits:
        return None, None
    hits.sort()
    return (hits[-1][1], hits[-1][2]) if bottom else (hits[0][1], hits[0][2])


def tap(pos):
    if not pos:
        return False
    sh("shell", "input", "tap", str(pos[0]), str(pos[1]))
    time.sleep(2.0)
    return True


def back():
    sh("shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(2.0)


def home():
    sh("shell", "input", "keyevent", "KEYCODE_HOME")
    time.sleep(1.5)


def wait_for(*needles, timeout=25.0, bottom=False, exact=False):
    deadline = time.time() + timeout
    while time.time() < deadline:
        pos = find(tree(retries=2), *needles, exact=exact, bottom=bottom)[1]
        if pos:
            return pos
        time.sleep(1.0)
    return None


def wait_until(pred, timeout=20.0, interval=1.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if pred(tree(retries=2)):
            return True
        time.sleep(interval)
    return False


def has(*needles, **kw):
    return find(tree(), *needles, **kw)[1] is not None


def cold_start(timeout=40.0):
    """Force-stop, relaunch, and wait until the shell is genuinely up."""
    sh("shell", "am", "force-stop", PKG)
    time.sleep(1.5)
    sh("shell", "am", "start", "-n", ACTIVITY)
    return wait_for("होम", timeout=timeout, bottom=True) is not None


def logcat_counts():
    """Crash-relevant counters over the current logcat buffer."""
    out = sh("logcat", "-d", timeout=300)
    return {
        "fatal": len(re.findall(r"FATAL EXCEPTION", out)),
        "flutter_error": len(re.findall(r"E/flutter", out)),
        "anr": len(re.findall(r"ANR in ", out)),
        "win_death": len(re.findall(r"WIN DEATH", out)),
        "overflow": len(re.findall(r"overflowed by", out, re.I)),
    }


RESULTS = []


def record(name, ok, detail=""):
    RESULTS.append((name, ok, detail))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  ({detail})" if detail else ""))


def summarise(title):
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    print("\n" + "=" * 66)
    print(f" {title}: {passed}/{len(RESULTS)} passed")
    for n, ok, d in RESULTS:
        if not ok:
            print(f"   FAILED: {n}  {d}")
    print("=" * 66)
    return 0 if passed == len(RESULTS) and RESULTS else 1


if __name__ == "__main__":
    try:
        w, h = verify_geometry()
        print(f"device {device_model()}  screen {w}x{h}  package {PKG}")
    except GeometryMismatch as e:
        print(f"geometry check failed: {e}")
        sys.exit(2)
    if not sh_ok("shell", "pidof", PKG):
        pass
    print("\nvisible labels on the current screen:")
    for t, p in sorted(labels().items(), key=lambda kv: kv[1][1])[:40]:
        print(f"  y={p[1]:5} x={p[0]:4} {t[:60]}")
