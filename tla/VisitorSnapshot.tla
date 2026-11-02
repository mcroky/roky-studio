--------------------------- MODULE VisitorSnapshot ---------------------------
EXTENDS TLC

\* Models read-public-history, validated Cloudflare query, archive and deploy.
\* A failed step prevents Pages upload. HistoryOk includes the first-run 404
\* bootstrap or a validated prior public history; FetchOk includes schema checks.
\* The abstract "retained" state means archived days are copied before append.

CONSTANTS HasCredentials, HistoryOk, FetchOk
ASSUME /\ HasCredentials \in BOOLEAN
       /\ HistoryOk \in BOOLEAN
       /\ FetchOk \in BOOLEAN

VARIABLES phase, artifact, archive, public, publicHistory
vars == <<phase, artifact, archive, public, publicHistory>>

Init == /\ phase = "start"
        /\ artifact = "none"
        /\ archive = "none"
        /\ public = "old"
        /\ publicHistory = "old"

MissingCredentials ==
  /\ phase = "start"
  /\ ~HasCredentials
  /\ phase' = "failed"
  /\ UNCHANGED <<artifact, archive, public, publicHistory>>

ReadHistory ==
  /\ phase = "start"
  /\ HasCredentials
  /\ HistoryOk
  /\ phase' = "history"
  /\ UNCHANGED <<artifact, archive, public, publicHistory>>

HistoryFailed ==
  /\ phase = "start"
  /\ HasCredentials
  /\ ~HistoryOk
  /\ phase' = "failed"
  /\ UNCHANGED <<artifact, archive, public, publicHistory>>

FetchValid ==
  /\ phase = "history"
  /\ HasCredentials
  /\ FetchOk
  /\ phase' = "validated"
  /\ UNCHANGED <<artifact, archive, public, publicHistory>>

FetchFailed ==
  /\ phase = "history"
  /\ HasCredentials
  /\ ~FetchOk
  /\ phase' = "failed"
  /\ UNCHANGED <<artifact, archive, public, publicHistory>>

WriteSnapshot ==
  /\ phase = "validated"
  /\ phase' = "ready"
  /\ artifact' = "counts"
  /\ archive' = "retained"
  /\ UNCHANGED <<public, publicHistory>>

Deploy ==
  /\ phase = "ready"
  /\ phase' = "deployed"
  /\ public' = artifact
  /\ publicHistory' = archive
  /\ UNCHANGED <<artifact, archive>>

Done == /\ phase \in {"deployed", "failed"}
        /\ UNCHANGED vars

Next == MissingCredentials \/ ReadHistory \/ HistoryFailed \/ FetchValid \/ FetchFailed \/ WriteSnapshot \/ Deploy \/ Done
Spec == Init /\ [][Next]_vars

NoSecretPublished == artifact # "secret" /\ public # "secret"
FailureKeepsPrevious == (~HasCredentials \/ ~HistoryOk \/ ~FetchOk) =>
  (public = "old" /\ publicHistory = "old")
PublishedCountsAreValidated == public = "counts" => (HasCredentials /\ HistoryOk /\ FetchOk)
ArchivedHistoryRetained == publicHistory \in {"old", "retained"}

PublishedCounts == public = "counts"
FailedFetch == phase = "failed"
=============================================================================
