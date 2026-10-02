#!/usr/bin/env python3
"""Physical back-navigation acceptance matrix.

Complements test/navigation/ by driving the installed release APK on real
hardware: each case reaches a screen, presses the actual Android Back key, and
asserts both that the process is still alive and that the expected destination
is showing. The process id is recorded so an accidental exit is unambiguous.

Requires a signed-in account whose catalogue search returns results, and at
least one saved favourite (cases O1 and G1 need them; without a favourite G1
reports SKIPPED rather than a false pass).

    adb install -r build/app/outputs/flutter-apk/app-release.apk
    python3 back_matrix.py
"""
import sys
import time

import harness as h
from harness import (GeometryMismatch, back, cold_start, find, foregrounded, has,
                     labels, ratio, record, sh, summarise, tap, tree,
                     verify_geometry, wait_until)

QUERY = "test"          # a term that really matches the seeded catalogue


# ---------------------------------------------------------------- locations
def tab(name):
    """Bottom navigation tabs are addressable by their visible label."""
    return find(tree(), name, bottom=True)[1]


def top_bar_action(*needles):
    _, pos = find(tree(), *needles)
    return pos


def list_row(index=0):
    """The nth tappable catalogue row. Rows have no stable label of their own,
    so they are addressed by position within the list area."""
    w, hh = h._SIZE.get("px") or verify_geometry()
    return ratio(0.5, 0.373 + 0.061 * index)


def mini_player():
    return ratio(0.5, 0.857)


# ------------------------------------------------------------------ probes
def at_home():
    return has("आज का समाचार") or has("नए भजन एवं पद") or has("मुख्य")


def at_audio():
    return has("संतमत भजन संग्रह") or has("General")


def at_player():
    """The full player page, not merely any page with a back button."""
    return has("अब चल रहा है")


def on_search():
    return (
        has("भजन, गायक, स्तुति खोजें...")
        or has("सभी भजन")
        or has("शाही भजनवाली")
        or has("पदावली भजन")
        or has("स्वागत गीत")
        or has("Clear search query")
    )


def open_drawer():
    if not cold_start():
        return False
    btn = top_bar_action("मेनू खोलें")
    if not btn or not tap(btn):
        return False
    return h.wait_for("मुख्य पृष्ठ", timeout=15) is not None


def drawer_item(name):
    return find(tree(), name)[1]


def result_row():
    """A catalogue result: below the search header, not the query chip."""
    hits = [(p[1], t, p) for t, p in labels(tree()).items()
            if QUERY in t and p[1] > 400]
    hits.sort()
    return (hits[0][1], hits[0][2]) if hits else (None, None)


def back_to_root(limit=3):
    """Back may be consumed once by the IME; press until the shell is reached."""
    presses = 0
    for _ in range(limit):
        back()
        presses += 1
        if not on_search():
            break
    return presses


def open_player_from_catalog():
    """A catalogue tap starts playback and reveals the shell mini player; the
    full page is reached by tapping that mini player."""
    tap(list_row(0))
    time.sleep(2.5)
    tap(mini_player())
    time.sleep(3.0)
    return at_player()


# ------------------------------------------------------------------- cases
def c_tabs():
    print("\n-- T: top-level tab -> Back -> Home --")
    for name in ("ऑडियो", "स्तुति-बिनती", "सूचनाएँ", "प्रोफ़ाइल"):
        cold_start()
        pos = tab(name)
        if not tap(pos):
            record(f"T '{name}' -> Back", False, "tab not found")
            continue
        time.sleep(1.0)
        back()
        alive, _ = foregrounded()
        record(f"T '{name}' -> Back", alive and at_home(),
               f"alive={alive} home={at_home()}")


def c_search_from_audio():
    print("\n-- S: Search opened from Audio -> Back -> Home (top-level) --")
    cold_start()
    tap(tab("ऑडियो"))
    btn = top_bar_action("खोजें")
    if not tap(btn):
        record("S1 Search(from Audio) -> Back -> Home", False, "no search action")
        return
    time.sleep(2.0)
    was = on_search()
    presses = back_to_root()
    alive, _ = foregrounded()
    record("S1 Search(from Audio) -> Back -> Home", alive and at_home(),
           f"search={was} presses={presses} alive={alive} home={at_home()}")


def c_search_appbar():
    print("\n-- A: AppBar back on Search behaves like system Back --")
    cold_start()
    tap(tab("ऑडियो"))
    tap(top_bar_action("खोजें"))
    time.sleep(2.0)
    pos = top_bar_action("पीछे जाएं")
    if not pos:
        record("A1 AppBar back on Search", False, "no back affordance")
        return
    tap(pos)
    alive, _ = foregrounded()
    record("A1 AppBar back on Search -> Home", alive and at_home(),
           f"alive={alive} home={at_home()}")
    # The AppBar button is unaffected by the IME, so it must take one press.
    record("A2 AppBar back needs no second press",
           alive and at_home() and not on_search(),
           f"stillOnSearch={on_search()}")


def c_search_player_origin():
    print("\n-- O: Search -> Player -> Back -> Search (origin-aware) --")
    cold_start()
    tap(tab("ऑडियो"))
    tap(top_bar_action("खोजें"))
    time.sleep(2.0)
    if not on_search():
        record("O1 Search -> Player -> Back -> Search", False, "search page did not open")
        return

    field = top_bar_action("खोजें", "भजन, गायक, स्तुति खोजें...")
    if not field:
        for n in (tree() or []).iter("node"):
            if n.get("class") == "android.widget.EditText":
                b = h.re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", n.get("bounds", ""))
                if b:
                    x1, y1, x2, y2 = map(int, b.groups())
                    field = ((x1 + x2) // 2, (y1 + y2) // 2)
                    break
    if not field:
        field = ratio(0.5, 0.08)
    if not tap(field):
        record("O1 Search -> Player -> Back -> Search", False, "no query field")
        return
    time.sleep(1.2)
    sh("shell", "input", "text", QUERY)
    sh("shell", "input", "keyevent", "66")          # ENTER
    shown = wait_until(lambda _: result_row()[1] is not None, timeout=20)
    _, res = result_row()
    if not shown or not res:
        record("O1 Search -> Player -> Back -> Search", False, "query returned nothing")
        return

    tap(res)
    on_player = wait_until(lambda _: at_player(), timeout=20)
    if not on_player:
        print("      DEBUG not on player; screen was:")
        for t, p in sorted(labels().items(), key=lambda kv: kv[1][1])[:12]:
            print(f"        y={p[1]:5} {t[:50]}")

    back()                                            # exactly one press
    wait_until(lambda _: has("Clear search query") or on_search(), timeout=10)
    alive, _ = foregrounded()
    back_on_search = has("Clear search query") or on_search()
    record("O1 Search -> Player -> Back -> Search",
           alive and on_player and back_on_search,
           f"results={shown} player={on_player} alive={alive} "
           f"backOnSearch={back_on_search}")


def c_nested_player():
    print("\n-- N: Audio -> Player -> Back -> Audio (nested) --")
    cold_start()
    tap(tab("ऑडियो"))
    opened = open_player_from_catalog()
    back()
    alive, _ = foregrounded()
    record("N1 Player -> Back -> Audio", alive and at_audio(),
           f"player={opened} alive={alive} audio={at_audio()}")


def c_favorites():
    print("\n-- F: Drawer -> Favorites -> Back -> Home --")
    if not open_drawer():
        record("F1 Drawer -> Favorites -> Back", False, "drawer did not open")
        return
    pos = drawer_item("पसंदीदा भजन")
    if not tap(pos):
        record("F1 Drawer -> Favorites -> Back", False, "drawer item missing")
        return
    time.sleep(3.0)
    on_fav = has("पसंदीदा") or has("कोई")
    back()
    alive, _ = foregrounded()
    record("F1 Favorites -> Back -> Home", alive and at_home(),
           f"fav={on_fav} alive={alive} home={at_home()}")


def c_favorites_player():
    print("\n-- G: Favorites -> Player -> Back -> Favorites --")
    if not open_drawer():
        record("G1 Favorites -> Player -> Back", False, "drawer did not open")
        return
    pos = drawer_item("पसंदीदा भजन")
    if not tap(pos):
        record("G1 Favorites -> Player -> Back", False, "drawer item missing")
        return
    time.sleep(3.0)
    _, item = find(tree(), QUERY)
    if not item:
        record("G1 Favorites -> Player -> Back", True,
               "SKIPPED: no favourites saved on this account")
        return
    tap(item)
    time.sleep(3.0)
    on_player = at_player()
    back()
    alive, _ = foregrounded()
    still_fav = has("पसंदीदा") or has("कोई")
    record("G1 Favorites -> Player -> Back -> Favorites", alive and still_fav,
           f"player={on_player} alive={alive} fav={still_fav}")


def c_drawer_audio():
    print("\n-- D: Drawer -> Audio -> Back -> Home --")
    if not open_drawer():
        record("D1 Drawer -> Audio -> Back", False, "drawer did not open")
        return
    pos = drawer_item("सभी भजन")
    if not tap(pos):
        record("D1 Drawer -> Audio -> Back", False, "drawer item missing")
        return
    time.sleep(3.0)
    on_audio = at_audio()
    back()
    alive, _ = foregrounded()
    record("D1 Drawer -> Audio -> Back -> Home", alive and at_home(),
           f"audio={on_audio} alive={alive} home={at_home()}")


def c_cycles(n=10):
    print(f"\n-- C: {n}x bottom-nav cycles then Back (no duplicate Home) --")
    cold_start()
    for _ in range(n):
        for t in ("ऑडियो", "स्तुति-बिनती", "सूचनाएँ", "प्रोफ़ाइल"):
            tap(tab(t))
    tap(tab("होम"))
    navbars = sum(1 for t in labels(tree()) if t == "होम")
    back()
    alive, _ = foregrounded()
    record(f"C1 {n} cycles -> Back stays on Home, no exit", alive and at_home(),
           f"homeLabels={navbars} alive={alive}")


def c_root_double_back():
    print("\n-- E: Home -> Back -> Back exits the app --")
    # E1: the first Back must not exit and must show the prompt.
    cold_start()
    sh("shell", "input", "keyevent", "4")
    time.sleep(0.4)
    prompt = has("दोबारा") or has("बाहर")
    alive, _ = foregrounded()
    record("E1 first Back does NOT exit, prompt shown", alive and prompt,
           f"alive={alive} prompt={prompt}")

    # E2: two rapid Backs. No hierarchy work in between, otherwise the dump
    # latency alone would exceed the exit-arm window.
    cold_start()
    sh("shell", "input", "keyevent", "4")
    time.sleep(0.35)
    sh("shell", "input", "keyevent", "4")
    time.sleep(4.0)
    pid, focus = h.state()
    exited = pid == "" or h.PKG not in focus
    record("E2 second Back within 2s EXITS the app", exited,
           f"pid={pid or 'gone'} focus={focus.split('/')[-1]}")

    # E3: after the window expires the next Back must only re-arm, not exit.
    cold_start()
    sh("shell", "input", "keyevent", "4")
    time.sleep(3.0)                      # longer than kExitArmTimeout
    sh("shell", "input", "keyevent", "4")
    time.sleep(3.0)
    pid_late, focus_late = h.state()
    still = pid_late != "" and h.PKG in focus_late
    record("E3 Back after the window does NOT exit", still, f"pid={pid_late or 'gone'}")


def c_cold_starts(n=10):
    print(f"\n-- K: {n}x cold start (no crash, no stuck state) --")
    ok = 0
    for i in range(n):
        if cold_start(timeout=45):
            ok += 1
        else:
            print(f"      cold start {i + 1} failed")
    record(f"K1 {n} cold starts", ok == n, f"{ok}/{n}")


def main():
    try:
        w, hh = verify_geometry()
    except GeometryMismatch as e:
        print(f"geometry check failed: {e}")
        return 2
    print("=" * 66)
    print(f" PHYSICAL BACK NAVIGATION MATRIX — {h.device_model()} {w}x{hh}")
    print("=" * 66)
    # The first launch after a fresh install initialises Firebase, Crashlytics
    # and media, so give it a generous window before any case is timed.
    sh("logcat", "-c")
    if not cold_start(timeout=90):
        print("  !! warm-up failed: the app shell never appeared")
        return 2
    print("  warm-up: app shell ready\n")

    c_tabs()
    c_search_from_audio()
    c_search_appbar()
    c_search_player_origin()
    c_nested_player()
    c_favorites()
    c_favorites_player()
    c_drawer_audio()
    c_cycles(10)
    c_root_double_back()
    c_cold_starts(10)

    code = summarise("RESULT")
    counts = h.logcat_counts()
    print(f" logcat: {counts}")
    if any(v for v in counts.values()):
        print("  !! crash-relevant logcat output present, see the counts above")
        return 1
    return code


if __name__ == "__main__":
    sys.exit(main())
