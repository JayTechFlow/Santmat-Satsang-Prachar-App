import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';

class NotificationSettingsPage extends StatelessWidget {
  const NotificationSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const SSPAppBar.standard(
        title: 'सूचना सेटिंग्स',
        subtitle: 'अधिसूचना प्राथमिकताएं प्रबंधित करें',
      ),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('General Notifications'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Satsang Notifications'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Audio Notifications'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Books Notifications'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Daily Quotes'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Events'),
            value: true,
            onChanged: (val) {},
          ),
          const Divider(),
          SwitchListTile(
            title: const Text('Sound'),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            title: const Text('Vibration'),
            value: true,
            onChanged: (val) {},
          ),
        ],
      ),
    );
  }
}
