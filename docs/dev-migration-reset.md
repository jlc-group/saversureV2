# Saversure V2 Dev Migration Reset

## Goal

Make V1 -> V2 migration testing predictable in development by resetting the whole V2 environment to a known baseline instead of deleting destination rows module by module.

## Recommended Baseline

- V1 source stays in `saversure_v1_backup`
- V2 target stays in `saversure`
- Save a clean V2 baseline dump at `backup/v2_dev_baseline.dump`
- Create the baseline only after:
  - schema migrations are up to date
  - tenant/admin seed data is ready
  - migrated V1 data has not been imported yet

## Recommended Dev Flow

1. Start Docker infrastructure with `docker compose up -d`
2. Reset V2 from baseline with `scripts/reset-v2-from-baseline.ps1`
3. Start or recreate the API container
4. Start admin/frontend apps
5. Verify `Source Connection` in Migration Center points to `saversure_v1_backup`
6. Run `Dry Run`
7. If the report looks correct, run `Execute`

## Why We Avoid Delete-Then-Reimport

- `customer` depends on `users.v1_user_id`, `migration_entity_maps`, and `point_ledger`
- `point_ledger` is immutable and should not be used as a delete/rebuild table
- `redeem_history` writes into `reward_reservations`, which is also used by live V2 flows
- deleting destination rows without clearing related maps can leave stale references and false skips

## Safe Reset Guidance By Module

| Module | Reset Strategy |
|--------|----------------|
| `customer` | Use full DB baseline reset or a brand-new tenant |
| `product` | Can be refreshed in an isolated dev tenant, but baseline reset is still simpler |
| `rewards` | Only safe if reward-related dependencies are reset together |
| `scan_history` | Best candidate for future fast refresh, but baseline reset is still the safest default |
| `redeem_history` | Use full DB baseline reset, do not treat as disposable on a shared dev DB |

## Helper Scripts

- Create/update baseline dump:
  - `powershell -ExecutionPolicy Bypass -File scripts/create-v2-baseline-snapshot.ps1`
- Reset V2 from baseline:
  - `powershell -ExecutionPolicy Bypass -File scripts/reset-v2-from-baseline.ps1 -Force`

## Performance Note

Current migration runners still process large datasets mostly row by row. That means:

- baseline reset is the best short-term speed win for repeated testing
- `chunk_size` helps job planning and progress reporting, but it is not a true bulk-load accelerator yet
- if `scan_history` is still too slow after the reset workflow is stable, the next step should be batch insert or `COPY`-style import inside `backend/internal/migrationjob/runners.go`

## Batch Optimization Plan

When the reset workflow is stable, optimize in this order:

1. `scan_history`
   - batch read from V1
   - batch insert into `scan_history`
   - commit per chunk instead of per row
2. `customer`
   - batch user insert/update
   - batch address insert
   - keep `point_ledger` logic append-only
3. `redeem_history`
   - batch snapshot insert into `reward_reservations`

Do not start by adding delete-then-reimport logic to every module. It increases complexity but does not remove the real bottleneck, which is per-row database work.
