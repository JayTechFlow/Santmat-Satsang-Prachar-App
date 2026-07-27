import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/audio_providers.dart';

class AudioDetailsPage extends ConsumerWidget {
  final String audioId;

  const AudioDetailsPage({
    super.key,
    required this.audioId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // We will build this exactly as the screenshot.
    const primaryBrown = Color(0xFF8B2B0F);
    const greyText = Color(0xFF757575);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leadingWidth: 150,
        leading: Row(
          children: [
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
              onPressed: () => context.pop(),
            ),
            const Text(
              'अब चल रहा है',
              style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border, color: Colors.black),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share, color: Colors.black),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Large Artwork
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  height: 250,
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
                      // Gradient Overlay for text
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              Colors.black.withValues(alpha: 0.6),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                      // Top Left Logo & Text
                      Positioned(
                        top: 16,
                        left: 16,
                        child: Column(
                          children: const [
                            Icon(Icons.wb_twilight, color: Colors.white, size: 32),
                            SizedBox(height: 4),
                            Text(
                              'संतमत सत्संग\nप्रचार',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      // Main text
                      Positioned(
                        top: 90,
                        left: 24,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'सत्संग',
                              style: TextStyle(
                                color: primaryBrown,
                                fontSize: 40,
                                fontWeight: FontWeight.bold,
                                height: 1.0,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'से ही जीवन का उद्धार है।',
                              style: TextStyle(
                                color: Colors.black87,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Aaj Ka Suvichar Badge (Top Right in this screen)
                      Positioned(
                        top: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xCC3E2015),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.wb_sunny_outlined, color: Colors.white, size: 14),
                              SizedBox(width: 4),
                              Text(
                                'आज का सुविचार',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
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
            const SizedBox(height: 24),
            // Track Info
            const Text(
              'प्रभु से प्रीत लगाई रे',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 4),
            const Text(
              'स्वर : पूज्य श्री',
              style: TextStyle(fontSize: 14, color: greyText),
            ),
            const SizedBox(height: 24),
            // Progress Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: primaryBrown,
                      inactiveTrackColor: Colors.grey.shade300,
                      thumbColor: primaryBrown,
                      trackHeight: 4.0,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6.0),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 14.0),
                    ),
                    child: Slider(
                      value: 0.25,
                      onChanged: (val) {},
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('02:45', style: TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.w500)),
                        Text('10:30', style: TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Playback Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Column(
                  children: const [
                    Icon(Icons.shuffle, color: greyText, size: 24),
                    SizedBox(height: 4),
                    Text('शफ़ल', style: TextStyle(color: greyText, fontSize: 10)),
                  ],
                ),
                const Icon(Icons.skip_previous, color: Colors.black87, size: 36),
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    color: primaryBrown,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.pause, color: Colors.white, size: 32),
                ),
                const Icon(Icons.skip_next, color: Colors.black87, size: 36),
                Column(
                  children: const [
                    Icon(Icons.repeat, color: greyText, size: 24),
                    SizedBox(height: 4),
                    Text('दोहराएँ', style: TextStyle(color: greyText, fontSize: 10)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Action Buttons Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildActionButton(Icons.replay_10, '10 सेकंड पीछे'),
                  const SizedBox(width: 8),
                  _buildActionButton(Icons.library_music_outlined, 'लिरिक्स'),
                  const SizedBox(width: 8),
                  _buildActionButton(Icons.favorite_border, 'पसंदीदा'),
                  const SizedBox(width: 8),
                  _buildActionButton(Icons.share, 'शेयर करें'),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Up Next Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'आगे सुनें (Up Next)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  Row(
                    children: const [
                      Text(
                        'सभी भजन देखें',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: primaryBrown),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward, color: primaryBrown, size: 16),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Up Next List
            _buildUpNextItem('मनवा रे सत्संग कर ले', '08:42', isFirst: true),
            _buildUpNextItem('दुनिया से मन हटाले रे', '11:30'),
            _buildUpNextItem('गुरु चरणों में मन लगा ले', '09:15'),
            _buildUpNextItem('सत्संग सुनो, जीवन संवारो', '07:28'),
            _buildUpNextItem('तेरा नाम ही आधार है', '12:05'),
            const SizedBox(height: 120), // Space for mini player + nav bar if added
          ],
        ),
      ),
      // Mocking Bottom Navigation and Mini Player exactly like the screenshot
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Mini Player
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF9F9F9),
              border: Border(top: BorderSide(color: Colors.grey.shade300)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1604871000636-074FA5117945?auto=format&fit=crop&w=100&q=80',
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Container(color: Colors.grey.shade300, width: 40, height: 40),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('प्रभु से प्रीत लगाई रे', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('स्वर : पूज्य श्री', style: TextStyle(color: greyText, fontSize: 12)),
                    ],
                  ),
                ),
                const Icon(Icons.skip_previous, color: Colors.black87),
                const SizedBox(width: 16),
                const Icon(Icons.pause, color: Colors.black87),
                const SizedBox(width: 16),
                const Icon(Icons.skip_next, color: Colors.black87),
              ],
            ),
          ),
          // Bottom Navigation Bar
          BottomNavigationBar(
            currentIndex: 1, // Audio is selected
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: primaryBrown,
            unselectedItemColor: greyText,
            selectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            unselectedLabelStyle: const TextStyle(fontSize: 12),
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'होम'),
              BottomNavigationBarItem(icon: Icon(Icons.music_note), label: 'ऑडियो'),
              BottomNavigationBarItem(icon: Icon(Icons.volunteer_activism_outlined), label: 'स्तुति-बिन्ती'),
              BottomNavigationBarItem(icon: Icon(Icons.notifications_outlined), label: 'सूचनाएँ'),
              BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'प्रोफ़ाइल'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.black87, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(color: Color(0xFF757575), fontSize: 10, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpNextItem(String title, String duration, {bool isFirst = false}) {
    return Container(
      color: isFirst ? const Color(0xFFFFF7F0) : Colors.white, // Soft orange tint for the first item
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: SizedBox(
              width: 50,
              height: 50,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Image.network(
                      'https://images.unsplash.com/photo-1604871000636-074FA5117945?auto=format&fit=crop&w=100&q=80',
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(color: Colors.grey.shade300),
                    ),
                  ),
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.play_arrow, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87)),
                const SizedBox(height: 4),
                const Text('स्वर : पूज्य श्री', style: TextStyle(color: Color(0xFF757575), fontSize: 12)),
              ],
            ),
          ),
          // Duration
          Text(duration, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87)),
          const SizedBox(width: 16),
          const Icon(Icons.more_vert, color: Color(0xFF757575)),
        ],
      ),
    );
  }
}
