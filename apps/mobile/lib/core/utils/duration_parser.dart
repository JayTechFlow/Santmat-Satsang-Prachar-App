/// Parses a `m:ss` or `h:mm:ss` duration string into a [Duration].
///
/// Returns [Duration.zero] for anything unparseable rather than throwing, so a
/// malformed duration can never break a player surface. Shared by the audio
/// mapper and the player surfaces so every surface agrees on the fallback.
Duration parseDurationString(String? value) {
  if (value == null) return Duration.zero;
  final trimmed = value.trim();
  if (trimmed.isEmpty) return Duration.zero;

  final parts = trimmed.split(':');
  try {
    switch (parts.length) {
      case 2:
        final minutes = int.parse(parts[0].trim());
        final seconds = int.parse(parts[1].trim());
        return Duration(minutes: minutes, seconds: seconds);
      case 3:
        final hours = int.parse(parts[0].trim());
        final minutes = int.parse(parts[1].trim());
        final seconds = int.parse(parts[2].trim());
        return Duration(hours: hours, minutes: minutes, seconds: seconds);
      default:
        return Duration.zero;
    }
  } on FormatException {
    return Duration.zero;
  }
}
