import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/events_providers.dart';
import '../widgets/events_state_widgets.dart';
import '../widgets/event_card.dart';
import '../widgets/featured_event_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class EventsHomePage extends ConsumerWidget {
  const EventsHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(eventsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Events & Programs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.event_available),
            onPressed: () => context.push('/events/my-events'),
          ),
        ],
      ),
      body: state.isLoading
          ? const EventsLoadingWidget()
          : state.error != null
          ? EventsErrorWidget(
              message: state.error!,
              onRetry: () => ref.read(eventsProvider.notifier).loadData(),
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(eventsProvider.notifier).loadData(),
              child: CustomScrollView(
                slivers: [
                  if (state.featuredEvents.isNotEmpty) ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.sp16),
                        child: Text(
                          'Featured Events',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: SizedBox(
                        height: 200,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sp16,
                          ),
                          itemCount: state.featuredEvents.length,
                          itemBuilder: (context, index) {
                            return FeaturedEventCard(
                              event: state.featuredEvents[index],
                              onTap: () => context.push(
                                '/events/details/${state.featuredEvents[index].id}',
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.sp16),
                      child: Text(
                        'Upcoming Events',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sp16,
                        ),
                        child: EventCard(
                          event: state.upcomingEvents[index],
                          onTap: () => context.push(
                            '/events/details/${state.upcomingEvents[index].id}',
                          ),
                        ),
                      );
                    }, childCount: state.upcomingEvents.length),
                  ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
                ],
              ),
            ),
    );
  }
}
