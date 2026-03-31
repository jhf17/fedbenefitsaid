export const REF_DATA = [
  {cat:'FERS Pension',icon:'🏛️',color:'#1d4ed8',topics:[
    {id:'fers-eligibility',title:'Retirement Types & Eligibility',summary:'Immediate, deferred, disability, and MRA+10 paths',
     overview:'FERS offers several retirement paths depending on age and years of creditable service. Choosing the right type determines benefit amount, supplement eligibility, and FEH/ continuation.',
     rules:[
       'Immediate Unreduced: MRA+30 years, Age 60+20 years, or Age 62+5 years',
       'Immediate Reduced (MRA+10): 5% per year under age 62 (or age 60 if 20+ years) — penalty avoided by postponing annuity start',
       'Deferred Retirement: Any employee with 5+ years; annuity starts at MRA or later age elected',
       'VERA: Age 50+20 years OR any age+25 years, with OPM agency authorization required',
       'Disability Retirement: 18+ months service; must be approved by OPM; SS application required within 1 year',
       'Phased Retirement: Work 50% schedule, receive 50% annuity; requires agency approval and mentorship commitment'
     ],
     numbers:[
       {label:'MRA (born 1970+)',value:'Age 57'},
       {label:'MRA (born 1953–1964)',value:'Age 56'},
       {label:'MRA (born before 1948)',value:'Age 55'},
       {label:'VERA minimum age',value:'50 (with 20+ years)'},
       {label:'VERA any age',value:'25+ years of service'},
       {label:'Disability minimum service',value:'18 months'}
     ],
     watch:[
       'MRA+10 retirees who postpone annuity lose FEH/ during the postponement period — must pay full premium out of pocket',
       'Deferred retirees do NOT receive the FERS Supplement at any age',
       'VERA retirees who retire before their MRA must wait until MRA for the FERS Supplement to begin'
     ]},
    {id:'fers-annuity-calc',title:'Annuity Calculation & Multipliers',summary:'1% vs 1.1% multiplier, High-3, and service credit',
     overview:'The FERS annuity formula is straightforward: High-3 Average Salary × Service Years × Multiplier. The multiplier depends on age at retirement and years of service.',
     rules:[
       'Standard multiplier: 1.0% × High-3 × creditable service years',
       'Enhanced multiplier: 1.1% × High-3 × years — applies at age 62 with 20+ years of service',
       'Unused sick leave: fully credited toward service years at retirement (1 hour = 1 hour of service)',
       'LWOP: up to 6 months per calendar year counts as creditable service; excess does NOT',
       'Part-time service: prorated — only actual hours worked count toward service',
       'Military service: can be credited with a deposit paid (generally 3% of military pay)'
     ],
     numbers:[
       {label:'Standard multiplier',value:'1.0% per year'},
       {label:'Enhanced multiplier (age 62, 20+ yrs)',value:'1.1% per year'},
       {label:'Example (62, 25 yrs, $80K High-3)',value:'$22,000/year ($80K × 1.1% × 25)'},
       {label:'Max LWOP credit/year',value:'6 months'},
       {label:'Military deposit rate',value:'~3% of military basic pay'}
     ],
     watch:[
       'The 0.1% difference compounds significantly over time — a 25-year employee gets 2.5% more annually by waiting to 62',
       'Sick leave cannot be converted to cash but IS credited as service — never take it just to use it before retirement',
       'Part-time employees must count only actual hours, not full-time equivalents, for service credit'
     ]},
    {id:'fers-high3',title:'High-3 Average Salary',summary:'Highest 36 consecutive months of basic pay',
     overview:"The High-3 is the foundation of the FERS annuity calculation. It is the average of basic pay over the highest 36 consecutive months in the employee's career.",
     rules:[
       'Must be 36 consecutive months — not simply the last 3 calendar years',
       'Only basic pay counts: locality pay is included; overtime, bonuses, and awards are excluded',
       'For most employees approaching retirement, High-3 = final 3 years (pay peaks late in career)',
       'High-3 could fall earlier in career if pay was highest then (rare but possible after demotion)',
       'Part-time employees: High-3 based on full-time equivalent basic pay rate, not actual earnings'
     ],
     numbers:[
       {label:'High-3 window',value:'Highest 36 consecutive months'},
       {label:'Includes',value:'Basic pay + locality pay'},
       {label:'Excludes',value:'Overtime, bonuses, awards, allowances'}
     ],
     watch:[
       'A promotion in the final year significantly boosts High-3 — a 10% raise in final year adds ~3.3% to High-3',
       'Employees who demote before retirement may have their High-3 from an earlier, higher-paid period',
       'Check your SF-50 history — OPM uses official pay records, not self-reported estimates'
     ]},
    {id:'fers-supplement',title:'FERS Supplement',summary:'Bridge income from retirement to SS eligibility at 62',
     overview:'The FERS Supplement (Special Retirement Supplement) is an additional monthly payment that approximates what Social Security would pay based on FERS-covered service, bridging the gap until age 62.',
     rules:[
       'Eligible: Immediate annuity retirees under age 62 (MRA+30, Age 60+20, Special Provisions)',
       'NOT eligible: MRA+10 deferred or postponed annuity retirees',
       'NOT eligible: VERA retirees until they reach their MRA',
       'Subject to Social Security-style earnings test: $1 withheld per $2 earned above annual limit',
       'Only wages and self-employment income count — not investment, pension, or rental income',
       'Terminates automatically on 62nd birthday regardless of earnings or claiming status'
     ],
     numbers:[
       {label:'2026 earnings test limit',value:'$24,480'},
       {label:'Reduction rate',value:'$1 withheld per $2 above limit'},
       {label:'Termination age',value:'62 (automatic)'},
       {label:'Calculation basis',value:'Approximate SS benefit × (FERS years ÷ 40)'}
     ],
     watch:[
       'Part-time work after retirement can reduce the supplement significantly — monitor earnings each year',
       'The supplement is NOT adjusted by COLA — it stays flat until terminating at 62',
       'A VERA retiree at age 50 could wait 7 years for the supplement to begin at their MRA of 57'
     ]},
    {id:'fers-disability',title:'Disability Retirement',summary:'60%/40% structure, OPM approval, OWCP interaction',
     overview:"FERS disability retirement provides income when a medical condition prevents performance of the essential functions of the employee's position. It requires OPM approval and is distinct from OWCP workers' compensation.",
     rules:[
       'Minimum service: 18 months of creditable federal civilian service',
       'First 12 months: 60% of High-3 average salary',
       'After 12 months (until age 62): 40% of High-3 average salary',
       'At age 62: annuity recalculated using years of actual service plus disability period',
       'Must apply for Social Security disability within 1 year of FERS disability application',
       'SSDI offset: if approved, FERS benefit reduced by 100% of SSDI for first year, then 60% thereafter',
       'Cannot simultaneously receive OWCP wage-loss compensation and FERS disability annuity'
     ],
     numbers:[
       {label:'Minimum service',value:'18 months'},
       {label:'Year 1 rate',value:'60% of High-3'},
       {label:'Year 2+ rate',value:'40% of High-3'},
       {label:'SSDI deadline',value:'1 year after FERS disability application'}
     ],
     watch:[
       'Many employees on OWCP delay applying for FERS disability — at some point transitioning may be advantageous',
       'The 40% rate can be very low for employees with small High-3 salaries',
       'At age 62, OPM recalculates using a full-service formula which often pays significantly more'
     ]},
    {id:'fers-survivor',title:'Survivor Annuity Elections',summary:'Full, partial, or no survivor — elected at retirement',
     overview:"At retirement, FERS employees must elect what portion of their annuity a surviving spouse will receive. This election permanently reduces the retiree's annuity in exchange for protecting the survivor.",
     rules:[
       "Full survivor annuity: 50% of unreduced annuity to spouse; retiree's annuity reduced by ~10%",
       "Partial survivor annuity: 25% of unreduced annuity; retiree's annuity reduced by ~5%",
       'No survivor: full annuity to retiree; spouse receives nothing from OPM after death',
       'Spouse must consent in writing to less than full survivor election',
       'FEH/ coverage: surviving spouse loses FEH/ if no survivor annuity is elected',
       'Post-retirement marriage: can add survivor within 2 years of marriage with OPM notification',
       'Insurable interest election: can provide survivor annuity to non-spouse dependent'
     ],
     numbers:[
       {label:'Full survivor (50%)',value:"~10% reduction to retiree's annuity"},
       {label:'Partial survivor (25%)',value:"~5% reduction to retiree's annuity"},
       {label:'Deadline to add new spouse',value:'Within 2 years of marriage'}
     ],
     watch:[
       "The 'no survivor' election saves money monthly but eliminates spouse's FEH/ — a critical consideration if spouse relies on FEHB",
       'Once elected, the amount cannot be increased — only reduced or eliminated with spousal consent',
       "A divorced spouse may have court-ordered survivor annuity rights that override the retiree's wishes"
     ]}
  ]},
  {cat:'TSP',icon:'💰',color:'#059669',topics:[
    {id:'tsp-contributions',title:'Contributions & Agency Matching',summary:'Limits, matching formula, and vesting schedule',
     overview:'The TSP is a defined-contribution retirement savings plan. FERS employees receive significant employer contributions, making full participation critical to maximizing retirement income.',
     rules:[
       'Agency Automatic 1%: deposited every pay period regardless of employee contribution',
       'Agency Match: dollar-for-dollar on first 3% of salary contributed; $0.50 per dollar on next 2%',
       'To capture full match: contribute at least 5% of salary each pay period',
       'Vesting: employee contributions immediately 100% vested; agency matching immediately vested; agency 1% auto vests after 3 years (2 years for some positions)',
       'Contribution types: Traditional (pre-tax) or Roth (after-tax) or combination',
       'Catch-up contributions: age 50+ may contribute above standard limit; mandatory Roth if prior-year wages exceeded $150,000 (effective 2026)'
     ],
     numbers:[
       {label:'2026 elective deferral limit',value:'$24,500'},
       {label:'2026 catch-up (age 50–59)',value:'+$8,000 ($32,500 total)'},
       {label:'2026 catch-up (age 60–63 super)',value:'+$11,250 ($35,750 total)'},
       {label:'2026 catch-up (age 64+)',value:'+$8,000 ($32,500 total)'},
       {label:'Maximum government contribution',value:'5% of salary'},
       {label:'Agency 1% auto vesting',value:'3 years service (2 for certain positions)'}
     ],
     watch:[
       'Contribute unevenly and hit the annual limit early? The agency match stops too — spread contributions across all 26 pay periods',
       'New hire must wait until 3-year anniversary to be vested in the 1% auto contribution — leaving before then forfeits it',
       'CSRS employees: no agency contributions, but can still make employee contributions'
     ]},
    {id:'tsp-funds',title:'Investment Funds Overview',summary:'G, F, C, S, I, and L Funds explained',
     overview:'TSP offers five core funds and a series of Lifecycle (L) Funds that blend all five. Each fund tracks a different market index or government securities.',
     rules:[
       'G Fund: U.S. Treasury securities; only fund guaranteed never to lose value; returns lower long-term',
       'F Fund: Bloomberg U.S. Aggregate Bond Index; can lose value; includes investment-grade bonds',
       'C Fund: S&P 500 index; large U.S. companies; highest long-term historical returns among single funds',
       'S Fund: Dow Jones U.S. Completion Index; small and mid-cap U.S. companies not in S&P 500',
       'I Fund: MSCI EAFE+ Index; international stocks (Europe, Asia, Australia, Canada, Mexico)',
       'L Funds: Automatic age-based blends of all 5 funds; rebalance quarterly; L Income, L 2030 through L 2075',
       'Interfund transfers: 2 unrestricted per month; additional IFTs only into G Fund'
     ],
     numbers:[
       {label:'IFTs per month (unrestricted)',value:'2'},
       {label:'Additional IFTs restriction',value:'G Fund only'},
       {label:'G Fund guarantee',value:'No loss of principal, ever'},
       {label:'C Fund tracks',value:'S&P 500 (500 largest U.S. companies)'}
     ],
     watch:[
       'Leaving too much in G Fund in early career significantly reduces long-term retirement accumulation',
       'L Funds are appropriate for most participants — they auto-adjust and eliminate the need for active management',
       'The I Fund does not include emerging markets (though a change is periodically debated by the TSP board)'
     ]},
    {id:'tsp-roth',title:'Traditional vs. Roth TSP',summary:'Pre-tax vs after-tax contributions and withdrawal rules',
     overview:'TSP participants can split contributions between Traditional (pre-tax) and Roth (after-tax) in any proportion. The tax treatment differs significantly, especially in retirement.',
     rules:[
       'Traditional TSP: contributions reduce taxable income now; all withdrawals taxed as ordinary income in retirement',
       'Roth TSP: contributions made after tax; qualified withdrawals (age 59½ + 5-year holding) are completely tax-free',
       "Roth TSP: no RMDs during the participant's lifetime (as of 2024 rule change — must roll to Roth IRA to maintain this)",
       'Both types: same contribution limits ($24,500 in 2026); limit applies to combined contributions',
       'In-plan Roth conversion: available in TSP beginning 2026 — can convert traditional balance to Roth within TSP',
       'Roth advantage: strongest for younger employees in lower tax brackets now who expect higher brackets in retirement'
     ],
     numbers:[
       {label:'Combined 2026 limit (Trad + Roth)',value:'$24,500'},
       {label:'Roth qualified withdrawal age',value:'59½ (+ 5-year holding period)'},
       {label:'Roth TSP RMDs',value:"None during participant's lifetime (2024+)"}
     ],
     watch:[
       'If you contributed to Roth TSP before 2024, RMD rules still applied — the exemption is prospective',
       'In-plan Roth conversions (new 2026) trigger ordinary income tax on converted amounts in year of conversion',
       'High earners in peak earning years usually benefit more from Traditional (defer tax to lower-income retirement)'
     ]},
    {id:'tsp-loans',title:'TSP Loans',summary:'General purpose and residential loan rules',
     overview:'Active employees can borrow from their TSP account. Loans must be repaid through payroll deduction and carry specific rules to avoid triggering taxes.',
     rules:[
       'General Purpose loan: any reason; $1,000 minimum; repay within 1–5 years',
       'Residential loan: primary home purchase or construction only; repay within 1–15 years',
       'Interest rate: G Fund rate at time of loan (charged to yourself — interest returns to your account)',
       'No credit check; payroll deduction repayment mandatory; one of each type allowed simultaneously',
       'Loan amount: maximum 50% of vested balance or $50,000, whichever is less',
       'Separation with outstanding loan: loan becomes taxable distribution within 90 days unless repaid',
       'Loans reduce the balance generating investment returns — opportunity cost is real'
     ],
     numbers:[
       {label:'Minimum loan amount',value:'$1,000'},
       {label:'Maximum loan amount',value:'50% of vested balance or $50,000'},
       {label:'General purpose term',value:'1–5 years'},
       {label:'Residential loan term',value:'1–15 years'}
     ],
     watch:[
       'Unpaid loan at separation = taxable distribution (and 10% penalty if under 59½) — must repay or refinance quickly',
       'Simultaneous loans: only 1 general purpose + 1 residential allowed at a time',
       'Interest paid on residential loan is NOT tax-deductible (unlike a mortgage)'
     ]},
    {id:'tsp-withdrawals',title:'Withdrawals & RMDs',summary:'In-service, post-separation, and required minimum distribution rules',
     overview:'TSP withdrawal rules depend on employment status, age, and how funds were contributed. Understanding the options prevents unnecessary taxes and penalties.',
     rules:[
       'In-service withdrawals: age 59½+ allows penalty-free withdrawal; financial hardship withdrawal available earlier',
       'Post-separation (general): age 55+ in year of separation = no 10% early withdrawal penalty',
       'Post-separation (public safety): age 50+ in year of qualifying separation = no penalty',
       'Below age 55 at separation: 10% early withdrawal penalty applies (exceptions: disability, QDRO, 72(t) payments)',
       'RMDs: must begin at age 73 (born 1951–1959) or age 75 (born 1960+, effective 2033)',
       "Roth TSP: no RMDs during participant's lifetime (roll to Roth IRA to maintain this benefit)",
       'Withdrawal options: single payment, monthly payments, TSP life annuity, or combination'
     ],
     numbers:[
       {label:'In-service penalty-free age',value:'59½'},
       {label:'Post-separation penalty-free',value:'Age 55 in year of separation'},
       {label:'Public safety penalty-free',value:'Age 50 in year of qualifying separation'},
       {label:'RMD age (born 1951–1959)',value:'73'},
       {label:'RMD age (born 1960+)',value:'75 (effective 2033)'}
     ],
     watch:[
       "Separating at age 54 in December? The 'rule of 55' doesn't apply — must actually be 55 in the year of separation",
       'Roth TSP RMD exemption: only if balance remains in TSP or is rolled to Roth IRA; Roth IRA has no RMDs',
       'TSP life annuity option locks in income for life but eliminates flexibility — irreversible once elected'
     ]}
  ]},
  {cat:'FEHB',icon:'🏥',color:'#dc2626',topics:[
    {id:'fehb-overview',title:'Enrollment Options & Plan Types',summary:'Self, Self+1, Self+Family; FFS, HMO, HDHP',
     overview:'FEH/ is one of the most comprehensive employer-sponsored health insurance programs in the world. Federal employees choose from hundreds of plans in three enrollment tiers.',
     rules:[
       'Enrollment tiers: Self Only, Self Plus One (Self+1), Self and Family',
       'Plan types: Fee-for-Service (FFS/PPO), Health Maintenance Organization (HMO), High Deductible Health Plan (HDHP), Consumer-Driven',
       'Open Season: annually in November; changes effective January 1 of following year',
       'New employees: 60 days from start date to enroll (or waive)',
       'Qualifying Life Events (QLE): 60 days to change enrollment (marriage, divorce, birth, etc.)',
       'Government premium share: approximately 70–75% of premium for most plans',
       'Premium withheld pretax from paycheck (active employees) — taxable benefit for domestic partners'
     ],
     numbers:[
       {label:'Open Season',value:'November (changes Jan 1)'},
       {label:'New employee enrollment window',value:'60 days'},
       {label:'QLE change window',value:'60 days from event'},
       {label:'Government premium share',value:'~70–75% of plan premium'}
     ],
     watch:[
       'Missing the 60-day new employee window means waiting until Open Season — a costly gap in coverage',
       'Self+1 is often cheaper than Self+Family for couples without dependent children',
       'HMO plans require living or working within service area — retiring and moving out of area can disrupt coverage'
     ]},
    {id:'fehb-5year',title:'5-Year Rule & Retirement Continuation',summary:'Requirements to carry FEH/ into retirement',
     overview:'One of the most valuable features of federal employment is the ability to carry FEH/ into retirement with the same government premium subsidy. But a 5-year rule must be met.',
     rules:[
       'Must have been continuously enrolled in FEH/ for the 5 years immediately before retirement date',
       'Does not have to be the same plan — just continuously enrolled in any FEH/ plan',
       "Spouse does not need independent 5 years — they are covered under the employee's enrollment",
       'Government continues paying the same share in retirement as during active employment',
       'Annuity must be large enough to cover premium; if not, must pay separately to OPM',
       'Retirees may not add new family members except during Open Season or qualifying events',
       "Survivor: if retiree elected survivor annuity, surviving spouse continues FEH/; if no survivor annuity elected, FEH/ ends at retiree's death"
     ],
     numbers:[
       {label:'Continuous enrollment required',value:'5 years immediately before retirement'},
       {label:'Same plan required?',value:'No — any FEH/ plan counts'},
       {label:'Government subsidy continues at',value:'Same rate as active employee'}
     ],
     watch:[
       'VERA retirees under age 62: carefully verify the 5 years were truly continuous — even a brief gap can disqualify',
       'Deferred retirees (MRA+10 postponed): FEH/ ends at separation and cannot be restarted at annuity commencement',
       "Surviving spouse without survivor annuity election: loses FEH/ immediately upon retiree's death"
     ]},
    {id:'fehb-medicare',title:'FEH/ & Medicare Coordination',summary:'How FEH/ and Medicare work together in retirement',
     overview:'Most federal retirees have both FEH/ and Medicare. Understanding which pays first — and how they coordinate — determines out-of-pocket costs and whether Medicare Part / is worth the premium.',
     rules:[
       'With Medicare Part A+B: Medicare pays first; FEH/ pays second (covering Medicare cost-sharing)',
       'FEP Blue Cross Standard Option: pays Medicare Part / cost-sharing leaving retiree at $0 for most in-network care',
       'Cannot be involuntarily removed from FEH/ for enrolling in Medicare',
       'Medicare Part A: premium-free for those with 40+ quarters SS-covered employment',
       'Medicare Part /: premium $202.90/month (2026); higher for higher incomes (IRMAA)',
       'Working past 65 with FEH/ as primary: can defer Part / enrollment without late penalty; 8-month SEP after coverage ends',
       'Medicare Part D: most FEH/ plans have creditable prescription drug coverage — delaying Part D enrollment carries no penalty with active FEHB'
     ],
     numbers:[
       {label:'2026 Part / standard premium',value:'$202.90/month'},
       {label:'Part A free with',value:'40+ quarters (10 years) SS-covered work'},
       {label:'Part B late enrollment penalty',value:'10% per year for each year late (lifetime)'},
       {label:'SEP after coverage ends',value:'8 months'}
     ],
     watch:[
       'Retirees in FEH/-only who delay Medicare Part / can face 10% permanent premium penalty per year late',
       'Medicare Part / premium is worth it if your FEH/ plan + Part / total less than your out-of-pocket without B',
       'IRMAA surcharges use income from 2 years prior — a working-to-retirement income drop may trigger an appeal'
     ]},
    {id:'fehb-hsa',title:'HSA & HDHP Eligibility',summary:'Triple tax-advantaged savings with a qualifying HDHP',
     overview:'Health Savings Accounts (HSAs) provide a triple tax benefit, but strict eligibility rules apply. Only enrollment in a qualifying HDHP — not any FEH/ plan — qualifies.',
     rules:[
       'HSA eligibility: must be enrolled in qualifying IRS-defined HDHP',
       'HSA disqualifiers: enrollment in Medicare Part A or /; general-purpose FSAFEDS Health Care FSA; coverage under non-HDHP plan',
       'Limited-purpose FSA: allowed with HSA (covers only dental and vision)',
       'Triple tax benefit: pre-tax contributions, tax-free growth, tax-free qualified withdrawals',
       'After age 65: HSA funds can be used for any purpose (non-medical taxed as income, not penalized)',
       'HSA funds roll over indefinitely — no use-or-lose rule'
     ],
     numbers:[
       {label:'2026 HSA limit (self-only)',value:'$4,300'},
       {label:'2026 HSA limit (family)',value:'$8,550'},
       {label:'HSA catch-up (age 55+)',value:'+$1,000 additional'}
     ],
     watch:[
       'Enrolling in Medicare Part A automatically disqualifies from HSA contributions — even if still working',
       'FSAFEDS Health Care FSA and HSA cannot coexist — must choose; limited-purpose FSA is allowed with HSA',
       'HDHP + HSA is ideal for healthy employees who can afford to accumulate — not ideal for those with predictable high medical costs'
     ]},
    {id:'fehb-fsafeds',title:'FSAFEDS — Flexible Spending Accounts',summary:'Health Care FSA, Dependent Care FSA, and LEX FSA',
     overview:'FSAFEDS is the federal flexible spending account program, administered separately from FEH/. It allows pretax dollars to pay for eligible medical and dependent care expenses.',
     rules:[
       'Health Care FSA: covers most medical, dental, and vision expenses not covered by insurance',
       'Dependent Care FSA: covers childcare and care for dependent adults so you can work; NOT for medical care',
       'Limited Expense (LEX) FSA: dental and vision only; compatible with HSA enrollment',
       'Use-or-lose rule: unused Health Care FSA funds forfeited at year end (carryover available up to IRS limit)',
       'Dependent Care FSA: no carryover — strictly use-or-lose',
       'FSAFEDS enrollment: during Open Season; new employees within 60 days of start'
     ],
     numbers:[
       {label:'2026 Health Care FSA max',value:'$3,400'},
       {label:'2026 Health Care FSA carryover',value:'$680'},
       {label:'2026 Dependent Care FSA max',value:'$5,000 ($2,500 married filing separately)'},
       {label:'Enrollment window',value:'Open Season or 60 days from start date'}
     ],
     watch:[
       'Over-contributing to Dependent Care FSA with no carryover is a common costly mistake — estimate carefully',
       "Leaving federal service mid-year: you can still USE the full Health Care FSA election even though you haven't contributed it all",
       'LEX FSA allows HSA holders to get some pretax benefit for dental/vision without affecting HSA eligibility'
     ]}
  ]},
  {cat:'FEGLI',icon:'🛡️',color:'#7c3aed',topics:[
    {id:'fegli-basic',title:'Basic Life Insurance',summary:'1x salary + $2,000; government pays 1/3 of cost',
     overview:"FEGLI Basic coverage is automatic for new employees unless waived. It provides a death benefit equal to the employee's salary rounded up to the next thousand, plus $2,000.",
     rules:[
       "Basic amount: (annual salary rounded up to nearest $1,000) + $2,000",
       'Cost sharing: employee pays 2/3 of premium; government pays 1/3 (only benefit with government cost-sharing)',
       'Automatic enrollment: must waive in writing within 31 days of appointment to opt out',
       'Accidental death/dismemberment (AD&D): doubles the Basic amount at no extra cost',
       'Cannot increase Basic after initial enrollment except during rare FEGLI Open Seasons'
     ],
     numbers:[
       {label:'Basic formula',value:'(Salary ÷ 1,000, rounded up × 1,000) + $2,000'},
       {label:'Government cost share',value:'1/3 of Basic premium'},
       {label:'AD&D benefit',value:'2× Basic amount'}
     ],
     watch:[
       'FEGLI has had very few Open Seasons — losing Basic means losing it essentially permanently without a life event',
       'Basic is term life insurance — no cash value; cannot borrow against it',
       'Salary increases automatically increase Basic coverage with no underwriting required'
     ]},
    {id:'fegli-optional',title:'Optional Coverage (A, B, C)',summary:'Standard, Additional, and Family options',
     overview:'Three optional FEGLI coverages supplement Basic. All Optional premiums are paid entirely by the employee — there is no government contribution.',
     rules:[
       'Option A (Standard): flat $10,000 additional coverage; employee pays full premium',
       'Option B (Additional): 1× to 5× salary in whole multiples; can change multiples only during FEGLI Open Season or QLE',
       'Option C (Family): covers spouse and eligible children; 1–5 multiples; spouse = $5,000 per multiple, each child = $2,500 per multiple',
       'All Options: employee pays 100% of premium; no government contribution',
       'Enrollment: during initial 31-day window or qualifying life event only (rare FEGLI Open Seasons otherwise)'
     ],
     numbers:[
       {label:'Option A coverage',value:'$10,000 flat'},
       {label:'Option B per multiple',value:'1× annual salary'},
       {label:'Option C spouse per multiple',value:'$5,000'},
       {label:'Option C child per multiple',value:'$2,500'},
       {label:'Option B maximum',value:'5× salary'}
     ],
     watch:[
       'Option B premiums increase with age — can become very expensive in 60s; evaluate vs. private term insurance',
       'Option C: children are covered regardless of how many — the multiple applies per child times per multiple',
       'Waiving Optional coverage initially is hard to reverse — underwriting may be required for reinstatement'
     ]},
    {id:'fegli-reductions',title:'Post-Retirement Coverage Reductions',summary:'How FEGLI reduces at age 65 and options to retain coverage',
     overview:'FEGLI coverage does not remain constant in retirement. By default, Basic and Optional coverages reduce significantly starting at age 65, based on the reduction option elected at retirement.',
     rules:[
       'Basic reduction options (must elect at retirement): 75% reduction over 37 months starting at 65 (free); 50% reduction (small premium); No reduction (larger premium)',
       'Standard 75% reduction: Basic reduces by 2% per month from age 65; ends at 25% of pre-65 amount',
       'Option A: reduces 75% at age 65 (to $2,500); free — no election needed',
       'Option B: reduces 2% per month from 65 (75% over 37 months) unless retiree pays to keep full coverage',
       'Option C: reduces 2% per month from 65 similarly; retiree can elect full retention for premium'
     ],
     numbers:[
       {label:'Default Basic reduction start',value:'Age 65'},
       {label:'Standard reduction rate',value:'2% per month'},
       {label:'Reduction duration',value:'37 months (75% total)'},
       {label:'Final Basic (75% reduction)',value:'25% of pre-retirement amount'}
     ],
     watch:[
       'Many retirees discover their FEGLI is nearly zero by age 70 — address life insurance needs before retirement',
       'The "no reduction" premium can be significant — compare cost vs. private policy',
       'Option B kept at full coverage in retirement can be very expensive; many drop it'
     ]},
    {id:'fegli-living',title:'Living Benefit & Beneficiary',summary:'Accelerated payout for terminal illness; beneficiary form priority',
     overview:'The FEGLI living benefit allows terminally ill employees or retirees to receive their Basic insurance before death. Separately, the beneficiary designation form (SF-2823) controls who receives the death benefit.',
     rules:[
       'Living benefit: available when physician certifies life expectancy of 9 months or less',
       'Election options: 50% of Basic (remainder paid at death) or 100% of Basic (nothing at death)',
       'Electing living benefit: automatically cancels all Optional (A, B, C) coverage',
       'Living benefit payment is generally income tax-free under current law',
       'SF-2823 beneficiary: overrides will and any other document; must be on file with OPM',
       'Without SF-2823: FEGLI pays per statutory order (spouse → children → parents → estate)'
     ],
     numbers:[
       {label:'Life expectancy certification',value:'9 months or less required'},
       {label:'50% option',value:'50% paid now; 50% at death'},
       {label:'100% option',value:'All paid now; nothing at death'}
     ],
     watch:[
       'Electing living benefit cancels all Optional coverage — the lost protection for survivors is irreversible',
       'SF-2823 not updated after divorce? Ex-spouse may receive the death benefit — check and update immediately after life events'
     ]}
  ]},
  {cat:'Medicare',icon:'⚕️',color:'#0891b2',topics:[
    {id:'medicare-parts',title:'Parts A, B, C, D Overview',summary:'What each part covers and how they fit together',
     overview:'Medicare is the federal health insurance program for people age 65 and older. For federal employees, it layers on top of FEH/ in retirement, often resulting in near-zero out-of-pocket costs.',
     rules:[
       'Part A (Hospital): inpatient hospital, skilled nursing, hospice; premium-free with 40+ quarters SS-covered work',
       'Part B (Medical): doctors, outpatient, preventive care, durable medical equipment; monthly premium required',
       'Part C (Medicare Advantage): private plan covering A+B (often + D); alternative to traditional Medicare',
       'Part D (Prescription Drugs): standalone drug coverage; separate premium; most FEH/ plans provide creditable coverage so Part D often unnecessary',
       'Medigap: private supplemental insurance that fills A+B gaps; less relevant for federal retirees with FEH/'
     ],
     numbers:[
       {label:'2026 Part / standard premium',value:'$202.90/month'},
       {label:'Part A premium-free threshold',value:'40 quarters (10 years) SS-covered work'},
       {label:'2026 Part A deductible',value:'$1,676 per benefit period'}
     ],
     watch:[
       'Federal retirees with FEH/ typically do NOT need Medicare Advantage or Medigap — FEH/ already fills the gaps',
       'Enrolling in Part C (Medicare Advantage) suspends your FEH/ — understand the tradeoff before switching',
       'Part D: enrolling when you have creditable FEH/ coverage carries no late penalty — skip it while FEH/ is active'
     ]},
    {id:'medicare-enrollment',title:'Enrollment Timing & Penalties',summary:'When to enroll, when to defer, and late penalty rules',
     overview:'Missing Medicare enrollment windows can result in permanent premium surcharges. Federal employees have special protections that allow deferring Part B while still working with FEH/.',
     rules:[
       'Initial Enrollment Period (IEP): 7-month window around 65th birthday (3 before, month of, 3 after)',
       'Special Enrollment Period (SEP): 8 months after employer coverage ends; allows Part / enrollment without penalty',
       'Working past 65 with active FEHB as primary: can defer Part / without penalty using employer SEP',
       'Retired past 65 without Part /: enrolling outside IEP/SEP results in permanent premium surcharge',
       'Part B late enrollment penalty: 10% per year for each year without Part / (permanent; added to premium)',
       'Part D late penalty: 1% per month without creditable coverage; avoidable with active FEHB (creditable)'
     ],
     numbers:[
       {label:'IEP window',value:'7 months (3 before, month of, 3 after 65th birthday)'},
       {label:'SEP after FEH/ ends',value:'8 months'},
       {label:'Part B late penalty',value:'10% per year without coverage (permanent)'},
       {label:'Part D late penalty',value:'1% per month (permanent if no creditable coverage)'}
     ],
     watch:[
       'Retiring at 70? Do NOT wait 8 months after leaving work to sign up for Part B — enroll during the SEP promptly',
       'Part A enrollment at 65 is usually free and low-risk — but it disqualifies from HSA contributions',
       'General enrollment period (Jan–Mar each year) has a premium surcharge AND July start — avoid this situation'
     ]},
    {id:'medicare-irmaa',title:'IRMAA — Income-Related Adjustments',summary:'Higher-income retirees pay more for Parts / and D',
     overview:'IRMAA adds income-based surcharges to Medicare Part / and D premiums. It affects higher-income retirees and is calculated based on income from 2 years prior.',
     rules:[
       'IRMAA based on Modified Adjusted Gross Income (MAGI) from 2 years prior',
       '2026 surcharges based on 2024 income; applies to both Part / and Part D',
       'Single filers: IRMAA begins at $106,000 MAGI; married filing jointly at $212,000',
       'Can appeal IRMAA if income has significantly decreased due to qualifying life event (retirement, death of spouse, divorce, etc.)',
       'IRMAA income includes: wages, pensions, SS, interest, dividends, capital gains, Roth conversions'
     ],
     numbers:[
       {label:'2026 standard Part /',value:'$202.90/month'},
       {label:'IRMAA tier 1 (single $106K–$133K)',value:'+$74.00/month Part /'},
       {label:'Highest IRMAA tier (single $500K+)',value:'$628.90/month Part / total'},
       {label:'IRMAA income lookback',value:'2 years prior'}
     ],
     watch:[
       'Large Roth conversions in retirement can push income above IRMAA thresholds — plan carefully',
       'First year of retirement: income often drops dramatically; file Life Changing Event appeal immediately',
       'TSP withdrawals, FERS annuity, and SS all count toward IRMAA income — may be higher than expected'
     ]}
  ]},
  {cat:'Social Security',icon:'🔵',color:'#1d4ed8',topics:[
    {id:'ss-eligibility',title:'Eligibility, Credits & Benefit Calculation',summary:'40 credits, 35 highest years, AIME and PIA',
     overview:"Social Security retirement benefits require 40 credits (about 10 years of work) and are calculated based on the worker's 35 highest earning years, indexed for wage inflation.",
     rules:[
       '40 credits required for retirement benefit eligibility (maximum 4 per year = 10 years minimum)',
       '2026: one credit earned per $1,890 of SS-covered earnings',
       'AIME: Average Indexed Monthly Earnings — average of 35 highest indexed earning years (zeros used if fewer than 35)',
       "PIA: Primary Insurance Amount — monthly benefit at Full Retirement Age; calculated from AIME via bend-point formula",
       'FERS employees: pay full SS taxes throughout federal career; earn full SS credits',
       'CSRS employees: generally exempt from SS during federal service; no SS credits from that service'
     ],
     numbers:[
       {label:'Credits needed',value:'40 (10 years of work)'},
       {label:'2026 earnings per credit',value:'$1,890'},
       {label:'Calculation basis',value:'35 highest indexed earning years'},
       {label:'FRA (born 1960+)',value:'Age 67'}
     ],
     watch:[
       'Fewer than 35 years of work? Zeros are averaged in, significantly reducing AIME — working additional years can meaningfully increase benefit',
       'FERS employees often underestimate their SS benefit because federal pay is high but they ignore the progressive bend-point formula that helps lower earners more'
     ]},
    {id:'ss-claiming',title:'Claiming Age & Strategy',summary:'Early (62), FRA (67), or delayed (to 70)',
     overview:'When to claim Social Security is one of the most significant retirement decisions. Claiming earlier results in a permanently reduced benefit; delaying earns credits that permanently increase it.',
     rules:[
       'Earliest claiming age: 62 (30% permanent reduction for FRA-67 workers)',
       'Full Retirement Age (FRA): 67 for those born in 1960 or later; 66 for earlier cohorts',
       'Delayed credits: +8% per year for each year past FRA (up to age 70)',
       'Maximum benefit (delayed to 70): 124% of PIA for FRA-67 workers (8% × 3 years past 67)',
       'Break-even age: typically 78–80 comparing age 62 vs FRA claiming; 82–84 comparing FRA vs age 70',
       "Spousal benefit: up to 50% of worker's PIA at spousal FRA — does NOT increase past spousal FRA",
       "Survivor benefit: up to 100% of deceased worker's benefit at survivor's FRA"
     ],
     numbers:[
       {label:'Reduction at 62 (FRA 67)',value:'30% permanent reduction'},
       {label:'Delayed credit per year past FRA',value:'+8%'},
       {label:'Maximum benefit age',value:'70 (no additional credit after 70)'},
       {label:'Break-even (62 vs FRA)',value:'Typically age 78–80'},
       {label:'Spousal benefit max',value:"50% of worker's PIA at spousal FRA"}
     ],
     watch:[
       'Spousal benefit does NOT grow past FRA — no benefit to waiting past your FRA for the spousal (only for your own benefit)',
       'Health matters: shorter life expectancy favors earlier claiming; longer expectancy favors delay',
       "Survivor benefit consideration: higher earner delaying to 70 maximizes the survivor benefit for the lower-earning spouse"
     ]},
    {id:'ss-earnings-test',title:'Earnings Test',summary:'How working while claiming affects SS before FRA',
     overview:'Claiming Social Security before FRA while still working can temporarily reduce benefits. Benefits withheld are returned after FRA through a higher monthly payment.',
     rules:[
       'Pre-FRA years: $1 withheld per $2 earned above annual exempt amount',
       'Year of reaching FRA: $1 withheld per $3 earned above a higher annual exempt amount (only for months before FRA month)',
       'After FRA month: no earnings test — work and earn any amount with no SS reduction',
       'Withheld benefits are NOT permanently lost — SSA recalculates at FRA and adds back monthly',
       'Investment income, pensions, rental income, annuity income do NOT count toward the earnings test'
     ],
     numbers:[
       {label:'2026 pre-FRA limit',value:'$24,480 ($1 withheld per $2 over)'},
       {label:'2026 FRA-year limit',value:'$65,160 ($1 withheld per $3 over)'},
       {label:'Post-FRA limit',value:'No limit — no earnings test'}
     ],
     watch:[
       'Working part-time in retirement before FRA? Calculate whether benefits will be withheld — you may be better off not claiming yet',
       'The withheld benefits are returned but spread over remaining lifetime — not a lump sum',
       'FERS Supplement has its own earnings test ($1/$2) that operates independently of the SS earnings test'
     ]},
    {id:'ss-wep-gpo',title:'WEP & GPO — Windfall & Pension Offset',summary:'How government pensions reduce SS for CSRS employees',
     overview:'Two provisions specifically affect federal employees who had non-SS-covered employment (primarily CSRS). FERS employees who always paid SS taxes are generally not affected.',
     rules:[
       "WEP (Windfall Elimination Provision): reduces worker's own SS retirement benefit if they receive a pension from non-SS-covered work",
       'WEP max reduction (2026): approximately $618/month from SS benefit',
       'WEP exemption: 30+ years of substantial SS-covered employment (full benefit); reduced WEP for 21–29 years',
       'GPO (Government Pension Offset): reduces SS spousal or survivor benefit by 2/3 of the government pension',
       'GPO can eliminate spousal/survivor benefit entirely if pension is large enough',
       'FERS employees: generally NOT subject to WEP or GPO (they paid SS taxes throughout)',
       'CSRS-Offset employees: subject to WEP; GPO may apply depending on circumstances'
     ],
     numbers:[
       {label:'WEP max reduction (2026)',value:'~$618/month'},
       {label:'WEP exemption threshold',value:'30 years substantial SS-covered work'},
       {label:'GPO reduction',value:'2/3 of government pension'}
     ],
     watch:[
       "WEP only affects the retiree's own SS benefit, not the survivor's benefit after death",
       "GPO can completely wipe out a surviving spouse's SS benefit if the pension is large enough",
       "CSRS employees often don't realize WEP/GPO impact until close to retirement — plan early"
     ]}
  ]},
  {cat:'CSRS',icon:'🏦',color:'#92400e',topics:[
    {id:'csrs-overview',title:'CSRS Overview & Eligibility',summary:'Closed system; higher multipliers; full COLA',
     overview:'The Civil Service Retirement System is the older federal retirement plan, closed to new hires after December 31, 1983. CSRS provides a more generous annuity formula than FERS but includes no Social Security integration or TSP government contributions.',
     rules:[
       'Closed to employees hired after December 31, 1983',
       'No automatic agency TSP contributions (CSRS employees can make employee-only contributions)',
       'CSRS employees generally do not pay SS taxes on federal wages and earn no SS credits from federal service',
       'Full CPI-W COLA each year (unlike FERS which can be reduced)',
       'Employee contribution: 7% of basic pay (vs. 4.4% for FERS post-2013 hires)',
       'Higher annuity formula rewards long service more than FERS'
     ],
     numbers:[
       {label:'System closed',value:'After December 31, 1983'},
       {label:'Employee contribution',value:'7% of basic pay'},
       {label:'COLA type',value:'Full CPI-W (same as Social Security)'}
     ],
     watch:[
       'CSRS employees approaching retirement must understand WEP and GPO impacts on SS benefits from any non-federal work',
       'No government TSP match under CSRS — many CSRS employees have smaller TSP balances as a result',
       'CSRS-Offset is a separate sub-category with different SS interaction rules'
     ]},
    {id:'csrs-annuity',title:'CSRS Annuity Calculation',summary:'Three-tier multiplier; 80% maximum',
     overview:'CSRS uses a three-tiered multiplier that rewards long service more generously than FERS, particularly for employees with 30–40+ years of service.',
     rules:[
       'First 5 years: 1.5% × High-3 × years',
       'Years 6–10: 1.75% × High-3 × years',
       'After 10 years: 2.0% × High-3 per additional year',
       'Maximum annuity: 80% of High-3 (reached at approximately 41.5 years of service)',
       'No enhanced multiplier at age 62 (unlike FERS 1.1% option)',
       'No FERS Supplement; CSRS retirees who earned SS from other employment use regular SS claiming rules'
     ],
     numbers:[
       {label:'Years 1–5 multiplier',value:'1.5% per year'},
       {label:'Years 6–10 multiplier',value:'1.75% per year'},
       {label:'Years 11+ multiplier',value:'2.0% per year'},
       {label:'Example (30 years, $80K)',value:'$46,500 (1.5%×5 + 1.75%×5 + 2%×20 = 58.125% × $80K)'},
       {label:'Maximum annuity cap',value:'80% of High-3'}
     ],
     watch:[
       'A CSRS employee at 30 years earns significantly more than a FERS employee at 30 years — important context when advising',
       'The 80% cap can actually be reached — employees past ~41 years get no additional benefit from working longer',
       'Sick leave fully credited toward CSRS service as with FERS'
     ]}
  ]},
  {cat:'Survivor Benefits',icon:'👨‍👩‍👧',color:'#be185d',topics:[
    {id:'survivor-election',title:'Post-Retirement Survivor Elections',summary:'Full, partial, or no survivor; FEH/ implications',
     overview:'At retirement, FERS and CSRS employees must elect a survivor benefit for their spouse. This election permanently reduces the retiree\'s monthly annuity in exchange for providing income to the surviving spouse.',
     rules:[
       "Full survivor (FERS): spouse receives 50% of unreduced annuity; retiree's annuity reduced ~10%",
       "Partial survivor (FERS): spouse receives 25% of unreduced annuity; retiree's annuity reduced ~5%",
       "No survivor: full annuity to retiree; spouse loses FEH/ access at retiree's death if no other coverage",
       'Spouse must consent in writing to any election less than full survivor annuity',
       'Election is irrevocable unless there is a divorce, remarriage, or death of spouse',
       "CSRS full survivor: spouse receives 55% of unreduced annuity; retiree reduced ~10%",
       'Insurable interest: can be elected for non-spouse dependents; reduces annuity by 10–40% depending on age difference'
     ],
     numbers:[
       {label:'FERS full survivor benefit',value:'50% of unreduced annuity'},
       {label:'FERS full survivor cost',value:'~10% reduction to retiree annuity'},
       {label:'CSRS full survivor benefit',value:'55% of unreduced annuity'},
       {label:'Post-retirement new spouse deadline',value:'2 years after marriage'}
     ],
     watch:[
       "No survivor + no FEH/ alternative for spouse = serious financial risk at retiree's death",
       'Partial survivor may be appropriate if spouse has own pension/income — but the small premium saving is often not worth the reduced protection',
       'A divorce decree may require a survivor annuity election — OPM must be notified within 30 days of divorce'
     ]},
    {id:'survivor-inservice',title:'In-Service Death Benefits',summary:'BEDB lump sum and monthly survivor annuity',
     overview:'If a FERS employee dies while still employed, surviving family members receive several benefits depending on the employee\'s length of service.',
     rules:[
       '18+ months service: surviving spouse receives Basic Employee Death Benefit (BEDB) lump sum',
       '10+ years service: surviving spouse eligible for ongoing monthly survivor annuity',
       'BEDB = 50% of final year salary + COLA-adjusted lump sum (approximately $43,800.53 in 2026)',
       'Monthly survivor annuity = 50% of the annuity the employee would have received (using actual service)',
       'Children receive benefits until age 18 (age 22 if full-time student; no age limit if disabled)',
       'TSP balance passed to TSP-3 beneficiaries; FEGLI paid to SF-2823 beneficiaries — separately from annuity'
     ],
     numbers:[
       {label:'Minimum service for BEDB',value:'18 months'},
       {label:'Minimum service for monthly survivor annuity',value:'10 years'},
       {label:'BEDB COLA-adjusted amount (effective Dec 2025)',value:'$43,800.53'},
       {label:'Monthly survivor annuity rate',value:"50% of employee's projected annuity"}
     ],
     watch:[
       'Employees with fewer than 10 years: family receives only the BEDB + TSP + FEGLI — no ongoing monthly income from OPM',
       'The BEDB amount is COLA-adjusted annually — always verify the current figure with OPM'
     ]},
    {id:'survivor-coap',title:'COAP & Former Spouse Rights',summary:'Court orders dividing FERS, CSRS, and TSP benefits',
     overview:'Divorce can significantly affect federal benefits. Court orders must meet specific requirements to be honored by OPM and TSP. Proper documentation is critical.',
     rules:[
       'COAP (Court Order Acceptable for Processing): divides FERS/CSRS annuity or awards survivor annuity to former spouse',
       'RBCO (Retirement Benefits Court Order): separate order required to divide TSP — COAP does NOT reach TSP',
       'FEGLI: NOT divisible by court order; FEGLI follows the SF-2823 beneficiary designation only',
       'Former spouse survivor annuity: must be awarded by court order AND employee must elect it at retirement',
       'Employee must notify OPM of divorce within 30 days to protect former spouse rights',
       'Former spouse FEH/: can continue FEH/ coverage if receiving a survivor annuity or portion of annuity',
       'TSP-3 controls TSP — a divorce decree alone does NOT change TSP beneficiary; TSP-3 must be updated'
     ],
     numbers:[
       {label:'Notification deadline to OPM',value:'30 days after divorce decree'},
       {label:'Former spouse FEH/ eligibility',value:'Requires survivor annuity or annuity share award'}
     ],
     watch:[
       'Divorce decree says "TSP shall be divided equally" — this is NOT automatically effective; requires separate RBCO filed with TSP',
       'Employee who fails to notify OPM of divorce within 30 days may lose ability to elect former spouse survivor annuity later',
       "The former spouse's annuity share ends if the former spouse remarries before age 55"
     ]}
  ]},
  {cat:'Taxation',icon:'📋',color:'#374151',topics:[
    {id:'tax-annuity',title:'FERS & CSRS Annuity Taxation',summary:'Simplified Method; mostly taxable; state variations',
     overview:'Federal retirement annuities are subject to federal income tax. The taxable portion is determined using the Simplified Method — a small portion representing after-tax employee contributions is excluded.',
     rules:[
       'Simplified Method: divide after-tax contributions by expected total payments to determine monthly tax-free amount',
       'FERS employees: contributed small after-tax amounts; vast majority of annuity is taxable as ordinary income',
       'CSRS employees: contributed more after-tax; slightly larger tax-free portion',
       'Federal income tax withheld: retirees complete W-4P to set withholding; may also make quarterly payments',
       'State taxation: varies significantly — many states partially or fully exempt federal pension income',
       'FEGLI death benefits: generally income tax-free to beneficiaries',
       'Living benefit payments: tax-free under current federal law'
     ],
     numbers:[
       {label:'FERS employee contribution',value:'0.8%–4.4% of pay (varies by hire date)'},
       {label:'CSRS employee contribution',value:'7% of pay'},
       {label:'W-4P',value:'Form used to set withholding from annuity'}
     ],
     watch:[
       'Failing to set withholding and then owing a large tax bill in first retirement year is very common',
       'Some states with no income tax (FL, TX, etc.) are particularly attractive for CSRS retirees with large pensions',
       'FERS annuity + SS + TSP withdrawals can push total income into IRMAA and SS taxation thresholds — model this carefully'
     ]},
    {id:'tax-ss',title:'Social Security Taxation',summary:'Up to 85% of SS benefits may be federally taxable',
     overview:"Social Security benefits are partially subject to federal income tax depending on the retiree's total income. The thresholds are not inflation-adjusted and have remained unchanged since 1993 at the 85% level.",
     rules:[
       'Provisional income = AGI + tax-exempt interest + 50% of SS benefits',
       '0% of SS taxable: provisional income below $25,000 (single) or $32,000 (MFJ)',
       'Up to 50% taxable: provisional income $25,001–$34,000 (single) or $32,001–$44,000 (MFJ)',
       'Up to 85% taxable: provisional income above $34,000 (single) or $44,000 (MFJ)',
       'Maximum taxable: 85% — SS benefits are NEVER 100% taxable under federal law',
       'State taxation of SS: varies — many states fully exempt SS benefits'
     ],
     numbers:[
       {label:'0% taxable threshold (single)',value:'Under $25,000 provisional income'},
       {label:'85% taxable threshold (single)',value:'Above $34,000 provisional income'},
       {label:'Maximum federal SS tax',value:'85% of benefit (never 100%)'}
     ],
     watch:[
       'These thresholds are not inflation-adjusted — more retirees fall into the 85% bracket every year',
       'Large Roth TSP conversions increase provisional income and may push more SS into taxable range',
       'Monitor proposed legislation — eliminating federal SS taxation has been a recurring proposal'
     ]},
    {id:'tax-tsp',title:'TSP Withdrawal Taxation',summary:'Traditional vs Roth tax treatment; withholding rules',
     overview:'How TSP withdrawals are taxed depends entirely on whether contributions were Traditional (pre-tax) or Roth (after-tax). Both types are commonly held in the same account.',
     rules:[
       'Traditional TSP: all withdrawals taxed as ordinary income in year received',
       'Roth TSP: contributions tax-free; earnings tax-free if aged 59½+ AND 5-year holding period met',
       'Mandatory withholding: 20% federal withholding on most TSP distributions (waived for direct rollovers)',
       'Direct rollover to IRA: no current-year tax; deferred until withdrawal from IRA',
       'Early withdrawal penalty: 10% if under age 59½ (exceptions: separation at 55+, disability, QDRO, 72(t))',
       'RMD distributions: fully taxable (Traditional); tax-free (qualified Roth)'
     ],
     numbers:[
       {label:'Mandatory withholding',value:'20% of taxable distribution'},
       {label:'Early withdrawal penalty',value:'10% if under 59½'},
       {label:'Penalty-free at separation',value:'Age 55+ in year of separation'}
     ],
     watch:[
       '20% mandatory withholding can create a cash crunch — if rolling over, do a direct rollover to avoid withholding',
       'Rolling Traditional TSP to Roth IRA (Roth conversion): taxable in year of conversion — plan for the tax bill',
       'Roth TSP 5-year clock starts from first Roth contribution to TSP — verify before taking Roth distributions'
     ]}
  ]},
  {cat:'Leave & Separation',icon:'📅',color:'#065f46',topics:[
    {id:'leave-annual-sick',title:'Annual & Sick Leave',summary:'Accrual rates, carryover limits, and retirement crediting',
     overview:'Federal employees accrue annual and sick leave each biweekly pay period. Understanding the rules at retirement — especially sick leave crediting — is essential to maximizing the FERS annuity.',
     rules:[
       'Annual leave accrual: 4 hrs/pp (0–3 years), 6 hrs/pp (3–15 years), 8 hrs/pp (15+ years)',
       'Annual leave maximum carryover: 240 hours (30 days); 360 hours for Senior Executive Service',
       'Annual leave payout: unused leave above carryover is lost; at retirement, full balance paid as lump sum',
       'Sick leave: 4 hours per pay period; accrues without limit; no cash payout at retirement',
       'Sick leave at retirement: fully credited toward FERS and CSRS annuity calculation as additional service',
       '2,087 hours of sick leave = 1 additional year of service credit'
     ],
     numbers:[
       {label:'Sick leave hours per year',value:'104 (4 hrs × 26 pay periods)'},
       {label:'Annual leave max carryover',value:'240 hours (30 days)'},
       {label:'Sick leave = 1 year service',value:'2,087 hours'},
       {label:'Annual leave max (15+ years)',value:'208 hours/year (8 hrs × 26 pp)'}
     ],
     watch:[
       'Using sick leave for non-medical reasons before retirement throws away service credit — sick leave is worth real annuity dollars',
       'Annual leave lump-sum payout is taxable as ordinary income in year paid — may push retiree into higher bracket',
       'SES employees can carry forward 360 hours — non-SES who switch to SES get extra carryover potential'
     ]},
    {id:'leave-vera-vsip',title:'VERA & VSIP',summary:'Early retirement and separation incentive rules',
     overview:'VERA and VSIP are tools agencies use to reduce workforce size without involuntary reductions in force. They are frequently offered together but are legally distinct programs.',
     rules:[
       'VERA: age 50+20 years OR any age+25 years; requires specific OPM authorization for the agency/component',
       'VERA annuity: calculated same as voluntary retirement — no age penalty (unlike MRA+10)',
       'VERA + FERS Supplement: supplement starts at MRA, NOT at early VERA retirement date if pre-MRA',
       'VSIP: one-time lump-sum incentive payment; standard statutory cap $25,000; taxable as ordinary income',
       'VSIP repayment: must repay (with interest) if hired into federal executive branch within 5 years',
       'Both widely authorized across federal agencies in 2025–2026 as part of workforce restructuring',
       'Can accept VSIP without VERA (and resign), or VERA without VSIP (and retire)'
     ],
     numbers:[
       {label:'VERA minimum age',value:'50 (with 20+ years service)'},
       {label:'VERA any age',value:'25+ years service'},
       {label:'VSIP standard cap',value:'$25,000 (current statutory limit)'},
       {label:'VSIP repayment window',value:'5 years if rehired in executive branch'}
     ],
     watch:[
       'VERA retirees under MRA face years without the FERS Supplement — critical income planning gap',
       'VSIP is fully taxable — a $25,000 payment nets significantly less after federal and state income tax',
       'VERA eligibility is date-specific — OPM approvals typically have hard cutoff dates'
     ]},
    {id:'leave-owcp',title:'OWCP / FECA — Workers\' Compensation',summary:'Injury compensation, CA-1/CA-2, and FERS interaction',
     overview:"The Federal Employees' Compensation Act (FECA) provides workers' compensation benefits to federal employees injured on the job. It is administered by the Department of Labor's Office of Workers' Compensation Programs (OWCP).",
     rules:[
       'CA-1: Form for traumatic injuries (specific incident on a specific date)',
       'CA-2: Form for occupational diseases (gradual development over time)',
       'Compensation: 75% of basic pay (with dependents) or 66⅔% (without dependents), completely tax-free',
       'Continuation of Pay (COP): up to 45 days for traumatic injuries (CA-1 only) before OWCP benefits begin',
       'Cannot simultaneously receive OWCP wage-loss compensation AND a FERS/CSRS retirement annuity for the same condition',
       'All medical care for the work-related condition is paid by OWCP — no cost to employee',
       'OWCP wage-loss benefits can continue indefinitely while condition prevents return to duty'
     ],
     numbers:[
       {label:'Compensation with dependents',value:'75% of basic pay (tax-free)'},
       {label:'Compensation without dependents',value:'66⅔% of basic pay (tax-free)'},
       {label:'Continuation of Pay period',value:'45 days (traumatic injuries only)'},
       {label:'OWCP vs FERS election',value:'Must choose one — cannot receive both simultaneously'}
     ],
     watch:[
       'Many employees stay on OWCP for years without transitioning to FERS disability — at some point the FERS disability annuity (especially at 62 recalculation) may be more advantageous',
       'The tax-free nature of OWCP benefits is significant — 75% tax-free can exceed 100% taxable pay for some employees',
       'Accepting FERS disability retirement does NOT automatically end OWCP — employee must formally elect'
     ]}
  ]},
  {cat:'Forms & Administration',icon:'📝',color:'#6b7280',topics:[
    {id:'forms-retirement',title:'Key Retirement Forms',summary:'SF-3107, SF-2801, and OPM processing timeline',
     overview:'Filing the correct forms accurately and on time is critical for a smooth transition to retirement. OPM processing takes months — starting the paperwork 6 months before the target retirement date is strongly advised.',
     rules:[
       'SF-3107: FERS Application for Immediate Retirement — main form for most FERS retirees',
       'SF-3112: Documentation for FERS disability retirement applications',
       'SF-2801: CSRS Application for Immediate Retirement',
       'RI 92-19: Post-retirement request to change survivor election (limited circumstances)',
       'OPM processing: typically 3–6 months for full adjudication; interim payments begin within ~30–45 days',
       'Agency role: submits documentation to OPM; employee submits application through HR',
       'Start early: OPM backlogs are common — delays of 6–12 months are possible for complex cases'
     ],
     numbers:[
       {label:'Recommended application advance',value:'6 months before retirement date'},
       {label:'Interim payment start',value:'~30–45 days after retirement'},
       {label:'Full annuity adjudication',value:'3–6+ months typical'},
       {label:'Lump-sum leave payout',value:'Typically within 30–60 days (agency, not OPM)'}
     ],
     watch:[
       'The interim payment is usually 80–90% of expected annuity — budget accordingly for the period before full adjudication',
       'Late retirement date selection: retiring on last day of a month results in first full annuity payment the next full month',
       'Errors on the retirement application can delay processing significantly — double-check all dates and beneficiary info'
     ]},
    {id:'forms-designations',title:'TSP-3 & SF-2823 Beneficiary Forms',summary:'Forms that override wills; must update after life events',
     overview:'TSP-3 (TSP beneficiary) and SF-2823 (FEGLI beneficiary) are among the most critical documents in federal employment. Both override any will, trust, or divorce decree — making regular updates essential.',
     rules:[
       'TSP-3: designates who receives TSP account balance at death; filed with and administered by TSP, not HR',
       'TSP without TSP-3: statutory order applies — spouse first, then children equally, then parents equally, then estate',
       'TSP-3 overrides divorce decree — a will or divorce decree saying "TSP to ex-spouse" does NOT work without an updated TSP-3',
       'SF-2823: FEGLI beneficiary designation; filed with OPM (via HR); overrides will',
       'Without SF-2823: FEGLI statutory order — same as TSP (spouse → children → parents → estate)',
       'Update both forms: after marriage, divorce, death of beneficiary, birth of child, or change of preference'
     ],
     numbers:[
       {label:'TSP-3 filed with',value:'TSP (tsp.gov) — NOT your HR office'},
       {label:'SF-2823 filed with',value:'OPM via agency HR'},
       {label:'How often to review',value:'After every major life event'}
     ],
     watch:[
       'Divorce without updating TSP-3 = ex-spouse potentially receives the entire TSP balance',
       'Many employees believe HR has their beneficiary designation on file — HR does NOT have TSP-3; it goes directly to TSP',
       'A new TSP-3 automatically supersedes all prior TSP-3s on file — you cannot have partial designations from different dates'
     ]}
  ]}
]
