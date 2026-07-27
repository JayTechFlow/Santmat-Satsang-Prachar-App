import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/home_providers.dart';
import '../../../daily_quotes/presentation/providers/daily_quotes_providers.dart';
import '../../../audio/presentation/providers/audio_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);
    final audioState = ref.watch(audioHomeStateProvider);

    const primaryBrown = Color(0xFF8B2B0F);
    const primaryOrange = Color(0xFFD66B27);
    const primaryPurple = Color(0xFF6A4A9C);
    const audioCardBg = Color(0xFFFFF7F0);
    const stutiCardBg = Color(0xFFF7F5FC);
    const greyText = Color(0xFF757575);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.black),
          onPressed: () {},
        ),
        title: Column(
          children: [
            const Text(
              'संतमत सत्संग प्रचार',
              style: TextStyle(
                color: primaryBrown,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '।। सत्य ही हमारा धर्म है ।।',
              style: TextStyle(
                color: greyText,
                fontSize: 12,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.black),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      body: homeState.when(
        loading: () => const Center(child: CircularProgressIndicator(color: primaryBrown)),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (data) => SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 16),
                      const Icon(Icons.search, color: greyText),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'भजन, गायक, कीवर्ड खोजें...',
                          style: TextStyle(color: greyText, fontSize: 14),
                        ),
                      ),
                      const Icon(Icons.mic_none, color: greyText),
                      const SizedBox(width: 16),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Hero Banner
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    height: 220,
                    width: double.infinity,
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Image.network(
                            'https://images.unsplash.com/photo-1604871000636-074FA5117945?auto=format&fit=crop&w=800&q=80',
                            fit: BoxFit.cover,
                            errorBuilder: (ctx, err, stack) => Container(color: Colors.grey.shade300),
                          ),
                        ),
                        // Text Overlay
                        Positioned(
                          left: 24,
                          top: 48,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'सत्संग से ही',
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'जीवन का उद्धार है।',
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 8),
                              Text(
                                'सत्संग सुनें, जीवन संवारें।',
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Share Button (Highlighted green in UI spec)
                        Positioned(
                          top: 16,
                          right: 16,
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: const BoxDecoration(
                              color: Color(0x99502A19),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.share, color: Colors.white, size: 20),
                          ),
                        ),
                        // Aaj Ka Suvichar Badge (Highlighted green in UI spec)
                        Positioned(
                          bottom: 16,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xCC3E2015),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(Icons.wb_sunny_outlined, color: Colors.white, size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'आज का सुविचार',
                                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Pagination Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(color: primaryBrown, shape: BoxShape.circle),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: Colors.grey.shade300, shape: BoxShape.circle),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: Colors.grey.shade300, shape: BoxShape.circle),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: Colors.grey.shade300, shape: BoxShape.circle),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Quick Actions
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    // Audio Card
                    Expanded(
                      child: GestureDetector(
                        onTap: () => context.go('/audio'),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: audioCardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.orange.shade100),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFFE97F39), Color(0xFFC7511B)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.music_note, color: Colors.white, size: 32),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'ऑडियो',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryBrown),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'सभी भजन सुनें',
                                style: TextStyle(fontSize: 12, color: greyText),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                decoration: BoxDecoration(
                                  color: primaryOrange,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: const [
                                    Text('सुनें', style: TextStyle(color: Colors.white, fontSize: 12)),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward, color: Colors.white, size: 14),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Stuti Card
                    Expanded(
                      child: GestureDetector(
                        onTap: () => context.go('/satsang'),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: stutiCardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.deepPurple.shade50),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF8663BB), Color(0xFF553880)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.volunteer_activism, color: Colors.white, size: 32),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'स्तुति-बिन्ती',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryPurple),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'प्रातः एवं संध्या स्तुति',
                                style: TextStyle(fontSize: 12, color: greyText),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                decoration: BoxDecoration(
                                  color: primaryPurple,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: const [
                                    Text('देखें', style: TextStyle(color: Colors.white, fontSize: 12)),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward, color: Colors.white, size: 14),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Quote Block
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9F9F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '"',
                        style: TextStyle(
                          fontSize: 48,
                          color: Color(0xFFD3B69A),
                          height: 0.8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'सत्संग सुनने से मन शुद्ध होता है और जीवन में शांति का प्रकाश फैलता है।',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.wb_twilight_rounded, color: primaryOrange, size: 32),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Latest Bhajans Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.music_note, color: primaryBrown, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'नवीनतम भजन',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: primaryBrown,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: const [
                        Text(
                          'सभी देखें',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: primaryBrown,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward, color: primaryBrown, size: 16),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Latest Bhajans List
              if (audioState.isLoading)
                const Center(child: CircularProgressIndicator(color: primaryBrown))
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: audioState.latestAudio.length > 3 ? 3 : audioState.latestAudio.length,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  separatorBuilder: (context, index) => const Divider(height: 24, color: Colors.black12),
                  itemBuilder: (context, index) {
                    final item = audioState.latestAudio[index];
                    return GestureDetector(
                      onTap: () => context.push('/audio/details/${item.id}'),
                      child: Row(
                        children: [
                          // Thumbnail
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: SizedBox(
                              width: 80,
                              height: 60,
                              child: Stack(
                                children: [
                                  Positioned.fill(
                                    child: Image.network(
                                      item.thumbnailUrl ?? '',
                                      fit: BoxFit.cover,
                                      errorBuilder: (ctx, err, stack) => Container(color: Colors.grey.shade300),
                                    ),
                                  ),
                                  Center(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.3),
                                        shape: BoxShape.circle,
                                      ),
                                      padding: const EdgeInsets.all(4),
                                      child: const Icon(Icons.play_arrow, color: Colors.white, size: 20),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 4,
                                    right: 4,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.7),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        '10:15', // Mocking duration to match UI screenshot
                                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Text Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.title,
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'स्वर : ${item.speaker}',
                                  style: const TextStyle(fontSize: 13, color: greyText),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Actions
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: primaryOrange,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.play_arrow, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.more_vert, color: greyText),
                        ],
                      ),
                    );
                  },
                ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
