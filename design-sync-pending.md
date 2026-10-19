# Pending Redesign sync — PR #1145 (search page)

Temporary notes; delete once the Aura Historia Redesign file (Search page) matches the code.
Redesign: https://claude.ai/artifact/QRhqGsVofXjs5c86d11mrV

## 1. Filter sidebar: room for the scrollbar

- Boards: "Search · Filter panel", "Search · Results — desktop".
- Right padding between the filter groups and the scrollbar: 4px → 16px.
- Column stays 280px, so the filter groups are now 254px wide (16px padding + thin scrollbar).
- The scrollbar gutter is always reserved, so the content (e.g. "Reset all filters") doesn't shift
  when groups expand and the scrollbar appears. Boards should show the 254px content width whether
  or not the list scrolls.
- Code: `src/features/search/products/pages/ProductSearchPage.tsx` (`aside`, `pr-4`,
  `[scrollbar-gutter:stable]`).

## 2. Filter sidebar: nothing clipped on the left

- Boards: "Search · Filter panel", "Search · Filter controls", "Search · Filter drawer open — mobile 390".
- Focus outlines (2px brass, 3px offset) on fields and buttons that sit flush left were cut off by the
  scroll container and each group's collapsible body.
- Show the focus state of a left-aligned field (e.g. provider search) with its outline fully visible.
  The content's left edge is unchanged; the clipping area now starts 6px outside it.
- Code: `ProductSearchPage.tsx` (`aside`: `-ml-1.5 w-[286px] pl-1.5`),
  `src/features/search/common/components/filters/FilterCard.tsx` (`CollapsibleContent`: `-mx-1.5 -mt-1.5 px-1.5 pt-1.5`).

## 3. Sort select: styled menu instead of the native dropdown

- Boards: "Search · Results — desktop", "Search · Results — mobile 390"; add an open state of the menu
  (e.g. on "Search · Filter controls").
- The "Sort by" pill opens a design-system menu, the same as the header preference pickers:
  - panel: `surface-raised`, `rounded-panel`, `shadow-menu`, 4px padding, min width 192px, aligned to
    the pill's right edge, 6px below it;
  - rows: 44px high, 10px side padding, `text-sm` ink, `surface-sunken` on hover/focus;
  - selected row: medium weight and an oxblood check on the right.
- Pill unchanged: mono "SORT BY" label, value, chevron; 40px (toolbar) or 44px (compact).
- Code: `src/features/search/products/components/SearchSortControls.tsx` (now `@/components/ui/select`).
