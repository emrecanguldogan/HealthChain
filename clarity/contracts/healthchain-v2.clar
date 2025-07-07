;; HealthChain v2 - Health Records and NFT-based Access Control
;; Clarity v3.2.0, SIP-009 NFT trait compatible

;; --- SIP-009 NFT Trait import ---
(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-009-nft-trait-001.sip-009-nft-trait)

;; --- Contract owner ---
(define-constant contract-owner 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; --- NFT Token Definition (SIP-009) ---
(define-non-fungible-token access-token uint)

;; --- Access Control and Health Records ---
;; Patient-doctor access permissions: (patient, doctor) -> allowed
(define-map access-permissions ((patient principal) (doctor principal)) ((allowed bool)))

;; Health records: (patient, record-id) -> (data, timestamp)
(define-map patient-records ((patient principal) (record-id uint)) ((data (string-utf8 1000)) (timestamp uint)))

;; Counters
(define-data-var last-token-id uint u0)
(define-data-var last-record-id uint u0)

;; --- Helper Functions ---

;; Generate next token-id
(define-private (get-next-token-id)
  (let ((current-id (var-get last-token-id)))
    (var-set last-token-id (+ current-id u1))
    current-id
  )
)

;; Generate next health record id
(define-private (get-next-record-id)
  (let ((current-id (var-get last-record-id)))
    (var-set last-record-id (+ current-id u1))
    current-id
  )
)

;; --- SIP-009 NFT Trait Functions ---

;; Return token owner (SIP-009 compliant)
(define-read-only (get-owner (token-id uint))
  (match (nft-get-owner? access-token token-id)
    some owner (ok (some owner))
    none (ok none)
  )
)

;; Return token URI (SIP-009 compliant)
(define-read-only (get-token-uri (token-id uint))
  (ok none)
)

;; Transfer token (SIP-009 compliant)
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (nft-transfer? access-token token-id sender recipient)
)

;; --- NFT Mint/Burn Functions ---

;; Patient can mint a unique access token for themselves
(define-public (mint-access-token)
  (nft-mint? access-token (begin (var-set last-token-id (+ (var-get last-token-id) u1)) (- (var-get last-token-id) u1)) tx-sender)
)

;; Burn token (only owner)
(define-public (burn-access-token (token-id uint))
  (match (nft-get-owner? access-token token-id)
    some owner (if (is-eq tx-sender owner)
                  (nft-burn? access-token token-id tx-sender)
                  (err u101))
    none (err u102)
  )
)

;; --- Patient-Doctor Access Control ---

(define-public (grant-access (doctor principal))
  (map-set access-permissions ((patient tx-sender) (doctor doctor)) ((allowed true)))
)

(define-public (revoke-access (doctor principal))
  (map-delete access-permissions ((patient tx-sender) (doctor doctor)))
)

;; Query if a doctor has access to a patient
(define-read-only (has-access (patient principal) (doctor principal))
  (match (map-get? access-permissions ((patient patient) (doctor doctor)))
    permission (get allowed permission)
    none false
  )
)

;; --- Health Record Add/Read ---

(define-public (add-health-record (data (string-utf8 1000)))
  (let ((record-id (begin (var-set last-record-id (+ (var-get last-record-id) u1)) (- (var-get last-record-id) u1))))
    (map-set patient-records ((patient tx-sender) (record-id record-id)) ((data data) (timestamp (block-height))))
  )
)

;; Read a health record (only patient or authorized doctor)
(define-read-only (get-health-record (patient principal) (record-id uint))
  (let ((caller tx-sender))
    (if (or (is-eq caller patient)
            (match (map-get? access-permissions ((patient patient) (doctor caller)))
              permission (get allowed permission)
              none false))
        (match (map-get? patient-records ((patient patient) (record-id record-id)))
          record (ok (some record))
          none (ok none)
        )
        (err u105)
    )
  )
)

;; --- Read Functions ---

;; Number of tokens
(define-read-only (get-token-count)
  (var-get last-token-id)
)

;; Number of health records
(define-read-only (get-record-count)
  (var-get last-record-id)
)

;; --- Error codes ---
;; u101: Only owner can burn
;; u102: Token does not exist
;; u105: Unauthorized access to health record
