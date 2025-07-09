;; HealthChain v2 - NFT-Based Access Control for Health Records
;; Author: Emrecan Guldogan
;; Clarity Version: 3.2.0
;; Description: Each patient mints a unique access token (NFT). Patients can grant or revoke access to doctors.
;;              Doctors can only read patient health records if authorized. Health data is stored off-chain.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                            TRAIT IMPORT                          ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; SIP-009 NFT Trait (must be deployed separately)
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                            CONSTANTS                             ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant contract-owner tx-sender) ;; Optional
(define-map user-roles {user: principal} {role: (string-ascii 10)})

(define-constant ERR-NOT-TOKEN-OWNER (err u100))
(define-constant ERR-TOKEN-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-HAS-TOKEN (err u102))
(define-constant ERR-NO-EXISTING-ACCESS (err u103))
(define-constant ERR-DEV-ONLY (err u105))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                         DATA STRUCTURES                          ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; NFT storage
(define-non-fungible-token access-token uint)

;; Mapping: (patient, doctor) => token-id
(define-map access-control {patient: principal, doctor: principal} {token-id: uint})

;; Token metadata URI (optional)
(define-map token-uri {token-id: uint} {uri: (string-utf8 256)})

;; Token Counter
(define-data-var last-token-id uint u0)

(define-map user-tokens {user: principal} {token-id: uint})

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                      PRIVATE HELPER FUNCTIONS                    ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-private (next-token-id)
  (let ((id (var-get last-token-id)))
    (begin
      (var-set last-token-id (+ id u1))
      id)))

(define-private (internal-grant (doctor principal) (token-id uint))
  (map-set access-control {patient: tx-sender, doctor: doctor} {token-id: token-id}))

(define-private (internal-revoke (doctor principal))
  (map-delete access-control {patient: tx-sender, doctor: doctor}))

(define-private (internal-store-uri (token-id uint) (uri (string-utf8 256)))
  (map-set token-uri {token-id: token-id} {uri: uri}))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                         PUBLIC FUNCTIONS                         ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; Mint an access NFT (one per patient recommended)
(define-public (mint-access-token (uri (string-utf8 256)))
  (let ((existing (map-get? user-tokens {user: tx-sender})))
    (begin
      (asserts! (is-none existing) (err u102))
      (let ((id (next-token-id)))
        (begin
          (try! (nft-mint? access-token id tx-sender))
          (internal-store-uri id uri)
          (map-set user-tokens {user: tx-sender} {token-id: id})
          (ok id))))))

;; Grant doctor access to patient's records via NFT token-id
(define-public (grant-access (doctor principal) (token-id uint))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? access-token token-id) (err u101))) (err u100))
    (asserts! (is-some (map-get? token-uri {token-id: token-id})) (err u101))
    (internal-grant doctor token-id)
    (ok true)))

;; Revoke a doctor's access
(define-public (revoke-access (doctor principal))
  (begin
    (internal-revoke doctor)
    (ok true)))

(define-read-only (dev-view-access (patient principal) (doctor principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u105))
    (match (map-get? access-control {patient: patient, doctor: doctor})
      entry (let ((token-id (get token-id entry)))
        (match (map-get? token-uri {token-id: token-id})
          uri-entry (ok (tuple (token-id token-id) (uri (get uri uri-entry))))
          (err u101)))
      (err u101))))

(define-public (assign-role (role (string-ascii 10)))
  (let ((existing (map-get? user-roles {user: tx-sender})))
    (begin
      (if (is-eq tx-sender contract-owner)
        (begin
          (asserts! (is-none existing) (err u112))
          (map-set user-roles {user: tx-sender} {role: "dev"})
          (ok true))
        (begin
          (asserts! (is-none existing) (err u112))
          (asserts! (or (is-eq role "doctor") (is-eq role "patient")) (err u111))
          (map-set user-roles {user: tx-sender} {role: role})
          (ok true))))))

(define-read-only (has-access (patient principal) (doctor principal))
  (let ((role-entry (map-get? user-roles {user: tx-sender})))
    (if (is-none role-entry)
      (err u110) ;; no role assigned
      (let ((role (get role (unwrap-panic role-entry))))
        (if (is-eq role "patient")
          (if (is-eq tx-sender patient)
            (match (map-get? access-control {patient: tx-sender, doctor: doctor})
              entry (let ((token-id (get token-id entry)))
                      (match (map-get? token-uri {token-id: token-id})
                        uri-entry (ok (some (get uri uri-entry)))
                        (ok none)))
              (ok none))
            (err u120)) ;; patient cannot query for others
          (if (is-eq role "dev")
            (match (map-get? access-control {patient: patient, doctor: doctor})
              entry (let ((token-id (get token-id entry)))
                      (match (map-get? token-uri {token-id: token-id})
                        uri-entry (ok (some (get uri uri-entry)))
                        (ok none)))
              (ok none))
            (if (is-eq role "doctor")
              (if (is-eq tx-sender doctor)
                (match (map-get? access-control {patient: patient, doctor: tx-sender})
                  entry (let ((token-id (get token-id entry)))
                          (match (map-get? token-uri {token-id: token-id})
                            uri-entry (ok (some (get uri uri-entry)))
                            (ok none)))
                  (ok none))
                (err u130)) ;; doctor cannot query for other doctors
              (err u140))))))))

(define-read-only (dev-view-role (user principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u105))
    (match (map-get? user-roles {user: user})
      entry (ok (get role entry))
      (err u101))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                            ERRORS                                ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; u100: Only token owner can grant access
;; u101: Invalid token-id

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                            END                                   ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
