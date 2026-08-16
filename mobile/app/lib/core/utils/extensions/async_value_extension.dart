import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/design_system/components/ssp_error_state.dart';
import '../../../shared/design_system/components/ssp_loading_state.dart';

extension AsyncValueUI<T> on AsyncValue<T> {
  Widget whenDataOrError({
    required Widget Function(T data) data,
    Widget Function(Object error, StackTrace stackTrace)? error,
    Widget Function()? loading,
  }) {
    return when(
      data: data,
      error: error ?? (e, s) => SSPErrorState(message: e.toString()),
      loading: loading ?? () => const SSPLoadingState(),
    );
  }
}
