import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../l10n/gen/app_localizations.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/widgets/ssp_image.dart';
import '../../domain/entities/satsang_entity.dart';
import '../providers/satsang_providers.dart';

class SatsangDetailsPage extends ConsumerStatefulWidget {
  final String satsangId;

  const SatsangDetailsPage({super.key, required this.satsangId});

  @override
  ConsumerState<SatsangDetailsPage> createState() => _SatsangDetailsPageState();
}

class _SatsangDetailsPageState extends ConsumerState<SatsangDetailsPage> {
  double _fontSize = 17.0;
  double _lineHeight = 1.8;
  bool _isBookmarked = false;
  bool _isPlayingAudio = false;
  final double _audioProgress = 0.25;

  Future<void> _shareSatsang(SatsangEntity satsang) async {
    final shareText = '${satsang.title}\nवक्ता: ${satsang.speaker.name}\n\n${satsang.description}\n\n— संतमत सत्संग प्रचार';
    try {
      await SharePlus.instance.share(ShareParams(text: shareText));
    } catch (_) {
      Clipboard.setData(ClipboardData(text: shareText));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('सत्संग की जानकारी कॉपी की गई!')),
        );
      }
    }
  }

  void _toggleBookmark() {
    setState(() {
      _isBookmarked = !_isBookmarked;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isBookmarked ? 'सत्संग बुकमार्क में जोड़ा गया' : 'सत्संग बुकमार्क से हटाया गया'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final satsangAsync = ref.watch(satsangDetailsProvider(widget.satsangId));
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: satsangAsync.when(
        loading: () => const SSPLoadingState(),
        error: (err, stack) => SSPErrorState(
          message: err.toString(),
          onRetry: () => ref.refresh(satsangDetailsProvider(widget.satsangId)),
        ),
        data: (satsang) {
          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              _buildHeroAppBar(theme, isDark, satsang),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSpeakerCard(theme, isDark, satsang),
                      const SizedBox(height: 16),
                      _buildAudioPlayerCard(theme, isDark, satsang),
                      const SizedBox(height: 16),
                      _buildReadingControlsBar(theme, isDark),
                      const SizedBox(height: 16),
                      _buildSpiritualQuoteCard(theme, isDark, satsang),
                      const SizedBox(height: 16),
                      _buildTranscriptReaderCard(theme, isDark, satsang, l10n),
                      const SizedBox(height: 24),
                      if (satsang.tags.isNotEmpty) ...[
                        Text(
                          'विषय टैग (Topics)',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.amber.shade400 : const Color(0xFFB45309),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: satsang.tags.map((tag) {
                            return Chip(
                              label: Text('#$tag'),
                              backgroundColor: isDark ? const Color(0xFF2E2A25) : const Color(0xFFFEF3C7),
                              side: BorderSide(
                                color: isDark ? Colors.amber.shade800 : const Color(0xFFFDE68A),
                              ),
                              labelStyle: TextStyle(
                                color: isDark ? Colors.amber.shade200 : const Color(0xFF92400E),
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeroAppBar(ThemeData theme, bool isDark, SatsangEntity satsang) {
    return SliverAppBar(
      expandedHeight: 260,
      pinned: true,
      backgroundColor: isDark ? const Color(0xFF181614) : const Color(0xFF7F1D1D),
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 16, right: 16, bottom: 14),
        title: Text(
          satsang.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
            shadows: [Shadow(color: Colors.black87, blurRadius: 6)],
          ),
        ),
        background: Stack(
          fit: StackFit.expand,
          children: [
            SSPImage(
              satsang.coverImageUrl.isNotEmpty
                  ? satsang.coverImageUrl
                  : satsang.thumbnailUrl,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => Container(
                color: isDark ? const Color(0xFF2A241F) : const Color(0xFFB45309),
                child: const Icon(Icons.menu_book, color: Colors.white, size: 60),
              ),
            ),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.transparent, Colors.black87],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(
            _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
            color: Colors.white,
          ),
          tooltip: 'बुकमार्क',
          onPressed: _toggleBookmark,
        ),
        IconButton(
          icon: const Icon(Icons.share, color: Colors.white),
          tooltip: 'शेयर',
          onPressed: () => _shareSatsang(satsang),
        ),
      ],
    );
  }

  Widget _buildSpeakerCard(ThemeData theme, bool isDark, SatsangEntity satsang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF221E1B) : const Color(0xFFFFFBF2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.amber.shade900.withAlpha(60) : const Color(0xFFFDE68A),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: isDark ? Colors.amber.shade900 : const Color(0xFFFEF3C7),
            backgroundImage: satsang.speaker.photoUrl != null && satsang.speaker.photoUrl!.isNotEmpty
                ? NetworkImage(satsang.speaker.photoUrl!)
                : null,
            child: (satsang.speaker.photoUrl == null || satsang.speaker.photoUrl!.isEmpty)
                ? Icon(Icons.person, color: isDark ? Colors.amber.shade300 : const Color(0xFFB45309))
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      satsang.speaker.name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.amber.shade400 : const Color(0xFF7F1D1D),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.verified, size: 16, color: Colors.amber),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  satsang.location.isNotEmpty ? satsang.location : 'संतमत सत्संग आश्रम',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark ? const Color(0xFFA8A29E) : const Color(0xFF57534E),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.amber.shade900.withAlpha(80) : const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        satsang.category.name,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.amber.shade300 : const Color(0xFFB45309),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF332D27) : const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${satsang.duration.inMinutes} मिनट • ${satsang.language}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFD6D3D1) : const Color(0xFF374151),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAudioPlayerCard(ThemeData theme, bool isDark, SatsangEntity satsang) {
    final primaryColor = isDark ? Colors.amber.shade400 : const Color(0xFFB45309);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1A17) : const Color(0xFFFFFBF0),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.amber.shade900.withAlpha(100) : const Color(0xFFFDE68A),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            iconSize: 42,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: Icon(
              _isPlayingAudio ? Icons.pause_circle_filled : Icons.play_circle_fill,
              color: primaryColor,
            ),
            onPressed: () {
              setState(() {
                _isPlayingAudio = !_isPlayingAudio;
              });
            },
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isPlayingAudio ? 'सत्संग प्रवर्द्धन जारी है...' : 'सत्संग ऑडियो सुनें',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: _audioProgress,
                  backgroundColor: isDark ? const Color(0xFF292524) : const Color(0xFFE5E7EB),
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '${satsang.duration.inMinutes}:00',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? const Color(0xFFA8A29E) : const Color(0xFF57534E),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReadingControlsBar(ThemeData theme, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1C1A) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF292524) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(
                'फॉन्ट:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFA8A29E) : const Color(0xFF57534E),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: _fontSize > 14.0
                    ? () => setState(() => _fontSize -= 1.5)
                    : null,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Text(
                  '${_fontSize.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: _fontSize < 28.0
                    ? () => setState(() => _fontSize += 1.5)
                    : null,
              ),
            ],
          ),
          Row(
            children: [
              Text(
                'दूरी:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFA8A29E) : const Color(0xFF57534E),
                ),
              ),
              const SizedBox(width: 6),
              DropdownButton<double>(
                value: _lineHeight,
                underline: const SizedBox.shrink(),
                isDense: true,
                items: const [
                  DropdownMenuItem(value: 1.5, child: Text('1.5x')),
                  DropdownMenuItem(value: 1.8, child: Text('1.8x')),
                  DropdownMenuItem(value: 2.2, child: Text('2.2x')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _lineHeight = val);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpiritualQuoteCard(ThemeData theme, bool isDark, SatsangEntity satsang) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF26211C) : const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(18),
        border: Border(
          left: BorderSide(
            color: isDark ? Colors.amber.shade500 : const Color(0xFFB45309),
            width: 4,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.format_quote,
                color: isDark ? Colors.amber.shade400 : const Color(0xFFB45309),
                size: 24,
              ),
              const SizedBox(width: 6),
              Text(
                'मुख्य संदेश (Key Message)',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.amber.shade300 : const Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            satsang.subtitle.isNotEmpty
                ? satsang.subtitle
                : 'प्रभु का ध्यान और सत्संग ही जीवन का सच्चा सहारा है।',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              fontStyle: FontStyle.italic,
              color: isDark ? const Color(0xFFE7E5E4) : const Color(0xFF78350F),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTranscriptReaderCard(
    ThemeData theme,
    bool isDark,
    SatsangEntity satsang,
    AppLocalizations l10n,
  ) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 680),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1B18) : const Color(0xFFFFFDF9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark ? const Color(0xFF292524) : const Color(0xFFF0E6D8),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 40 : 10),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.description,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.amber.shade400 : const Color(0xFF7F1D1D),
            ),
          ),
          const Divider(height: 24),
          Text(
            satsang.description,
            style: TextStyle(
              fontSize: _fontSize,
              height: _lineHeight,
              fontWeight: FontWeight.w400,
              color: isDark ? const Color(0xFFE7E5E4) : const Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }
}
