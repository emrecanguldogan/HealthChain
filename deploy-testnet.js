const fs = require('fs');
const path = require('path');

// Contract content
const contractContent = fs.readFileSync(path.join(__dirname, 'clarity/contracts/healthchain_v4.clar'), 'utf8');

console.log('📋 Contract içeriği:');
console.log(contractContent);
console.log('\n' + '='.repeat(50));
console.log('🚀 Testnet Deploy Talimatları:');
console.log('1. https://sandbox.hiro.so adresine gidin');
console.log('2. "Deploy Contract" butonuna tıklayın');
console.log('3. Contract adı: healthchain');
console.log('4. Contract içeriğini yukarıdaki koda kopyalayın');
console.log('5. Deploy butonuna tıklayın');
console.log('6. Deploy edilen contract adresini not alın');
console.log('7. Bu adresi frontend/src/lib/clarity-utils.ts dosyasında güncelleyin');
console.log('\nContract adresi şu formatta olacak: ST...');
console.log('='.repeat(50)); 