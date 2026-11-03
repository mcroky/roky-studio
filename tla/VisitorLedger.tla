--------------------------- MODULE VisitorLedger ---------------------------
EXTENDS Integers, TLC

\* Models worker/index.mjs VisitorLedger.fetch/refresh and
\* scripts/visitor-count-core.mjs buildVisitorSnapshot. One Durable Object
\* serializes refreshes; each completed day has one visit in this bounded
\* model. Failed analytics queries must not write storage. Cloudflare counts,
\* CORS, and real date parsing are checked in JavaScript tests, not here.

CONSTANT MaxDay
ASSUME MaxDay \in Nat

VARIABLES nowDay, archivedThrough, archived, phase, pendingThrough,
          pendingArchive, lastFetch, failedArchive
vars == <<nowDay, archivedThrough, archived, phase, pendingThrough,
          pendingArchive, lastFetch, failedArchive>>

Init == /\ nowDay = 0
        /\ archivedThrough = -1
        /\ archived = 0
        /\ phase = "idle"
        /\ pendingThrough = -1
        /\ pendingArchive = 0
        /\ lastFetch = "none"
        /\ failedArchive = 0

AdvanceDay == /\ phase = "idle"
              /\ nowDay < MaxDay
              /\ nowDay' = nowDay + 1
              /\ UNCHANGED <<archivedThrough, archived, phase, pendingThrough,
                             pendingArchive, lastFetch, failedArchive>>

BeginRefresh == /\ phase = "idle"
                /\ phase' = "fetch"
                /\ UNCHANGED <<nowDay, archivedThrough, archived,
                               pendingThrough, pendingArchive, lastFetch, failedArchive>>

FetchSuccess == /\ phase = "fetch"
                /\ phase' = "persist"
                /\ pendingThrough' = nowDay - 1
                /\ pendingArchive' = archived + (nowDay - archivedThrough - 1)
                /\ lastFetch' = "success"
                /\ UNCHANGED <<nowDay, archivedThrough, archived, failedArchive>>

FetchFailure == /\ phase = "fetch"
                /\ phase' = "idle"
                /\ lastFetch' = "failed"
                /\ failedArchive' = archived
                /\ archived' = archived
                /\ UNCHANGED <<nowDay, archivedThrough,
                               pendingThrough, pendingArchive>>

Persist == /\ phase = "persist"
           /\ phase' = "idle"
           /\ archivedThrough' = pendingThrough
           /\ archived' = pendingArchive
           /\ UNCHANGED <<nowDay, pendingThrough, pendingArchive,
                          lastFetch, failedArchive>>

Next == AdvanceDay \/ BeginRefresh \/ FetchSuccess \/ FetchFailure \/ Persist
Spec == Init /\ [][Next]_vars

TypeOK == /\ nowDay \in 0..MaxDay
          /\ archivedThrough \in -1..MaxDay
          /\ archived \in Nat
          /\ phase \in {"idle", "fetch", "persist"}
          /\ lastFetch \in {"none", "success", "failed"}

ArchiveOnce == archived = archivedThrough + 1
NoFutureArchive == archivedThrough < nowDay
FailedFetchKeepsArchive == lastFetch = "failed" => archived = failedArchive
ArchiveReady == archivedThrough >= 0
FetchFailed == lastFetch = "failed"
=============================================================================
