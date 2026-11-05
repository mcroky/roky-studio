------------------------- MODULE VisitorRegression -------------------------
EXTENDS Integers, TLC

\* Models the acceptance guard in worker/index.mjs VisitorLedger.refresh
\* and the public response after a transient Cloudflare reading. Each query
\* can return any bounded nonnegative count, including zero. The latest
\* accepted snapshot is kept when a query regresses. Actual per-day maxima,
\* dates and sampling are checked by the JavaScript regression tests.

CONSTANTS MaxCount, MaxDay
ASSUME /\ MaxCount \in Nat
       /\ MaxCount >= 1
       /\ MaxDay \in Nat

VARIABLES phase, storedTotal, storedToday, storedDay,
          candidateTotal, candidateToday, candidateDay,
          priorTotal, priorToday, priorDay, responseKind
vars == <<phase, storedTotal, storedToday, storedDay,
          candidateTotal, candidateToday, candidateDay,
          priorTotal, priorToday, priorDay, responseKind>>

Init == /\ phase = "idle"
        /\ storedTotal = 1
        /\ storedToday = 1
        /\ storedDay = 0
        /\ candidateTotal = 0
        /\ candidateToday = 0
        /\ candidateDay = 0
        /\ priorTotal = 1
        /\ priorToday = 1
        /\ priorDay = 0
        /\ responseKind = "none"

NewReading ==
  /\ phase = "idle"
  /\ \E nextTotal \in 0..MaxCount:
       \E nextToday \in 0..nextTotal:
         \E nextDay \in 0..MaxDay:
           /\ candidateTotal' = nextTotal
           /\ candidateToday' = nextToday
           /\ candidateDay' = nextDay
  /\ phase' = "query"
  /\ UNCHANGED <<storedTotal, storedToday, storedDay,
                 priorTotal, priorToday, priorDay, responseKind>>

Acceptable == /\ candidateTotal >= storedTotal
              /\ candidateDay >= storedDay
              /\ (candidateDay > storedDay \/ candidateToday >= storedToday)

Accept == /\ phase = "query"
          /\ Acceptable
          /\ phase' = "idle"
          /\ priorTotal' = storedTotal
          /\ priorToday' = storedToday
          /\ priorDay' = storedDay
          /\ storedTotal' = candidateTotal
          /\ storedToday' = candidateToday
          /\ storedDay' = candidateDay
          /\ responseKind' = "accepted"
          /\ UNCHANGED <<candidateTotal, candidateToday, candidateDay>>

Reject == /\ phase = "query"
          /\ ~Acceptable
          /\ phase' = "idle"
          /\ priorTotal' = storedTotal
          /\ priorToday' = storedToday
          /\ priorDay' = storedDay
          /\ storedTotal' = storedTotal
          /\ storedToday' = storedToday
          /\ storedDay' = storedDay
          /\ responseKind' = "stale"
          /\ UNCHANGED <<candidateTotal, candidateToday, candidateDay>>

Next == NewReading \/ Accept \/ Reject
Spec == Init /\ [][Next]_vars

TypeOK == /\ phase \in {"idle", "query"}
          /\ storedTotal \in 0..MaxCount
          /\ storedToday \in 0..MaxCount
          /\ storedDay \in 0..MaxDay
          /\ candidateTotal \in 0..MaxCount
          /\ candidateToday \in 0..MaxCount
          /\ candidateDay \in 0..MaxDay
          /\ responseKind \in {"none", "accepted", "stale"}

TotalNeverFalls == storedTotal >= priorTotal
SameDayTodayNeverFalls == storedDay = priorDay => storedToday >= priorToday
DateNeverRewinds == storedDay >= priorDay
RejectedKeepsLast == responseKind = "stale" =>
  (storedTotal = priorTotal /\ storedToday = priorToday /\ storedDay = priorDay)

Accepted == responseKind = "accepted"
Rejected == responseKind = "stale"
=============================================================================
