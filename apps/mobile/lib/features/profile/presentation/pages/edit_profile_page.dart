import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/utils/phone_number_utils.dart';
import '../providers/profile_providers.dart';
import '../widgets/profile_avatar.dart';
import '../widgets/profile_image_picker_sheet.dart';
import '../../../../shared/design_system/components/ssp_text_input_field.dart';
import '../../../../shared/design_system/components/ssp_primary_button.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  bool _isSaving = false;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();

    // Check if profile state is already present
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _populateFromState();
    });
  }

  void _populateFromState() {
    final state = ref.read(profileStateProvider);
    if (!_isInitialized && state.hasValue && state.value != null) {
      final profile = state.value!;
      _nameController.text = profile.name;
      _emailController.text = profile.email ?? '';
      _phoneController.text = PhoneNumberUtils.formatDisplay(
        profile.phone ?? '',
      );
      _isInitialized = true;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isSaving = true;
      });

      try {
        final emailText = _emailController.text.trim();
        final result = await ref.read(profileStateProvider.notifier).updateProfile(
              name: _nameController.text.trim(),
              phone: PhoneNumberUtils.normalizeToE164(_phoneController.text),
              email: emailText.isNotEmpty ? emailText : null,
            );

        if (mounted) {
          if (result.isSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गया (Profile updated successfully)',
                ),
                behavior: SnackBarBehavior.floating,
              ),
            );
            context.pop();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('त्रुटि: ${result.error?.toString() ?? "अज्ञात त्रुटि"}'),
                backgroundColor: SSPColors.error,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('त्रुटि: ${e.toString()}'),
              backgroundColor: SSPColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isSaving = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen to profileState to initialize controllers if loaded asynchronously
    ref.listen(profileStateProvider, (prev, next) {
      if (!_isInitialized && next.hasValue && next.value != null) {
        final profile = next.value!;
        _nameController.text = profile.name;
        _emailController.text = profile.email ?? '';
        _phoneController.text = PhoneNumberUtils.formatDisplay(
          profile.phone ?? '',
        );
        _isInitialized = true;
      }
    });

    final profileState = ref.watch(profileStateProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? SSPColors.darkBackground
          : SSPColors.lightBackground,
      appBar: const SSPAppBar.standard(
        title: 'प्रोफ़ाइल संपादन',
        subtitle: 'व्यक्तिगत जानकारी अपडेट करें',
      ),
      body: profileState.when(
        loading: () => const SSPLoadingState(),
        error: (error, _) => SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.read(profileStateProvider.notifier).loadProfile(),
        ),
        data: (profile) {
          if (!_isInitialized) {
            _nameController.text = profile.name;
            _emailController.text = profile.email ?? '';
            _phoneController.text = PhoneNumberUtils.formatDisplay(
              profile.phone ?? '',
            );
            _isInitialized = true;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(SSPSpacing.md),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: SSPSpacing.md),

                  // Profile Avatar with Image Picker integration
                  Center(
                    child: ProfileAvatar(
                      profile: profile,
                      size: 104,
                      isEditable: true,
                      onEditPressed: () => ProfileImagePickerSheet.show(
                        context: context,
                        ref: ref,
                        hasCustomPhoto: profile.hasCustomPhoto,
                      ),
                    ),
                  ),

                  const SizedBox(height: SSPSpacing.xl),

                  // Name Input Field (SSPTextInputField)
                  SSPTextInputField(
                    controller: _nameController,
                    label: 'पूरा नाम (Full Name)',
                    hintText: 'अपना नाम दर्ज करें',
                    leadingIcon: const Icon(SSPIcons.profileNav),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'कृपया अपना नाम दर्ज करें (Name is required)';
                      }
                      if (val.trim().length < 2) {
                        return 'नाम कम से कम 2 अक्षरों का होना चाहिए';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: SSPSpacing.md),

                  // Email Input Field (SSPTextInputField)
                  SSPTextInputField(
                    controller: _emailController,
                    label: 'ईमेल पता (Email Address)',
                    hintText: 'devotee@example.com',
                    keyboardType: TextInputType.emailAddress,
                    leadingIcon: const Icon(Icons.email_outlined),
                    helperText: 'ईमेल सूचनाओं के लिए प्रयुक्त',
                    validator: (val) {
                      if (val != null && val.trim().isNotEmpty) {
                        final emailRegex = RegExp(
                          r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                        );
                        if (!emailRegex.hasMatch(val.trim())) {
                          return 'कृपया एक वैध ईमेल पता दर्ज करें (Valid email required)';
                        }
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: SSPSpacing.md),

                  // Phone Input Field (Verified, Read-Only)
                  SSPTextInputField(
                    controller: _phoneController,
                    label: 'मोबाइल नंबर (Phone Number)',
                    keyboardType: TextInputType.phone,
                    enabled: false,
                    leadingIcon: const Icon(Icons.phone_outlined),
                    trailingIcon: const Icon(
                      Icons.verified_user,
                      size: 18,
                      color: Colors.green,
                    ),
                    helperText:
                        'सत्यापित मोबाइल नंबर बदला नहीं जा सकता (Verified number — cannot be changed)',
                  ),

                  const SizedBox(height: SSPSpacing.xl),

                  // Primary Save Button (SSPPrimaryButton)
                  SSPPrimaryButton(
                    label: 'सहेजें (Save Changes)',
                    isLoading: _isSaving,
                    onPressed: _saveProfile,
                    leadingIcon: const Icon(Icons.check_circle_outline),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
