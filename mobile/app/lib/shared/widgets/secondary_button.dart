import 'package:flutter/material.dart';
import '../design_system/components/ssp_secondary_button.dart';

/// Legacy SecondaryButton adapter delegating to the canonical [SSPSecondaryButton].
class SecondaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  const SecondaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SSPSecondaryButton.text(
      text: text,
      onPressed: onPressed,
      isLoading: isLoading,
    );
  }
}

