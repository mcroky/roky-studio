--------------------------- MODULE VisitorSnapshot ---------------------------
EXTENDS TLC

\* Models .github/workflows/pages.yml (snapshot step and upload) and
\* scripts/build-visitor-count.mjs (query, validation, JSON write).
\* Assumptions: the previous Pages deployment contains no secret; a successful
\* Cloudflare response is valid only after parseVisitorResponse accepts it;
\* a failed GitHub Actions step prevents the upload step from running.
\* FetchOk=FALSE represents HTTP, GraphQL, or response validation failure.

CONSTANTS HasCredentials, FetchOk
ASSUME /\ HasCredentials \in BOOLEAN
       /\ FetchOk \in BOOLEAN

VARIABLES phase, artifact, public
vars == <<phase, artifact, public>>

Init == /\ phase = "start"
        /\ artifact = "none"
        /\ public = "old"

SkipWithoutCredentials ==
  /\ phase = "start"
  /\ ~HasCredentials
  /\ phase' = "ready"
  /\ UNCHANGED <<artifact, public>>

FetchValid ==
  /\ phase = "start"
  /\ HasCredentials
  /\ FetchOk
  /\ phase' = "validated"
  /\ UNCHANGED <<artifact, public>>

FetchFailed ==
  /\ phase = "start"
  /\ HasCredentials
  /\ ~FetchOk
  /\ phase' = "failed"
  /\ UNCHANGED <<artifact, public>>

WriteSnapshot ==
  /\ phase = "validated"
  /\ phase' = "ready"
  /\ artifact' = "counts"
  /\ UNCHANGED public

Deploy ==
  /\ phase = "ready"
  /\ phase' = "deployed"
  /\ public' = artifact
  /\ UNCHANGED artifact

Done == /\ phase \in {"deployed", "failed"}
        /\ UNCHANGED vars

Next == SkipWithoutCredentials \/ FetchValid \/ FetchFailed \/ WriteSnapshot \/ Deploy \/ Done
Spec == Init /\ [][Next]_vars

NoSecretPublished == artifact # "secret" /\ public # "secret"
FailureKeepsPrevious == (HasCredentials /\ ~FetchOk) => public = "old"
PublishedCountsAreValidated == public = "counts" => (HasCredentials /\ FetchOk)

PublishedCounts == public = "counts"
FailedFetch == phase = "failed"
=============================================================================
