import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';

class CategoryActionGrid extends StatelessWidget {
  const CategoryActionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    final Color cardBg = isDark ? const Color(0xFF221F1C) : Colors.white;
    final Color borderAudio = isDark
        ? const Color(0xFF292524)
        : const Color(0xFFF5E6D3);
    final Color borderStuti = isDark
        ? const Color(0xFF292524)
        : const Color(0xFFECE0F8);

    final Color titleColor = isDark ? Colors.white : const Color(0xFF1C1917);
    final Color subtitleColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);

    return Row(
      children: [
        // Card 1: Audio Bhajans
        Expanded(
          child: GestureDetector(
            onTap: () => context.go('/audio'),
            child: Container(
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20.0),
                border: Border.all(color: borderAudio, width: 1.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Circular Gradient Icon Container
                  Container(
                    width: 56.0,
                    height: 56.0,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFFF97316), Color(0xFFFBBF24)],
                        begin: Alignment.bottomLeft,
                        end: Alignment.topRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFF97316).withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.music_note_rounded,
                      size: 28.0,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 10.0),

                  // Title
                  Text(
                    'ऑडियो',
                    style: TextStyle(
                      fontSize: 16.0,
                      fontWeight: FontWeight.bold,
                      color: titleColor,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 2.0),

                  // Subtitle
                  Text(
                    'संतमत पावन भजन',
                    style: TextStyle(fontSize: 12.0, color: subtitleColor),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 12.0),

                  // Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go('/audio'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEA580C),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: const StadiumBorder(),
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                      ),
                      child: const Text(
                        'सुनें →',
                        style: TextStyle(
                          fontSize: 12.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(width: 14.0),

        // Card 2: Stuti & Binti
        Expanded(
          child: GestureDetector(
            onTap: () => context.go('/satsang'),
            child: Container(
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20.0),
                border: Border.all(color: borderStuti, width: 1.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Circular Gradient Icon Container
                  Container(
                    width: 56.0,
                    height: 56.0,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7E22CE), Color(0xFF6366F1)],
                        begin: Alignment.bottomLeft,
                        end: Alignment.topRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF7E22CE).withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: SSPIcons.prayingHands(
                        size: 28.0,
                        color: Colors.white,
                      ),
                    ),
                  ),

                  const SizedBox(height: 10.0),

                  // Title
                  Text(
                    'स्तुति-बिनती',
                    style: TextStyle(
                      fontSize: 16.0,
                      fontWeight: FontWeight.bold,
                      color: titleColor,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 2.0),

                  // Subtitle
                  Text(
                    'प्रातः एवं संध्या स्तुति',
                    style: TextStyle(fontSize: 12.0, color: subtitleColor),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 12.0),

                  // Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go('/satsang'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7E22CE),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: const StadiumBorder(),
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                      ),
                      child: const Text(
                        'सुनें एवं देखें →',
                        style: TextStyle(
                          fontSize: 12.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
