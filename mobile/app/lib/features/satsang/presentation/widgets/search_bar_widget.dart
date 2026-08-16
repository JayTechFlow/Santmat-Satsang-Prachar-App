import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_search_field.dart';
import '../../../../shared/theme/app_spacing.dart';

class SearchBarWidget extends StatelessWidget {
  final String hintText;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onFilterTap;

  const SearchBarWidget({
    super.key,
    required this.hintText,
    this.onChanged,
    this.onFilterTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacing.p16,
      child: Row(
        children: [
          Expanded(
            child: SSPSearchField(
              hintText: hintText,
              onChanged: onChanged,
            ),
          ),
          if (onFilterTap != null) ...[
            const SizedBox(width: AppSpacing.sp8),
            IconButton.filledTonal(
              onPressed: onFilterTap,
              icon: const Icon(Icons.filter_list),
            ),
          ],
        ],
      ),
    );
  }
}
