import 'package:flutter/material.dart';
import '../design_system/components/ssp_primary_button.dart';

/// Legacy PrimaryButton adapter delegating to the canonical [SSPPrimaryButton].
class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SSPPrimaryButton.text(
      text: text,
      onPressed: onPressed,
      isLoading: isLoading,
    );
  }
}

