enum ConflictResolutionStrategy {
  lastWriteWins,
  serverWins,
  clientWins,
  mergeStrategy,
  timestampComparison,
  versionComparison,
  customResolverHooks,
}
