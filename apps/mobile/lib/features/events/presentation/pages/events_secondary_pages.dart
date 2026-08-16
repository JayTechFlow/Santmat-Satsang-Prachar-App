import 'package:flutter/material.dart';

class EventDetailsPage extends StatelessWidget {
  final String eventId;

  const EventDetailsPage({super.key, required this.eventId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Details')),
      body: const Center(child: Text('Event Details Coming Soon')),
    );
  }
}

class MyEventsPage extends StatelessWidget {
  const MyEventsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Registered Events')),
      body: const Center(child: Text('Registered Events Coming Soon')),
    );
  }
}

class EventRegistrationPage extends StatelessWidget {
  final String eventId;

  const EventRegistrationPage({super.key, required this.eventId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register for Event')),
      body: const Center(child: Text('Registration Coming Soon')),
    );
  }
}
