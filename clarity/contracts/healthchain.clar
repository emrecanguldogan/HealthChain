;; HealthChain - NFT-based Access Control System
;; Features: NFT minting, doctor authorization, access control

;; Data structures
(define-map access-tokens
  { owner: principal }
  { 
    token-id: uint,
    minted-at: uint,
    is-active: bool
  }
)

(define-map doctor-authorizations
  { patient: principal, doctor: principal }
  { 
    authorized: bool,
    authorized-at: uint,
    permissions: (list 10 (string-ascii 20))
  }
)

(define-map token-ownership
  { token-id: uint }
  { owner: principal }
)

(define-map patient-token
  { patient: principal }
  { token-id: uint }
)

;; Constants
(define-constant TOKEN_NAME "HealthChain Access Token")
(define-constant TOKEN_SYMBOL "HCAT")
(define-constant TOKEN_URI "https://healthchain.com/metadata/")

;; State variables
(define-data-var next-token-id uint u0)

;; Helper functions
(define-private (get-next-token-id)
  (let ((current-id (var-get next-token-id)))
    (begin
      (var-set next-token-id (+ current-id u1))
      current-id
    )
  )
)

;; Public functions

;; Mint access token for user
(define-public (mint-access-token)
  (let ((sender tx-sender)
        (token-id (get-next-token-id))
        (timestamp u0)) ;; We'll use 0 for now since block-height is not available
    (begin
      ;; Check if user already has a token
      (asserts! (is-none (map-get? access-tokens { owner: sender })) (err u1))
      
      ;; Create access token
      (map-set access-tokens { owner: sender } {
        token-id: token-id,
        minted-at: timestamp,
        is-active: true
      })
      
      ;; Set token ownership
      (map-set token-ownership { token-id: token-id } { owner: sender })
      
      ;; Link patient to token
      (map-set patient-token { patient: sender } { token-id: token-id })
      
      (ok token-id)
    )
  )
)

;; Authorize doctor to access patient data
(define-public (authorize-doctor (doctor principal) (permissions (list 10 (string-ascii 20))))
  (let ((sender tx-sender)
        (timestamp u0))
    (begin
      ;; Check if sender has an access token
      (asserts! (is-some (map-get? access-tokens { owner: sender })) (err u2))
      
      ;; Authorize doctor
      (map-set doctor-authorizations { patient: sender, doctor: doctor } {
        authorized: true,
        authorized-at: timestamp,
        permissions: permissions
      })
      
      (ok true)
    )
  )
)

;; Revoke doctor authorization
(define-public (revoke-doctor (doctor principal))
  (let ((sender tx-sender))
    (begin
      ;; Check if sender has an access token
      (asserts! (is-some (map-get? access-tokens { owner: sender })) (err u2))
      
      ;; Revoke authorization
      (map-set doctor-authorizations { patient: sender, doctor: doctor } {
        authorized: false,
        authorized-at: u0,
        permissions: (list)
      })
      
      (ok true)
    )
  )
)

;; Transfer access token (NFT transfer)
(define-public (transfer-token (new-owner principal))
  (let ((sender tx-sender))
    (begin
      ;; Check if sender has an access token
      (asserts! (is-some (map-get? access-tokens { owner: sender })) (err u2))
      
      (let ((token-data (unwrap-panic (map-get? access-tokens { owner: sender })))
            (token-id (get token-id token-data)))
        (begin
          ;; Update token ownership
          (map-set token-ownership { token-id: token-id } { owner: new-owner })
          
          ;; Update access tokens
          (map-set access-tokens { owner: new-owner } token-data)
          (map-delete access-tokens { owner: sender })
          
          ;; Update patient-token mapping
          (map-set patient-token { patient: new-owner } { token-id: token-id })
          (map-delete patient-token { patient: sender })
          
          (ok true)
        )
      )
    )
  )
)

;; Read-only functions

;; Check if user has access token
(define-read-only (has-access-token (user principal))
  (ok (is-some (map-get? access-tokens { owner: user })))
)

;; Get user's access token ID
(define-read-only (get-access-token-id (user principal))
  (match (map-get? access-tokens { owner: user })
    token-data (ok (get token-id token-data))
    (err u3)
  )
)

;; Check if doctor is authorized for patient
(define-read-only (is-doctor-authorized (patient principal) (doctor principal))
  (match (map-get? doctor-authorizations { patient: patient, doctor: doctor })
    auth-data (ok (get authorized auth-data))
    (err u4)
  )
)

;; Get doctor permissions for patient
(define-read-only (get-doctor-permissions (patient principal) (doctor principal))
  (match (map-get? doctor-authorizations { patient: patient, doctor: doctor })
    auth-data (ok (get permissions auth-data))
    (err u4)
  )
)

;; Get token owner
(define-read-only (get-token-owner (token-id uint))
  (match (map-get? token-ownership { token-id: token-id })
    ownership (ok (get owner ownership))
    (err u5)
  )
)

;; Get patient's token ID
(define-read-only (get-patient-token-id (patient principal))
  (match (map-get? patient-token { patient: patient })
    token-data (ok (get token-id token-data))
    (err u3)
  )
)

;; NFT trait functions (for compatibility)
(define-read-only (get-token-uri (token-id uint))
  (ok (some TOKEN_URI))
)

(define-read-only (get-owner (token-id uint))
  (get-token-owner token-id)
)

(define-read-only (get-last-token-id)
  (ok (var-get next-token-id))
) 