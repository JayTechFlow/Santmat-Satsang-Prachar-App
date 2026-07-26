import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_prayer_card.dart';

class SatsangHomePage extends ConsumerWidget {
  const SatsangHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: SSPAppBar(
        title: 'स्तुति-विनती',
        subtitle: '|| प्रार्थना से प्रभु मिलते हैं ||',
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.search_rounded), onPressed: () {}),
          AppSpacing.horizontalSpaceSm,
        ],
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.paddingAllLg,
        child: Column(
          children: [
            // Morning Prayer
            SSPPrayerCard(
              timeTitle: 'प्रातः कालीन स्तुति',
              timeSubtitle: 'सुबह की प्रार्थना - नई ऊर्जा के साथ',
              timeIcon: Icons.wb_sunny_rounded,
              themeColor: AppColors.deepSaffron,
              backgroundGradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.deepSaffron.withValues(alpha: 0.1),
                  Colors.white,
                ],
              ),
              title: 'प्रातः कालीन स्तुति',
              subtitle: 'पूज्य गुरुदेव की वाणी में',
              imageUrl: 'https://picsum.photos/200/200?morning', // Mock
              durationText: '18:42',
              quoteText:
                  'प्रातः काल की यह स्तुति मन को पवित्र करती है\nऔर दिन भर सकारात्मक ऊर्जा प्रदान करती है।',
              onPlay: () {},
              onLyrics: () {},
              onFavorite: () {},
              onShare: () {},
            ),
            AppSpacing.verticalSpaceLg,

            // Evening Prayer
            SSPPrayerCard(
              timeTitle: 'संध्याकालीन स्तुति',
              timeSubtitle: 'शाम की प्रार्थना - आंतरिक शांति के साथ',
              timeIcon: Icons.nights_stay_rounded,
              themeColor: AppColors.maroon, // Purple-ish
              backgroundGradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppColors.maroon.withValues(alpha: 0.1), Colors.white],
              ),
              title: 'संध्याकालीन स्तुति',
              subtitle: 'पूज्य गुरुदेव की वाणी में',
              imageUrl: 'https://picsum.photos/200/200?evening', // Mock
              durationText: '18:57',
              quoteText:
                  'संध्या काल की यह स्तुति मन को शांत करती है\nऔर आंतरिक शांति प्रदान करती है।',
              onPlay: () {},
              onLyrics: () {},
              onFavorite: () {},
              onShare: () {},
            ),
            AppSpacing.verticalSpaceLg,
          ],
        ),
      ),
    );
  }
}
