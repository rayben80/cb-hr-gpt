# Role Migration Report

## Summary
Member roles are now normalized to a fixed set of allowed values. Any legacy or
free-form role values are mapped to one of the allowed roles during data load,
Excel import, and member updates.

Allowed roles (literal values in the app):
- "\\ud300\\uc7a5" (team lead)
- "\\ud30c\\ud2b8\\uc7a5" (part lead)
- "\\ud300\\uc6d0" (member)

## Normalization Rules
1) If the role value is exactly one of the allowed roles, keep it.
2) If it contains the substring "\\ud300\\uc7a5", map to "\\ud300\\uc7a5".
3) If it contains the substring "\\ud30c\\ud2b8\\uc7a5", map to "\\ud30c\\ud2b8\\uc7a5".
4) Otherwise map to "\\ud300\\uc6d0".

## Scope
Normalization is applied in:
- data load from localStorage
- Excel import
- member add/edit/save flows
- team lead assign/remove flows
- member move across teams

## Report Generation
Use the helper in `src/utils/memberRoleUtils.ts`:
- `buildRoleNormalizationReport(teams)`

CLI script:
- `npm run role:report` (uses `initialTeamsData`)
- `npm run role:report -- --input path/to/teams.json --output role_migration_report.json`

The report includes:
- totalMembers
- changedMembers
- byRole counts
- detailed list of changes (memberId, name, fromRole, toRole, teamId/partId)

## Validation Checklist
- UI role selector shows only the three allowed roles.
- Saved data keeps the normalized roles.
- Team lead assignment sets role to "\\ud300\\uc7a5".
- Removing team lead resets role to "\\ud300\\uc6d0".

## Rollback
If a rollback is required:
1) Remove normalization calls in load/import/save paths.
2) Restore any custom role mappings used previously.
