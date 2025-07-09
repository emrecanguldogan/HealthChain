const fs = require('fs');
const path = require('path');

// Contract content
const contractContent = fs.readFileSync(path.join(__dirname, 'clarity/contracts/healthchain_v4.clar'), 'utf8');

// Deploy contract to testnet
async function deployContract() {
  const apiKey = '9d2edca11fe49a2d6dc07f5a2bc5e998';
  const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const contractName = 'healthchain_v4';
  
  const deployUrl = `https://api.platform.hiro.so/v1/ext/${apiKey}/stacks-blockchain-api/v2/contracts/deploy?network=testnet`;
  
  const deployData = {
    contract_id: `${contractAddress}.${contractName}`,
    source: contractContent,
    clarity_version: 3
  };

  try {
    console.log('Deploying contract to devnet...');
    console.log(`Contract ID: ${contractAddress}.${contractName}`);
    
    const response = await fetch(deployUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(deployData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deploy failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Contract deployed successfully!');
    console.log('Transaction ID:', result.txid);
    console.log('Contract deployed at:', `${contractAddress}.${contractName}`);
    
    return result.txid;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

// Run deployment
deployContract()
  .then(txid => {
    console.log('\n✅ Contract deployment completed!');
    console.log('Transaction ID:', txid);
    console.log('You can now test NFT minting in the frontend.');
  })
  .catch(error => {
    console.error('\n❌ Contract deployment failed:', error.message);
    process.exit(1);
  }); 