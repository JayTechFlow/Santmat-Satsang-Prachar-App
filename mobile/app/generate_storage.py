import os

storage_dir = "lib/core/storage"
dirs = ["models", "providers", "utils", "resolvers", "cache", "validators", "exceptions"]
for d in dirs:
    os.makedirs(os.path.join(storage_dir, d), exist_ok=True)

