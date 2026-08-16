import 'package:flutter/material.dart';
import '../tokens/animation/ssp_animation.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_icon_button.dart';

/// Canonical Enterprise Text Input Field component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, Material 3 compatibility, lifecycle-safe controller and focus node management,
/// obscure password toggles, multiline support, character counting, loading visuals, error state styling,
/// and screen reader accessibility semantics.
class SSPTextInputField extends StatefulWidget {
  /// Optional text editing controller. If omitted, [SSPTextInputField] manages its own internal controller.
  final TextEditingController? controller;

  /// Optional focus node. If omitted, [SSPTextInputField] manages its own internal focus node.
  final FocusNode? focusNode;

  /// Floating or header label text.
  final String? label;

  /// Placeholder hint text displayed when input is empty.
  final String? hintText;

  /// Supporting helper text displayed below the field.
  final String? helperText;

  /// Error text displayed below the field. Triggers error state styling when non-null.
  final String? errorText;

  /// Form validator callback returning an error message string if invalid, or null if valid.
  final String? Function(String?)? validator;

  /// Explicit semantic label override for screen readers.
  final String? semanticLabel;

  /// Callback fired when input text changes.
  final ValueChanged<String>? onChanged;

  /// Callback fired when keyboard submit action is pressed.
  final ValueChanged<String>? onSubmitted;

  /// Callback fired when text field is tapped.
  final VoidCallback? onTap;

  /// Whether the field is interactive.
  final bool enabled;

  /// Whether the field is read-only.
  final bool readOnly;

  /// Whether to request focus automatically on mount.
  final bool autofocus;

  /// Whether to obscure text (e.g. for password inputs).
  final bool obscureText;

  /// Whether to enable a toggle button for password visibility when [obscureText] is true.
  final bool showPasswordToggle;

  /// Keyboard input type (e.g. emailAddress, phone, multiline).
  final TextInputType keyboardType;

  /// Keyboard submission action (e.g. done, next, search).
  final TextInputAction? textInputAction;

  /// Text capitalization configuration. Defaults to [TextCapitalization.none].
  final TextCapitalization textCapitalization;

  /// Maximum number of lines. Defaults to 1. Set to null for unlimited multiline expansion.
  final int? maxLines;

  /// Minimum number of lines for multiline fields.
  final int? minLines;

  /// Maximum character limit constraint.
  final int? maxLength;

  /// Whether to show a character counter below the field when [maxLength] is set.
  final bool showCharacterCounter;

  /// Leading icon or prefix widget.
  final Widget? leadingIcon;

  /// Trailing icon or suffix widget (rendered before password toggle if both exist).
  final Widget? trailingIcon;

  /// Whether a loading spinner should be displayed in the suffix position.
  final bool isLoading;

  const SSPTextInputField({
    super.key,
    this.controller,
    this.focusNode,
    this.label,
    this.hintText,
    this.helperText,
    this.errorText,
    this.validator,
    this.semanticLabel,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.obscureText = false,
    this.showPasswordToggle = true,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.showCharacterCounter = true,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
  });

  @override
  State<SSPTextInputField> createState() => _SSPTextInputFieldState();
}

class _SSPTextInputFieldState extends State<SSPTextInputField> {
  TextEditingController? _internalController;
  FocusNode? _internalFocusNode;

  TextEditingController get _effectiveController =>
      widget.controller ?? (_internalController ??= TextEditingController());

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  late bool _isObscured;
  bool _isFocused = false;
  int _currentLength = 0;

  @override
  void initState() {
    super.initState();
    _isObscured = widget.obscureText;
    _currentLength = _effectiveController.text.length;
    _effectiveController.addListener(_onTextControllerChanged);
    _effectiveFocusNode.addListener(_onFocusNodeChanged);
  }

  @override
  void didUpdateWidget(SSPTextInputField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.obscureText != oldWidget.obscureText) {
      _isObscured = widget.obscureText;
    }

    if (widget.controller != oldWidget.controller) {
      oldWidget.controller?.removeListener(_onTextControllerChanged);
      if (widget.controller == null && _internalController == null) {
        _internalController = TextEditingController(text: oldWidget.controller?.text ?? '');
      }
      _effectiveController.addListener(_onTextControllerChanged);
      _currentLength = _effectiveController.text.length;
    }

    if (widget.focusNode != oldWidget.focusNode) {
      oldWidget.focusNode?.removeListener(_onFocusNodeChanged);
      if (widget.focusNode == null && _internalFocusNode == null) {
        _internalFocusNode = FocusNode();
      }
      _effectiveFocusNode.addListener(_onFocusNodeChanged);
      _isFocused = _effectiveFocusNode.hasFocus;
    }
  }

  @override
  void dispose() {
    _effectiveController.removeListener(_onTextControllerChanged);
    _effectiveFocusNode.removeListener(_onFocusNodeChanged);
    _internalController?.dispose();
    _internalFocusNode?.dispose();
    super.dispose();
  }

  void _onTextControllerChanged() {
    final int newLength = _effectiveController.text.length;
    if (_currentLength != newLength) {
      setState(() {
        _currentLength = newLength;
      });
    }
  }

  void _onFocusNodeChanged() {
    final bool currentFocused = _effectiveFocusNode.hasFocus;
    if (_isFocused != currentFocused) {
      setState(() {
        _isFocused = currentFocused;
      });
    }
  }

  void _toggleObscure() {
    setState(() {
      _isObscured = !_isObscured;
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bool hasError = widget.errorText != null && widget.errorText!.isNotEmpty;

    // Theme color derivations using SSP design system tokens
    final Color bg = isDark ? SSPColors.darkSurfaceVariant : SSPColors.lightSurfaceVariant;
    final Color textFg = isDark ? SSPColors.darkOnSurface : SSPColors.lightOnSurface;
    final Color hintFg = isDark
        ? SSPColors.softWhite.withValues(alpha: 0.5)
        : SSPColors.templeBrown.withValues(alpha: 0.5);
    final Color disabledBg = isDark ? SSPColors.darkOutlineVariant : SSPColors.lightOutlineVariant;

    final Color focusBorderColor = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;
    final Color errorBorderColor = SSPColors.error;
    final Color defaultBorderColor = isDark ? SSPColors.darkOutline : SSPColors.lightOutline;

    Color currentBorderColor;
    if (hasError) {
      currentBorderColor = errorBorderColor;
    } else if (_isFocused) {
      currentBorderColor = focusBorderColor;
    } else {
      currentBorderColor = defaultBorderColor;
    }

    final Color currentBg = widget.enabled ? bg : disabledBg;

    // Build leading visual widget
    Widget? leadingWidget;
    if (widget.leadingIcon != null) {
      leadingWidget = IconTheme.merge(
        data: IconThemeData(
          color: _isFocused ? focusBorderColor : hintFg,
          size: 20,
        ),
        child: widget.leadingIcon!,
      );
    }

    // Build trailing action widgets (loading, custom trailing, password toggle)
    Widget? trailingWidget;
    if (widget.isLoading) {
      trailingWidget = SizedBox(
        width: 18,
        height: 18,
        child: CircularProgressIndicator(
          strokeWidth: 2.0,
          valueColor: AlwaysStoppedAnimation<Color>(focusBorderColor),
        ),
      );
    } else if (widget.obscureText && widget.showPasswordToggle) {
      trailingWidget = SSPIconButton(
        icon: Icon(_isObscured ? Icons.visibility_off_rounded : Icons.visibility_rounded),
        semanticLabel: _isObscured ? 'Show password' : 'Hide password',
        iconSize: 20,
        minimumSize: 36,
        onPressed: widget.enabled ? _toggleObscure : null,
      );
    } else if (widget.trailingIcon != null) {
      trailingWidget = widget.trailingIcon;
    }

    final String effectiveHint = widget.hintText ?? '';
    final String effectiveSemantics = widget.semanticLabel ?? widget.label ?? effectiveHint;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Optional top label header
        if (widget.label != null && widget.label!.isNotEmpty) ...[
          Text(
            widget.label!,
            style: SSPTypography.labelLarge.copyWith(
              color: hasError
                  ? errorBorderColor
                  : (_isFocused ? focusBorderColor : textFg),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: SSPSpacing.xs),
        ],

        // Container surface wrapping interactive TextField
        Semantics(
          container: true,
          textField: true,
          enabled: widget.enabled,
          readOnly: widget.readOnly,
          obscured: _isObscured,
          label: hasError ? '$effectiveSemantics, Error: ${widget.errorText}' : effectiveSemantics,
          hint: effectiveHint,
          child: AnimatedContainer(
            duration: SSPAnimation.fast,
            curve: SSPAnimation.standard,
            decoration: BoxDecoration(
              color: currentBg,
              borderRadius: SSPRadius.brSmall,
              border: Border.all(
                color: currentBorderColor,
                width: (_isFocused || hasError) ? 1.5 : 1.0,
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: SSPSpacing.md),
            child: Row(
              crossAxisAlignment: (widget.maxLines == null || widget.maxLines! > 1)
                  ? CrossAxisAlignment.start
                  : CrossAxisAlignment.center,
              children: [
                if (leadingWidget != null) ...[
                  Padding(
                    padding: EdgeInsets.only(
                      top: (widget.maxLines == null || widget.maxLines! > 1)
                          ? SSPSpacing.md
                          : 0.0,
                    ),
                    child: leadingWidget,
                  ),
                  const SizedBox(width: SSPSpacing.sm),
                ],
                Expanded(
                  child: TextFormField(
                    controller: _effectiveController,
                    focusNode: _effectiveFocusNode,
                    enabled: widget.enabled,
                    readOnly: widget.readOnly,
                    autofocus: widget.autofocus,
                    obscureText: _isObscured,
                    keyboardType: widget.keyboardType,
                    textInputAction: widget.textInputAction,
                    textCapitalization: widget.textCapitalization,
                    maxLines: _isObscured ? 1 : widget.maxLines,
                    minLines: widget.minLines,
                    maxLength: widget.maxLength,
                    onChanged: widget.onChanged,
                    onFieldSubmitted: widget.onSubmitted,
                    onTap: widget.onTap,
                    validator: widget.validator,
                    style: SSPTypography.bodyMedium.copyWith(
                      color: widget.enabled ? textFg : hintFg,
                    ),
                    cursorColor: focusBorderColor,
                    decoration: InputDecoration(
                      hintText: effectiveHint,
                      hintStyle: SSPTypography.bodyMedium.copyWith(color: hintFg),
                      border: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      disabledBorder: InputBorder.none,
                      errorBorder: InputBorder.none,
                      focusedErrorBorder: InputBorder.none,
                      isDense: true,
                      counterText: '', // Suppress default counter UI; handled cleanly below
                      contentPadding: const EdgeInsets.symmetric(vertical: SSPSpacing.md),
                    ),
                  ),
                ),
                if (trailingWidget != null) ...[
                  const SizedBox(width: SSPSpacing.xs),
                  Padding(
                    padding: EdgeInsets.only(
                      top: (widget.maxLines == null || widget.maxLines! > 1)
                          ? SSPSpacing.sm
                          : 0.0,
                    ),
                    child: trailingWidget,
                  ),
                ],
              ],
            ),
          ),
        ),

        // Bottom section for Helper Text, Error Text, and Character Counter
        if (hasError || (widget.helperText != null && widget.helperText!.isNotEmpty) || (widget.maxLength != null && widget.showCharacterCounter)) ...[
          const SizedBox(height: SSPSpacing.xs),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  hasError ? widget.errorText! : (widget.helperText ?? ''),
                  style: SSPTypography.bodySmall.copyWith(
                    color: hasError ? errorBorderColor : hintFg,
                  ),
                ),
              ),
              if (widget.maxLength != null && widget.showCharacterCounter) ...[
                const SizedBox(width: SSPSpacing.sm),
                Text(
                  '$_currentLength/${widget.maxLength}',
                  style: SSPTypography.bodySmall.copyWith(
                    color: _currentLength > widget.maxLength! ? errorBorderColor : hintFg,
                  ),
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }
}
