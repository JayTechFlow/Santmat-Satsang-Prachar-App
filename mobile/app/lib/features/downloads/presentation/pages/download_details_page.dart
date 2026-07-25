import 'package:flutter/material.dart';

class DownloadDetailsPage extends StatelessWidget {
  final String downloadId;

  const DownloadDetailsPage({super.key, required this.downloadId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Download Details')),
      body: const Center(child: Text('Download Details Coming Soon')),
    );
  }
}
