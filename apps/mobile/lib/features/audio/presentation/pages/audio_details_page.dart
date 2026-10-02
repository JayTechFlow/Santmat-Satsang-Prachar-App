import 'package:flutter/material.dart';
import 'now_playing_page.dart';

class AudioDetailsPage extends StatelessWidget {
  final String audioId;

  const AudioDetailsPage({super.key, required this.audioId});

  @override
  Widget build(BuildContext context) {
    return NowPlayingPage(audioId: audioId);
  }
}
