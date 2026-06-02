// Self-managed TSP drawdown projection — pure function shared by the TSP
// Drawdown calculator and the advisor retirement-summary deliverable.
//
// Convention: once income has begun, the year's withdrawal is taken at the
// start of the year, then the remaining balance grows for the year. Before the
// income-start age the balance simply grows untouched.
export function projectDrawdown({ balance, startAge, incomeStartAge, annualWithdrawal, growth, endAge }) {
  const g = growth
  const incomeAge = Math.max(startAge, incomeStartAge)
  let bal = Math.max(0, balance)
  const data = [{ age: startAge, balance: Math.round(bal) }]
  let runOutAge = null
  for (let a = startAge; a < endAge; a++) {
    if (a >= incomeAge) {
      bal = bal - annualWithdrawal
      if (bal <= 0) {
        bal = 0
        if (runOutAge == null) runOutAge = a + 1
      }
    }
    if (bal > 0) bal = bal * (1 + g)
    data.push({ age: a + 1, balance: Math.round(Math.max(0, bal)) })
  }
  return { data, runOutAge }
}
