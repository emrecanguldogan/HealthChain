import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

Clarinet.test({
  name: "HealthChain - Add Record",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const patient = accounts.get("wallet_1")!;
    
    const block = chain.mineBlock([
      Tx.contractCall(
        "healthchain",
        "add-record",
        [types.buff("Patient: Alice, Blood Type: A+, Allergies: None")],
        patient.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "HealthChain - Grant Access",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const patient = accounts.get("wallet_1")!;
    const doctor = accounts.get("wallet_2")!;
    
    const block = chain.mineBlock([
      Tx.contractCall(
        "healthchain",
        "grant-access",
        [types.principal(doctor.address)],
        patient.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "HealthChain - Get Record (Patient Access)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const patient = accounts.get("wallet_1")!;
    const doctor = accounts.get("wallet_2")!;
    
    // Add record
    chain.mineBlock([
      Tx.contractCall(
        "healthchain",
        "add-record",
        [types.buff("Patient: Alice, Blood Type: A+, Allergies: None")],
        patient.address
      ),
    ]);

    // Grant access to doctor
    chain.mineBlock([
      Tx.contractCall(
        "healthchain",
        "grant-access",
        [types.principal(doctor.address)],
        patient.address
      ),
    ]);

    // Doctor can read record
    const result = chain.callReadOnlyFn(
      "healthchain",
      "get-record",
      [types.principal(patient.address)],
      doctor.address
    );

    result.result.expectOk().expectBuff("Patient: Alice, Blood Type: A+, Allergies: None");
  },
});

Clarinet.test({
  name: "HealthChain - Get Record (Unauthorized)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const patient = accounts.get("wallet_1")!;
    const unauthorized = accounts.get("wallet_2")!;
    
    // Add record
    chain.mineBlock([
      Tx.contractCall(
        "healthchain",
        "add-record",
        [types.buff("Patient: Alice, Blood Type: A+, Allergies: None")],
        patient.address
      ),
    ]);

    // Unauthorized user tries to read record
    const result = chain.callReadOnlyFn(
      "healthchain",
      "get-record",
      [types.principal(patient.address)],
      unauthorized.address
    );

    result.result.expectErr().expectUint(403);
  },
}); 