import 'package:flutter/material.dart';
import '../design_system/components/ssp_text_input_field.dart';

/// Legacy AppTextField adapter delegating to the canonical [SSPTextInputField].
class AppTextField extends StatelessWidget {
  final String label;
  final TextEditingController? controller;
  final bool obscureText;
  final String? Function(String?)? validator;

  const AppTextField({
    super.key,
    required this.label,
    this.controller,
    this.obscureText = false,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return SSPTextInputField(
      label: label,
      controller: controller,
      obscureText: obscureText,
      validator: validator,
    );
  }
}

