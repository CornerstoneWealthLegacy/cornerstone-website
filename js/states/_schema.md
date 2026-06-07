# State Module Schema

Each state is one JSON file (`<state>.json`) describing that state's estate-document
rules. The generator reads `states[userState]` instead of hard-coded Florida values.

⚠️ **Every state file must be drafted and verified by an attorney licensed in that
state before it is used to generate documents for that state's residents.** This
schema makes expansion possible; it does not make the law correct.

| Field | Type | Meaning |
|---|---|---|
| `state` / `abbr` | string | State name / 2-letter code |
| `minWillAge` | number | Minimum age to make a will |
| `will.witnesses` | number | Required witnesses |
| `will.witnessPresenceRule` | string | How witnesses must observe/sign |
| `will.notaryRequired` | bool | Is notarization required for validity? |
| `will.selfProvingAffidavit` | bool | Self-proving affidavit available? |
| `will.selfProvingStatute` | string | Statute citation |
| `will.holographicValid` | bool | Are handwritten/unwitnessed wills valid? |
| `will.oralValid` | bool | Are oral (nuncupative) wills valid? |
| `will.electronicValid` | bool | Electronic wills permitted? |
| `will.executionStatute` | string | Primary execution statute citation |
| `property.communityProperty` | bool | Community-property state? (affects spousal shares) |
| `property.homesteadProtection` | bool | Constitutional/statutory homestead protection? |
| `property.homesteadNotes` | string | Devise restrictions, citation |
| `property.electiveShare` | string | Spousal elective-share rule + citation |
| `prRestrictions` | string | Who may serve as personal representative |
| `poa.witnesses` | number | Durable POA execution witnesses |
| `poa.notaryRequired` | bool | POA notarization required? |
| `poa.superpowersRule` | string | Special-authority signing rule + citation |
| `poa.statute` | string | POA statute citation |
| `healthcare.surrogateForm` | string | Health-care surrogate/proxy form + citation |
| `healthcare.livingWillStatute` | string | Living will statute citation |
| `trust.code` | string | Trust code citation |
| `trust.agentAmendmentRule` | string | Can an agent amend the trust? citation |
| `landTrust` | string|null | Land-trust statute if recognized, else null |
| `ron` | bool | Remote online notarization available? |
| `reviewedBy` | string | Licensed attorney who verified this module |
| `reviewedDate` | string | Date verified |

To add a state: copy `_template.json`, have a licensed attorney in that state fill +
verify every field, name it `<state>.json`, and register it with the generator.
