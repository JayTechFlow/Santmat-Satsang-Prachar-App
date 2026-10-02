import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';

class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bgColor = isDark ? const Color(0xFF1C1917) : Colors.white;
    final Color borderColor = isDark
        ? const Color(0xFF292524)
        : const Color(0xFFEBE3D5);
    final Color textColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);

    return Semantics(
      button: true,
      label: 'अपने पसंद का भजन सुनें',
      child: GestureDetector(
        onTap: () => context.push('/search'),
        child: Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(24.0),
            border: Border.all(color: borderColor, width: 1.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
          child: Row(
            children: [
              Icon(SSPIcons.searchNav, size: 20.0, color: textColor),
              const SizedBox(width: 10.0),
              Expanded(
                child: Text(
                  'अपने पसंद का भजन या वाणी खोजें...',
                  style: TextStyle(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w500,
                    color: textColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
