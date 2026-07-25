import 'package:flutter/material.dart';

class PlaylistPage extends StatelessWidget {
  final String playlistId;

  const PlaylistPage({super.key, required this.playlistId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Playlist')),
      body: const Center(child: Text('Playlist coming soon')),
    );
  }
}
