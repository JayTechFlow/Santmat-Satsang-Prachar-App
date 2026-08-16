import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

/// Authoritative SSP Iconography Mapping
/// Standardized on rounded, intuitive Material symbols with Cupertino fallbacks where appropriate.
class SSPIcons {
  const SSPIcons._();

  // Navigation
  static const IconData home = Icons.home_rounded;
  static const IconData audioNav = Icons.music_note_rounded;
  static const IconData satsangNav = Icons.volunteer_activism_rounded;
  static const IconData libraryNav = Icons.library_music_rounded;
  static const IconData searchNav = Icons.search_rounded;
  static const IconData notificationsNav = Icons.notifications_rounded;
  static const IconData profileNav = Icons.person_rounded;
  static const IconData settingsNav = Icons.settings_rounded;

  // Audio Playback
  static const IconData play = Icons.play_arrow_rounded;
  static const IconData pause = Icons.pause_rounded;
  static const IconData skipNext = Icons.skip_next_rounded;
  static const IconData skipPrevious = Icons.skip_previous_rounded;
  static const IconData shuffle = Icons.shuffle_rounded;
  static const IconData repeat = Icons.repeat_rounded;
  static const IconData waveform = Icons.waves_rounded;
  static const IconData lyrics = Icons.lyrics_rounded;
  static const IconData queue = Icons.queue_music_rounded;
  static const IconData timer = CupertinoIcons.timer;

  // Content & Actions
  static const IconData favorite = Icons.favorite_rounded;
  static const IconData favoriteOutline = Icons.favorite_border_rounded;
  static const IconData bookmark = Icons.bookmark_rounded;
  static const IconData bookmarkOutline = Icons.bookmark_border_rounded;
  static const IconData share = Icons.share_rounded;
  static const IconData more = Icons.more_horiz_rounded;
  static const IconData filter = Icons.filter_list_rounded;

  // Navigation Arrows & Controls
  static const IconData arrowBack = Icons.arrow_back_ios_new_rounded;
  static const IconData arrowForward = Icons.arrow_forward_ios_rounded;
  static const IconData chevronRight = Icons.chevron_right_rounded;
  static const IconData expandMore = Icons.expand_more_rounded;
  static const IconData close = Icons.close_rounded;

  // System & Status
  static const IconData check = Icons.check_circle_rounded;
  static const IconData error = Icons.error_outline_rounded;
  static const IconData info = Icons.info_outline_rounded;
  static const IconData warning = Icons.warning_amber_rounded;
}
