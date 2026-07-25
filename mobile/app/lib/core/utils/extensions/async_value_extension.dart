import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/error_state.dart';
import '../../../shared/widgets/loading_indicator.dart';

extension AsyncValueUI<T> on AsyncValue<T> {
  Widget whenDataOrError({
    required Widget Function(T data) data,
    Widget Function(Object error, StackTrace stackTrace)? error,
    Widget Function()? loading,
  }) {
    return when(
      data: data,
      error: error ?? (e, s) => ErrorState(message: e.toString()),
      loading: loading ?? () => const LoadingIndicator(),
    );
  }
}
