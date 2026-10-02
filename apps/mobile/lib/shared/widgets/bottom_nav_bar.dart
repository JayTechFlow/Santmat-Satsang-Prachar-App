import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../theme/app_theme_provider.dart';
import 'devotional_icons.dart';

/// Navigation item model for BottomNavBar.
class BottomNavItem {
  final String label;
  final Widget icon;

  const BottomNavItem({required this.label, required this.icon});
}

/// Reconstructed Mobile Bottom Navigation Bar matching BottomNav.tsx.
class BottomNavBar extends ConsumerWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark =
        themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            Theme.of(context).brightness == Brightness.dark);

    final bgNavColor = isDark
        ? const Color(0xFF201D1A)
        : const Color(0xFFFAF7F2);
    final borderColor = isDark
        ? const Color(0xFF292524)
        : const Color(0xFFF0E6D8);

    final activePillBg = isDark
        ? const Color(0xFFF59E0B).withValues(alpha: 0.2)
        : const Color(0xFFFFEDD5);
    final activeIconColor = isDark
        ? const Color(0xFFFCD34D)
        : const Color(0xFFC2410C);
    final activeTextColor = isDark
        ? const Color(0xFFFCD34D)
        : const Color(0xFF9A3412);

    final inactiveIconColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);
    final inactiveTextColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);

    final items = [
      BottomNavItem(
        label: 'होम',
        icon: const Icon(Icons.home_rounded, size: 20),
      ),
      BottomNavItem(
        label: 'ऑडियो',
        icon: const Icon(Icons.music_note_rounded, size: 20),
      ),
      BottomNavItem(
        label: 'स्तुति-बिनती',
        icon: PrayingHandsIcon(
          size: 20,
          color: currentIndex == 2 ? activeIconColor : inactiveIconColor,
        ),
      ),
      BottomNavItem(
        label: 'सूचनाएँ',
        icon: const Icon(Icons.notifications_rounded, size: 20),
      ),
      BottomNavItem(
        label: 'प्रोफ़ाइल',
        icon: const Icon(Icons.person_rounded, size: 20),
      ),
    ];

    final mediaQuery = MediaQuery.of(context);
    final double bottomInset = math.max(
      mediaQuery.viewPadding.bottom,
      math.max(
        mediaQuery.padding.bottom,
        mediaQuery.systemGestureInsets.bottom,
      ),
    );

    return Container(
      decoration: BoxDecoration(
        color: bgNavColor,
        border: Border(top: BorderSide(color: borderColor, width: 1)),
      ),
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SizedBox(
        height: 64.0,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: List.generate(items.length, (index) {
            final isActive = currentIndex == index;
            final item = items[index];

            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onTap(index),
                child: Center(
                  child: AnimatedScale(
                    scale: isActive ? 1.05 : 1.0,
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeInOut,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: isActive ? activePillBg : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: IconTheme(
                            data: IconThemeData(
                              color: isActive
                                  ? activeIconColor
                                  : inactiveIconColor,
                              size: 20,
                            ),
                            child: item.icon,
                          ),
                        ),
                        const SizedBox(height: 2),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontFamily: 'Mukta',
                            fontSize: 11.5,
                            fontWeight: isActive
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: isActive
                                ? activeTextColor
                                : inactiveTextColor,
                            height: 1.1,
                            letterSpacing: -0.2,
                          ),
                          child: Text(
                            item.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
