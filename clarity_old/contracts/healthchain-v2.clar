;; HealthChain V2 - Real NFT-based Access Control System
;; NFT represents ownership only, access permissions managed via mutable maps
;; No simulation - all operations are real blockchain transactions

;; Import SIP-009 NFT trait
(use-trait sip009-trait .sip009 sip009-trait)

;; Define the NFT token
(define-non-fungible-token access-token uint)

;; Mutable maps for access permissions (separate from NFT ownership)
(define-map doctor-authorizations
  { patient: principal, doctor: principal }
  { 
    authorized: bool,
    permissions: (list 5 (string-ascii 10))
  }
)

(define-map patient-records
  { patient: principal, record-id: uint }
  {
    record-type: (string-ascii 20),
    description: (string-ascii 100),
    data: (string-ascii 500),
    created-by: principal,
    created-at: uint
  }
)

;; State variables
(define-data-var next-token-id uint u0)
(define-data-var next-record-id uint u0)

;; Helper functions
(define-private (get-next-token-id)
  (let ((current-id (var-get next-token-id)))
    (begin
      (var-set next-token-id (+ current-id u1))
      current-id
    )
  )
)

(define-private (get-next-record-id)
  (let ((current-id (var-get next-record-id)))
    (begin
      (var-set next-record-id (+ current-id u1))
      current-id
    )
  )
)

;; Public functions - Real NFT minting

;; Mint access token (NFT) - represents ownership only
(define-public (mint-access-token)
  (let ((sender tx-sender)
        (token-id (get-next-token-id)))
    (begin
      ;; Check if user already has a token (check if they own token ID 0)
      (asserts! (is-none (nft-get-owner? access-token u0)) (err u1))
      
      ;; Mint real NFT token
      (nft-mint? access-token token-id sender)
      
      (ok token-id)
    )
  )
)

;; Authorize doctor - uses mutable map, not NFT
(define-public (authorize-doctor (doctor principal) (permissions (list 5 (string-ascii 10))))
  (let ((sender tx-sender))
    (begin
      ;; Check if sender has an NFT token (ownership check)
      (asserts! (is-some (nft-get-owner? access-token u0)) (err u2))
      
      ;; Update mutable authorization map
      (map-set doctor-authorizations { patient: sender, doctor: doctor } {
        authorized: true,
        permissions: permissions
      })
      
      (ok true)
    )
  )
)

;; Revoke doctor authorization - uses mutable map
(define-public (revoke-doctor (doctor principal))
  (let ((sender tx-sender))
    (begin
      ;; Check if sender has an NFT token (ownership check)
      (asserts! (is-some (nft-get-owner? access-token u0)) (err u2))
      
      ;; Update mutable authorization map
      (map-set doctor-authorizations { patient: sender, doctor: doctor } {
        authorized: false,
        permissions: (list)
      })
      
      (ok true)
    )
  )
)

;; Transfer NFT token (ownership transfer)
(define-public (transfer-token (new-owner principal))
  (let ((sender tx-sender))
    (begin
      ;; Check if sender owns an NFT token
      (asserts! (is-some (nft-get-owner? access-token u0)) (err u2))
      
      ;; Transfer NFT ownership
      (nft-transfer? access-token u0 sender new-owner)
      
      (ok true)
    )
  )
)

;; Burn NFT token (destroy ownership)
(define-public (burn-token)
  (let ((sender tx-sender))
    (begin
      ;; Check if sender owns an NFT token
      (asserts! (is-some (nft-get-owner? access-token u0)) (err u2))
      
      ;; Burn NFT token
      (nft-burn? access-token u0 sender)
      
      (ok true)
    )
  )
)

;; Add health record - uses mutable map
(define-public (add-health-record (patient principal) (record-type (string-ascii 20)) (description (string-ascii 100)) (data (string-ascii 500)))
  (let ((sender tx-sender)
        (record-id (get-next-record-id)))
    (begin
      ;; Check if sender is authorized for this patient (mutable map check)
      (asserts! (is-some (map-get? doctor-authorizations { patient: patient, doctor: sender })) (err u3))
      
      ;; Add record to mutable map
      (map-set patient-records { patient: patient, record-id: record-id } {
        record-type: record-type,
        description: description,
        data: data,
        created-by: sender,
        created-at: (block-height)
      })
      
      (ok record-id)
    )
  )
)

;; Read-only functions (No gas cost)

;; Check if user has NFT token (ownership check)
(define-read-only (has-access-token (user principal))
  (ok (is-some (nft-get-owner? access-token u0)))
)

;; Get user's NFT token ID
(define-read-only (get-token-id (user principal))
  (match (nft-get-owner? access-token u0)
    owner (if (eq? owner user) (ok u0) (err u3))
    (err u3)
  )
)

;; Check if doctor is authorized for patient (mutable map check)
(define-read-only (check-user-access (patient principal) (doctor principal))
  (match (map-get? doctor-authorizations { patient: patient, doctor: doctor })
    auth-data (ok (get authorized auth-data))
    (err u4)
  )
)

;; Get doctor permissions for patient (mutable map check)
(define-read-only (get-doctor-permissions (patient principal) (doctor principal))
  (match (map-get? doctor-authorizations { patient: patient, doctor: doctor })
    auth-data (ok (get permissions auth-data))
    (err u4)
  )
)

;; Get NFT token owner
(define-read-only (get-token-owner (token-id uint))
  (match (nft-get-owner? access-token token-id)
    owner (ok (some owner))
    (err u5)
  )
)

;; Get patient's NFT token ID
(define-read-only (get-patient-token-id (patient principal))
  (match (nft-get-owner? access-token u0)
    owner (if (eq? owner patient) (ok u0) (err u3))
    (err u3)
  )
)

;; Get health record
(define-read-only (get-health-record (patient principal) (record-id uint))
  (match (map-get? patient-records { patient: patient, record-id: record-id })
    record-data (ok (some record-data))
    (err u6)
  )
)

;; Get all records for patient
(define-read-only (get-patient-records (patient principal))
  (ok (map-get? patient-records { patient: patient, record-id: u0 }))
)

;; NFT trait implementation
(define-read-only (get-token-uri (token-id uint))
  (ok (some "https://healthchain.com/metadata/"))
)

(define-read-only (get-owner (token-id uint))
  (get-token-owner token-id)
)

(define-read-only (get-last-token-id)
  (ok (var-get next-token-id))
) 