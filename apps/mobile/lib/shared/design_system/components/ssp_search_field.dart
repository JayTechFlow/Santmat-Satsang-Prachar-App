import 'package:flutter/material.dart';
import '../tokens/animation/ssp_animation.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_icon_button.dart';

/// Canonical Search Field component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, lifecycle-safe controller and focus node management,
/// Material 3 search styling, clear action affordance, loading progress visual,
/// accessibility semantics, and keyboard submit handling (IME action search).
class SSPSearchField extends StatefulWidget {
  /// Optional text editing controller. If omitted, [SSPSearchField] manages its own internal controller.
  final TextEditingController? controller;

  /// Optional focus node. If omitted, [SSPSearchField] manages its own internal focus node.
  final FocusNode? focusNode;

  /// Placeholder hint text displayed when input is empty.
  final String? hintText;

  /// Explicit semantic label override for screen readers.
  final String? semanticLabel;

  /// Callback fired when input text changes.
  final ValueChanged<String>? onChanged;

  /// Callback fired when clear button is tapped.
  final VoidCallback? onClear;

  /// Callback fired when keyboard submit/search action is pressed.
  final ValueChanged<String>? onSubmitted;

  /// Callback fired when search field is tapped.
  final VoidCallback? onTap;

  /// Keyboard action type. Defaults to [TextInputAction.search].
  final TextInputAction textInputAction;

  /// Keyboard input type. Defaults to [TextInputType.text].
  final TextInputType keyboardType;

  /// Whether the field is interactive.
  final bool enabled;

  /// Whether the field is read-only.
  final bool readOnly;

  /// Whether a loading indicator should be displayed in place of leading search icon.
  final bool isLoading;

  /// Whether to show clear button when text is non-empty.
  final bool showClearButton;

  /// Custom leading icon override. Defaults to search icon.
  final Widget? leadingIcon;

  /// Custom trailing icon override (e.g. filter/mic).
  final Widget? trailingIcon;

  /// Whether to request focus automatically on mount.
  final bool autofocus;

  const SSPSearchField({
    super.key,
    this.controller,
    this.focusNode,
    this.hintText,
    this.semanticLabel,
    this.onChanged,
    this.onClear,
    this.onSubmitted,
    this.onTap,
    this.textInputAction = TextInputAction.search,
    this.keyboardType = TextInputType.text,
    this.enabled = true,
    this.readOnly = false,
    this.isLoading = false,
    this.showClearButton = true,
    this.leadingIcon,
    this.trailingIcon,
    this.autofocus = false,
  });

  @override
  State<SSPSearchField> createState() => _SSPSearchFieldState();
}

class _SSPSearchFieldState extends State<SSPSearchField> {
  TextEditingController? _internalController;
  FocusNode? _internalFocusNode;

  TextEditingController get _effectiveController =>
      widget.controller ?? (_internalController ??= TextEditingController());

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  bool _hasText = false;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _hasText = _effectiveController.text.isNotEmpty;
    _effectiveController.addListener(_onTextControllerChanged);
    _effectiveFocusNode.addListener(_onFocusNodeChanged);
  }

  @override
  void didUpdateWidget(SSPSearchField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.controller != oldWidget.controller) {
      oldWidget.controller?.removeListener(_onTextControllerChanged);
      if (widget.controller == null && _internalController == null) {
        _internalController = TextEditingController(text: oldWidget.controller?.text ?? '');
      }
      _effectiveController.addListener(_onTextControllerChanged);
      _hasText = _effectiveController.text.isNotEmpty;
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
    final bool currentHasText = _effectiveController.text.isNotEmpty;
    if (_hasText != currentHasText) {
      setState(() {
        _hasText = currentHasText;
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

  void _handleClear() {
    _effectiveController.clear();
    widget.onChanged?.call('');
    widget.onClear?.call();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    // Theme color derivations using SSP design system tokens
    final Color bg = isDark ? SSPColors.darkSurfaceVariant : SSPColors.lightSurfaceVariant;
    final Color textFg = isDark ? SSPColors.darkOnSurface : SSPColors.lightOnSurface;
    final Color hintFg = isDark
        ? SSPColors.softWhite.withValues(alpha: 0.5)
        : SSPColors.templeBrown.withValues(alpha: 0.5);
    final Color iconFg = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;
    final Color focusBorderColor = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;
    final Color disabledBg = isDark ? SSPColors.darkOutlineVariant : SSPColors.lightOutlineVariant;

    final Color currentBg = widget.enabled ? bg : disabledBg;
    final Color currentBorderColor = _isFocused ? focusBorderColor : Colors.transparent;

    // Build leading visual widget (loading spinner or search icon)
    Widget leadingWidget;
    if (widget.isLoading) {
      leadingWidget = Padding(
        padding: const EdgeInsets.all(SSPSpacing.sm),
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2.0,
            valueColor: AlwaysStoppedAnimation<Color>(iconFg),
          ),
        ),
      );
    } else {
      leadingWidget = widget.leadingIcon ??
          Icon(
            Icons.search_rounded,
            color: iconFg,
            size: 22,
          );
    }

    // Build trailing action widget (clear icon button or custom trailing widget)
    Widget? trailingWidget;
    if (widget.showClearButton && _hasText && widget.enabled && !widget.readOnly) {
      trailingWidget = SSPIconButton(
        icon: const Icon(Icons.clear_rounded),
        semanticLabel: 'Clear search query',
        iconSize: 18,
        minimumSize: 36,
        onPressed: _handleClear,
      );
    } else if (widget.trailingIcon != null) {
      trailingWidget = widget.trailingIcon;
    }

    final String effectiveHint = widget.hintText ?? 'Search...';
    final String effectiveSemantics = widget.semanticLabel ?? effectiveHint;

    return Semantics(
      container: true,
      textField: true,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      label: effectiveSemantics,
      hint: effectiveHint,
      child: AnimatedContainer(
        duration: SSPAnimation.fast,
        curve: SSPAnimation.standard,
        decoration: BoxDecoration(
          color: currentBg,
          borderRadius: SSPRadius.brPill,
          border: Border.all(
            color: currentBorderColor,
            width: _isFocused ? 1.5 : 0.0,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: SSPSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              leadingWidget,
              const SizedBox(width: SSPSpacing.sm),
              Expanded(
                child: TextField(
                  controller: _effectiveController,
                  focusNode: _effectiveFocusNode,
                  enabled: widget.enabled,
                  readOnly: widget.readOnly,
                  autofocus: widget.autofocus,
                  textInputAction: widget.textInputAction,
                  keyboardType: widget.keyboardType,
                  onChanged: widget.onChanged,
                  onSubmitted: widget.onSubmitted,
                  onTap: widget.onTap,
                  style: SSPTypography.bodyMedium.copyWith(
                    color: widget.enabled ? textFg : hintFg,
                  ),
                  cursorColor: focusBorderColor,
                  decoration: InputDecoration(
                    hintText: effectiveHint,
                    hintStyle: SSPTypography.bodyMedium.copyWith(
                      color: hintFg,
                    ),
                    border: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    disabledBorder: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: SSPSpacing.md),
                  ),
                ),
              ),
              if (trailingWidget != null) ...[
                const SizedBox(width: SSPSpacing.xs),
                trailingWidget,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
