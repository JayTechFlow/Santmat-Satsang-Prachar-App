import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/config/app_config.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/typography/ssp_typography.dart';
import '../../domain/entities/auth_status.dart';
import '../providers/auth_status_provider.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  @override
  void initState() {
    super.initState();
    _handleSplashTransition();
  }

  void _handleSplashTransition() {
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      final devDirectEntry = ref.read(appConfigProvider).enableDevDirectEntry;
      if (devDirectEntry) {
        context.go('/');
      } else {
        final status = ref.read(authStatusProvider);
        if (status == AuthStatus.authenticated) {
          context.go('/');
        } else {
          context.go('/login');
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF201D1A), const Color(0xFF181614)]
                : [const Color(0xFF7F1D1D), const Color(0xFF991B1B)],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Spiritual Diya Logo Container
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.amber.shade500.withValues(alpha: 0.2),
                  border: Border.all(
                    color: Colors.amber.shade300.withValues(alpha: 0.4),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.shade500.withValues(alpha: 0.3),
                      blurRadius: 24,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: const DiyaIcon(size: 64),
              ),
              const SizedBox(height: 24),
              // App Title Branding
              Text(
                'संतमत सत्संग प्रचार',
                style: SSPTypography.headlineLarge.copyWith(
                  color: const Color(0xFFFDE68A),
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              // Spiritual Tagline Motto
              Text(
                '॥ सत्य ही हमारा धर्म है ॥',
                style: SSPTypography.titleMedium.copyWith(
                  color: const Color(0xFFFEF3C7),
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.2,
                ),
              ),
              const Spacer(),
              // Indeterminate Loading Indicator
              SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.amber.shade300),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'आरंभ हो रहा है...',
                style: SSPTypography.bodySmall.copyWith(
                  color: const Color(0xFFFDE68A).withValues(alpha: 0.8),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
