# Tasks: Advanced Interactive Table Plugin

**Feature Branch**: `001-advanced-table`  
**Input**: Design documents from `/specs/001-advanced-table/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No test tasks included - tests are optional and not explicitly requested in the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Implementation Strategy

**MVP Scope**: User Stories 1 & 2 (P1 priority)
- Story 1: Basic display with navigation
- Story 2: Column sorting and resizing

**Incremental Delivery**:
1. Phase 1 (Setup) → Phase 2 (Foundation) → MVP Stories (US1, US2)
2. After MVP validation → P2 Stories (US3, US4, US5, US6)
3. After P2 validation → P3 Story (US7)
4. Final polish and optimization

**Parallel Execution**: Tasks marked `[P]` can run simultaneously (different files, no dependencies)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure, dependencies, and development tools

- [X] T001 Create project structure per plan.md in repository root
- [X] T002 Initialize npm package with package.json (name: @matdata/yasgui-table-plugin, version: 1.0.0)
- [X] T003 [P] Install TypeScript 5.x as dev dependency with tsconfig.json (target: ES2018, strict mode)
- [X] T004 [P] Install and configure ESLint with standard config in .eslintrc.js
- [X] T005 [P] Install and configure Prettier with 100-char line limit in .prettierrc
- [X] T006 Install Tabulator 6.x as direct dependency
- [X] T007 [P] Install YASGUI/YASR as peer dependencies in package.json
- [X] T008 [P] Configure Rollup for UMD + ESM builds in rollup.config.js
- [X] T009 [P] Configure Terser for minification and cssnano for CSS minification
- [X] T010 [P] Setup Jest for unit testing in jest.config.js
- [X] T011 Create src/, styles/, tests/, demo/, dist/ directory structure
- [X] T012 [P] Create .gitignore with node_modules, dist/, coverage/
- [X] T013 [P] Create README.md with installation and basic usage instructions
- [X] T014 [P] Create CHANGELOG.md with version 1.0.0 entry
- [X] T015 [P] Add npm scripts in package.json (dev, build, test, lint, format)

**Checkpoint**: Project structure complete and ready for code development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [X] T016 [P] Create SPARQL result types in src/types/sparql.ts (SparqlBinding, ResultRow, SparqlResults)
- [X] T017 [P] Create plugin configuration types in src/types/config.ts (TabulatorPluginConfig, DisplayConfiguration, SortState)
- [X] T018 [P] Create Tabulator type extensions in src/types/tabulator.d.ts
- [X] T019 [P] Create table data types in src/types/table.ts (TableRow, TableColumn, SelectionRange)

### Core Plugin Infrastructure

- [X] T020 Create plugin entry point in src/index.ts (exports TablePlugin class)
- [X] T021 Implement main plugin class skeleton in src/plugin.ts (canHandleResults, draw, getDownloadInfo, destroy methods)
- [X] T022 [P] Implement configuration validation in src/utils/validators.ts (validateConfig function)
- [X] T023 [P] Implement localStorage wrapper in src/utils/storage.ts (load/save display config)
- [X] T024 [P] Implement theme utilities in src/utils/theme.ts (CSS variable bridge for YASGUI themes)

### SPARQL Parsing

- [X] T025 [P] Implement bindings parser in src/parsers/bindings-parser.ts (transforms SPARQL results to TableRow[])
- [X] T026 [P] Implement prefix resolver in src/parsers/prefix-resolver.ts (abbreviate/expand URIs)

### Base Styles

- [X] T027 [P] Create base plugin styles in styles/plugin.css (container, table wrapper)
- [X] T028 [P] Create light theme variables in styles/theme-light.css
- [X] T029 [P] Create dark theme variables in styles/theme-dark.css
- [X] T030 [P] Create control bar styles in styles/controls.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Table Display with Navigation (Priority: P1) 🎯 MVP

**Goal**: Display SPARQL SELECT results in a table with all columns, row numbers, virtual scrolling, and horizontal scroll

**Independent Test**: Execute a SPARQL query with 100+ rows and verify all columns display with correct headers, row numbers appear in first column, vertical scroll works smoothly, and horizontal scroll works when content exceeds viewport

### Implementation for User Story 1

- [X] T031 [P] [US1] Create table renderer in src/table-renderer.ts (initialize Tabulator with config)
- [X] T032 [P] [US1] Configure virtual scrolling in src/features/virtual-scroll.ts (renderVertical: 'virtual', virtualDomBuffer: 300)
- [X] T033 [US1] Implement canHandleResults() in src/plugin.ts (check for SELECT results with head.vars)
- [X] T034 [US1] Implement draw() method in src/plugin.ts (parse results, generate columns, initialize table)
- [X] T035 [US1] Generate table columns from SPARQL variables in src/table-renderer.ts (column definitions with row number column)
- [X] T036 [P] [US1] Create URI formatter in src/formatters/uri-formatter.ts (display full or abbreviated URIs)
- [X] T037 [P] [US1] Create literal formatter in src/formatters/literal-formatter.ts (display value with optional datatype)
- [X] T038 [P] [US1] Create blank node formatter in src/formatters/bnode-formatter.ts (format _:b0 style)
- [X] T039 [US1] Apply cell formatters to table columns in src/table-renderer.ts (based on binding type)
- [X] T040 [US1] Configure row number column as frozen/sticky in src/table-renderer.ts
- [X] T041 [US1] Implement horizontal scroll with proper layout in src/table-renderer.ts (width: 100%)
- [X] T042 [US1] Add empty result state handling in src/plugin.ts (display "No results" message)
- [X] T043 [US1] Add error handling for invalid SPARQL results in src/parsers/bindings-parser.ts

**Checkpoint**: User Story 1 complete - basic table display fully functional and testable

---

## Phase 4: User Story 2 - Column Sorting and Resizing (Priority: P1) 🎯 MVP

**Goal**: Enable sorting by clicking column headers and column width adjustment via drag

**Independent Test**: Click column headers to verify ascending/descending sort, drag column borders to verify resize with visual guides

### Implementation for User Story 2

- [X] T044 [P] [US2] Implement column resize handlers in src/features/column-resize.ts (persist widths to config)
- [X] T045 [P] [US2] Implement column sort configuration in src/table-renderer.ts (headerSort: true, sorters for different types)
- [X] T046 [US2] Add sort state persistence to display config in src/plugin.ts (save sortState to localStorage)
- [X] T047 [US2] Load and restore column widths from localStorage in src/plugin.ts (apply to Tabulator columns)
- [X] T048 [US2] Load and restore sort state from localStorage in src/plugin.ts (apply initialSort to Tabulator)
- [X] T049 [US2] Emit columnResize event in src/features/column-resize.ts (for external integrations)
- [X] T050 [US2] Emit columnSort event in src/features/column-resize.ts (for external integrations)
- [X] T051 [US2] Add validation for column width bounds (50-1000px) in src/utils/validators.ts

**Checkpoint**: User Story 2 complete - sorting and resizing fully functional, MVP ready for validation

---

## Phase 5: User Story 3 - Search and Filter (Priority: P2)

**Goal**: Search for text within table, filter matching rows, and highlight search terms

**Independent Test**: Type search term in search box, verify only matching rows display and terms are highlighted with theme-responsive colors

### Implementation for User Story 3

- [X] T052 [P] [US3] Create search control component in src/controls/search-control.ts (input field with debounce)
- [X] T053 [P] [US3] Implement search filter logic in src/table-renderer.ts (case-insensitive multi-column search)
- [X] T054 [P] [US3] Implement search highlighting in src/features/search-highlight.ts (wrap matches in <mark> tags)
- [X] T055 [US3] Apply theme-responsive highlight color via CSS variables in styles/plugin.css (--search-highlight-color)
- [X] T056 [US3] Add row count indicator to search control in src/controls/search-control.ts (show "X of Y rows")
- [X] T057 [US3] Integrate search control into plugin toolbar in src/plugin.ts
- [X] T058 [US3] Emit search event with match count in src/controls/search-control.ts
- [X] T059 [US3] Emit searchHighlight event after highlighting in src/features/search-highlight.ts
- [X] T060 [US3] Add search clear functionality (clear button or escape key) in src/controls/search-control.ts

**Checkpoint**: User Story 3 complete - search and filter fully functional

---

## Phase 6: User Story 4 - URI and Datatype Display Controls (Priority: P2)

**Goal**: Toggle between full/abbreviated URIs and show/hide datatype annotations

**Independent Test**: Click URI display toggle and verify URIs switch between `http://example.org/resource` and `ex:resource`, click datatype toggle and verify annotations like `^^xsd:integer` appear/disappear

### Implementation for User Story 4

- [X] T061 [P] [US4] Create display controls component in src/controls/display-controls.ts (URI and datatype toggle buttons)
- [X] T062 [US4] Update URI formatter to respect uriDisplayMode config in src/formatters/uri-formatter.ts
- [X] T063 [US4] Update literal formatter to respect showDatatypes config in src/formatters/literal-formatter.ts
- [X] T064 [US4] Integrate display controls into plugin toolbar in src/plugin.ts
- [X] T065 [US4] Implement updateConfig() method in src/plugin.ts (merge updates, save, re-render)
- [X] T066 [US4] Wire toggle button clicks to updateConfig() in src/controls/display-controls.ts
- [X] T067 [US4] Emit configChange event on configuration updates in src/plugin.ts
- [X] T068 [US4] Add WCAG AA contrast validation for datatype annotations in styles/plugin.css

**Checkpoint**: User Story 4 complete - display controls fully functional

---

## Phase 7: User Story 5 - Cell Content Management (Priority: P2)

**Goal**: Ellipsis mode for long content with click-to-expand, fit-to-data and fit-to-window controls

**Independent Test**: Enable ellipsis mode and verify long text truncates with "...", click cell to see full content in modal, click fit controls and verify column sizing adjusts

### Implementation for User Story 5

- [X] T069 [P] [US5] Create ellipsis formatter in src/formatters/ellipsis-formatter.ts (truncate with "..." when enabled)
- [X] T070 [P] [US5] Create modal overlay component for full content display in src/controls/display-controls.ts
- [X] T071 [P] [US5] Create fit controls component in src/controls/fit-controls.ts (fit-to-data, fit-to-window buttons)
- [X] T072 [US5] Add ellipsis mode toggle to display controls in src/controls/display-controls.ts
- [X] T073 [US5] Implement cell double-click handler to show modal in src/plugin.ts
- [X] T074 [US5] Implement fit-to-data logic in src/controls/fit-controls.ts (set Tabulator layout: 'fitData')
- [X] T075 [US5] Implement fit-to-window logic in src/controls/fit-controls.ts (set Tabulator layout: 'fitColumns')
- [X] T076 [US5] Integrate fit controls into plugin toolbar in src/plugin.ts
- [X] T077 [US5] Emit cellDoubleClick event when modal opens in src/plugin.ts
- [X] T078 [US5] Add modal styling with proper z-index and backdrop in styles/controls.css

**Checkpoint**: User Story 5 complete - content management fully functional

---

## Phase 8: User Story 6 - Selection and Copy (Priority: P2)

**Goal**: Select cells/ranges/rows and copy to clipboard with Ctrl+C

**Independent Test**: Click cells to select, drag to select range, press Ctrl+C, paste into text editor and verify tab-separated format

### Implementation for User Story 6

- [X] T079 [P] [US6] Implement cell selection logic in src/features/cell-selection.ts (single cell, range, row selection)
- [X] T080 [P] [US6] Implement clipboard copy in src/features/clipboard.ts (format as tab-separated values)
- [X] T081 [US6] Add cell click handler for selection in src/features/cell-selection.ts
- [X] T082 [US6] Add shift+click handler for range selection in src/features/cell-selection.ts
- [X] T083 [US6] Add row number click handler for row selection in src/features/cell-selection.ts
- [X] T084 [US6] Add keyboard listener for Ctrl+C/Cmd+C in src/features/clipboard.ts
- [X] T085 [US6] Implement Clipboard API with execCommand fallback in src/features/clipboard.ts
- [X] T086 [US6] Add selection styling via CSS in styles/plugin.css
- [X] T087 [US6] Implement getSelection() method in src/plugin.ts (returns SelectionRange)
- [X] T088 [US6] Implement clearSelection() method in src/plugin.ts
- [X] T089 [US6] Emit cellSelect event on selection change in src/features/cell-selection.ts
- [X] T090 [US6] Emit rowSelect event on row selection in src/features/cell-selection.ts
- [X] T091 [US6] Emit clipboard event on copy operation in src/features/clipboard.ts
- [X] T092 [US6] Emit selectionCleared event when selection cleared in src/plugin.ts

**Checkpoint**: User Story 6 complete - selection and copy fully functional

---

## Phase 9: User Story 7 - Export Functionality (Priority: P3)

**Goal**: Export table as Markdown/CSV to clipboard or download CSV file

**Independent Test**: Click "Copy as Markdown" and verify clipboard contains formatted table, click "Download CSV" and verify file downloads correctly

### Implementation for User Story 7

- [X] T093 [P] [US7] Create export controls component in src/controls/export-controls.ts (Markdown, CSV, Download buttons)
- [X] T094 [P] [US7] Implement Markdown export formatter in src/features/clipboard.ts (pipe-separated table)
- [X] T095 [P] [US7] Implement CSV export formatter in src/features/clipboard.ts (quoted fields, proper escaping)
- [X] T096 [US7] Implement getDownloadInfo() method in src/plugin.ts (returns CSV data and filename)
- [X] T097 [US7] Wire Markdown button to clipboard copy in src/controls/export-controls.ts
- [X] T098 [US7] Wire CSV button to clipboard copy in src/controls/export-controls.ts
- [X] T099 [US7] Wire Download button to file download trigger in src/controls/export-controls.ts
- [X] T100 [US7] Respect active search filter in export operations in src/features/clipboard.ts
- [X] T101 [US7] Generate filename with timestamp in src/plugin.ts (sparql-results-TIMESTAMP.csv)
- [X] T102 [US7] Integrate export controls into plugin toolbar in src/plugin.ts
- [X] T103 [US7] Emit export event on export operations in src/features/clipboard.ts
- [X] T104 [US7] Add CSV encoding tests for special characters (quotes, commas, newlines) in src/features/clipboard.ts

**Checkpoint**: User Story 7 complete - export functionality fully functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final optimizations, error handling, accessibility, and documentation

### Error Handling & Edge Cases

- [X] T105 [P] Handle empty result sets with user-friendly message in src/plugin.ts
- [X] T106 [P] Handle 100,000+ row datasets with performance warnings in src/plugin.ts
- [X] T107 [P] Handle extremely long cell content (10,000+ chars) in src/formatters/ellipsis-formatter.ts
- [X] T108 [P] Handle SPARQL variables with special characters in src/table-renderer.ts
- [X] T109 [P] Handle null/undefined values in sorting in src/table-renderer.ts
- [X] T110 [P] Handle URIs without matching prefixes in src/parsers/prefix-resolver.ts
- [X] T111 [P] Sanitize user search input for regex special characters in src/controls/search-control.ts
- [X] T112 [P] Prevent column resize to zero or negative width in src/features/column-resize.ts
- [X] T113 [P] Handle selection during scroll in src/features/cell-selection.ts
- [X] T114 [P] Handle large clipboard copy attempts (>100MB) with warnings in src/features/clipboard.ts

### Performance Optimization

- [X] T115 [P] Add debouncing to search input (300ms) in src/controls/search-control.ts
- [X] T116 [P] Optimize virtual scrolling buffer size for large datasets in src/features/virtual-scroll.ts
- [X] T117 [P] Implement lazy formatter application in src/table-renderer.ts
- [X] T118 [P] Add performance logging for render times in src/plugin.ts
- [X] T119 [P] Validate bundle size <80KB in build script

### Accessibility

- [X] T120 [P] Add ARIA labels to all controls in src/controls/
- [X] T121 [P] Ensure keyboard navigation works for all features in src/plugin.ts
- [X] T122 [P] Test screen reader compatibility for table content in demo/
- [X] T123 [P] Verify WCAG AA contrast in both themes in styles/

### Event System

- [X] T124 [P] Implement event emitter (on/off/once methods) in src/plugin.ts
- [X] T125 [P] Document all event types in src/types/events.ts
- [X] T126 [P] Add ready event after table initialization in src/plugin.ts
- [X] T127 [P] Add destroy event before cleanup in src/plugin.ts
- [X] T128 [P] Add error event for plugin errors in src/plugin.ts

### Demo & Documentation

- [X] T129 [P] Create demo HTML page in demo/index.html
- [X] T130 [P] Add DBpedia example query to demo in demo/demo.js
- [X] T131 [P] Add Wikidata example query to demo in demo/demo.js
- [X] T132 [P] Add custom endpoint example to demo in demo/demo.js
- [X] T133 [P] Style demo page in demo/styles.css
- [X] T134 [P] Update README.md with complete API documentation
- [X] T135 [P] Add code comments to complex formatters in src/formatters/
- [X] T136 [P] Add code comments to parser logic in src/parsers/
- [X] T137 [P] Update CHANGELOG.md with all features for v1.0.0

### Build & Distribution

- [X] T138 Create UMD build in rollup.config.js
- [X] T139 Create ESM build in rollup.config.js
- [X] T140 Generate minified versions with source maps in rollup.config.js
- [X] T141 Extract CSS to separate file in rollup.config.js
- [X] T142 Configure package.json exports for dual module support
- [X] T143 [P] Create .npmignore to exclude demo, tests, specs from package
- [X] T144 Validate package structure for npm publish

**Checkpoint**: Plugin polished, documented, and ready for release

---

## Dependency Graph

### Story Completion Order

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation) ← BLOCKING: All stories depend on this
  ↓
  ├─→ User Story 1 (Basic Display) ← MVP FIRST
  │     ↓
  ├─→ User Story 2 (Sort/Resize) ← MVP SECOND
  │     ↓
  │   [MVP Validation Checkpoint]
  │     ↓
  ├─→ User Story 3 (Search) ← Independent after MVP
  ├─→ User Story 4 (Display Controls) ← Independent after MVP
  ├─→ User Story 5 (Content Mgmt) ← Depends on US4 (ellipsis toggle)
  ├─→ User Story 6 (Selection) ← Independent after MVP
  │     ↓
  └─→ User Story 7 (Export) ← Depends on US6 (selection format logic)
        ↓
Phase 10 (Polish) ← After all stories complete
```

### Critical Path

1. **Setup** (T001-T015) → **Foundation** (T016-T030)
2. **US1 Implementation** (T031-T043) → **US2 Implementation** (T044-T051)
3. **MVP Validation** → Parallel P2 Stories (US3, US4, US6) + US5 (after US4)
4. **US7 Implementation** (T093-T104) → **Polish** (T105-T144)

### Parallel Execution Opportunities

**During Setup** (can run simultaneously):
- T003, T004, T005, T008, T009, T010, T012, T013, T014, T015

**During Foundation** (can run simultaneously):
- T016, T017, T018, T019 (all type definitions)
- T022, T023, T024 (all utilities)
- T025, T026 (both parsers)
- T027, T028, T029, T030 (all styles)

**During US1** (can run simultaneously):
- T031, T032 (table renderer and virtual scroll)
- T036, T037, T038 (all formatters)

**During US2** (can run simultaneously):
- T044, T045 (resize and sort config)

**During US3** (can run simultaneously):
- T052, T053, T054 (search control, filter, highlight)

**During US5** (can run simultaneously):
- T069, T070, T071 (ellipsis formatter, modal, fit controls)

**During US6** (can run simultaneously):
- T079, T080 (selection logic, clipboard)

**During US7** (can run simultaneously):
- T093, T094, T095 (export controls, Markdown formatter, CSV formatter)

**During Polish** (most tasks can run simultaneously):
- T105-T114 (error handling)
- T115-T119 (performance)
- T120-T123 (accessibility)
- T124-T128 (events)
- T129-T137 (documentation)

---

## Parallel Execution Examples

### Example 1: Foundation Phase

**Parallel Batch 1** (no dependencies):
```
T016: SPARQL types
T017: Config types
T018: Tabulator types
T019: Table types
```

**Parallel Batch 2** (no dependencies):
```
T022: Validators
T023: Storage utils
T024: Theme utils
T025: Bindings parser
T026: Prefix resolver
```

**Parallel Batch 3** (no dependencies):
```
T027: Base styles
T028: Light theme
T029: Dark theme
T030: Control styles
```

### Example 2: User Story 1 (After T020-T030 complete)

**Parallel Batch 1**:
```
T031: Table renderer
T032: Virtual scroll config
```

**Sequential**: T033 → T034 → T035 (plugin methods depend on each other)

**Parallel Batch 2**:
```
T036: URI formatter
T037: Literal formatter
T038: Bnode formatter
```

**Sequential**: T039 → T040 → T041 → T042 → T043 (table configuration)

### Example 3: Polish Phase

**Parallel Batch** (all can run simultaneously):
```
T105-T114: Error handling
T115-T119: Performance
T120-T123: Accessibility
T124-T128: Events
T129-T137: Documentation
T143: .npmignore
```

**Sequential** (build tasks have dependencies):
```
T138 → T139 → T140 → T141 → T142 → T144
```

---

## Validation Checklist

### Task Completeness per User Story

- ✅ **US1 (Basic Display)**: 13 tasks covering display, formatters, scroll, error handling
- ✅ **US2 (Sort/Resize)**: 8 tasks covering sorting, resizing, persistence, events
- ✅ **US3 (Search)**: 9 tasks covering search input, filter, highlight, events
- ✅ **US4 (Display Controls)**: 8 tasks covering URI/datatype toggles, config updates
- ✅ **US5 (Content Mgmt)**: 10 tasks covering ellipsis, modal, fit controls
- ✅ **US6 (Selection)**: 14 tasks covering selection, clipboard, events
- ✅ **US7 (Export)**: 12 tasks covering Markdown/CSV export, download

### Independent Testability

- ✅ **US1**: Can test by executing query and inspecting table display
- ✅ **US2**: Can test by clicking headers and dragging column borders
- ✅ **US3**: Can test by typing in search box
- ✅ **US4**: Can test by clicking toggle buttons
- ✅ **US5**: Can test by enabling ellipsis and clicking cells
- ✅ **US6**: Can test by selecting cells and pressing Ctrl+C
- ✅ **US7**: Can test by clicking export buttons

### Functional Requirements Coverage

All 39 FRs mapped to tasks:
- FR-001 to FR-007 (Core Display) → US1 tasks
- FR-008 to FR-012 (Cell Content) → US1, US4, US5 tasks
- FR-013 to FR-015 (Sorting) → US2 tasks
- FR-016 to FR-019 (Column Sizing) → US2, US5 tasks
- FR-020 to FR-023 (Search) → US3 tasks
- FR-024 to FR-028 (Selection) → US6 tasks
- FR-029 to FR-032 (Export) → US7 tasks
- FR-033 to FR-035 (Theming) → Foundation + US1 tasks
- FR-036 to FR-039 (Plugin Integration) → Foundation + US1, US2 tasks

### Success Criteria Coverage

All 10 SCs addressed:
- SC-001 (10k rows <2s) → T032 (virtual scroll)
- SC-002 (Search <5s) → T053, T115 (search + debounce)
- SC-003 (Clipboard format) → T080, T084
- SC-004 (CSV export) → T095, T096, T104
- SC-005 (Keyboard nav) → T121
- SC-006 (Browser compat) → All tasks (ES2018 transpilation)
- SC-007 (WCAG AA) → T024, T028, T029, T123
- SC-008 (Resize <100ms) → T044
- SC-009 (Search <500ms) → T053, T115
- SC-010 (First-attempt success) → T129-T137 (docs + demo)

---

## Task Summary

**Total Tasks**: 144
**Tasks per Phase**:
- Phase 1 (Setup): 15 tasks
- Phase 2 (Foundation): 15 tasks
- Phase 3 (US1): 13 tasks
- Phase 4 (US2): 8 tasks
- Phase 5 (US3): 9 tasks
- Phase 6 (US4): 8 tasks
- Phase 7 (US5): 10 tasks
- Phase 8 (US6): 14 tasks
- Phase 9 (US7): 12 tasks
- Phase 10 (Polish): 40 tasks

**Parallel Opportunities**: 78 tasks marked `[P]` (54% parallelizable)

**MVP Scope**: Phases 1-4 (51 tasks) deliver Stories 1 & 2

**Suggested First Sprint**: T001-T051 (Setup + Foundation + MVP)

---

## Format Validation

✅ **All tasks follow checklist format**: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ **All user story tasks labeled**: [US1] through [US7] markers applied
✅ **All file paths specified**: Every task includes exact file location
✅ **Dependencies clear**: Sequential vs parallel tasks identified
✅ **Independent testing criteria**: Each story phase includes test guidance
