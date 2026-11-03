# Pre-vetted clinical content (do not re-type on stage)

Everything in this folder was written and reviewed before the talk, with sources in the file headers,
and is covered by the tests next to it. The live build must IMPORT from here, never re-create these
numbers or this text from memory.

- `laao.ts` — CHA2DS2-VASc and HAS-BLED scoring, annual stroke risk (Friberg 2012), major-bleed rates
  (Pisters 2010), anticoagulation threshold (2023 ACC/AHA/ACCP/HRS).
- `mehran.ts` — Mehran contrast-nephropathy score (JACC 2004): points, renal bands, CIN and dialysis
  rates by category.
- `handouts.ts` — 20 plain-language discharge handouts (TAVR, PCI, LAAO, TEER, radial cath × simple /
  standard × English / Spanish) plus `getHandout`, `handoutText` and the section order.
