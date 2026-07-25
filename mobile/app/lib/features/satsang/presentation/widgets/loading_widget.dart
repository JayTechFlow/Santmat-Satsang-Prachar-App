import 'package:flutter/material.dart';

class SatsangLoadingWidget extends StatelessWidget {
  const SatsangLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}
