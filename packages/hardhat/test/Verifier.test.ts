import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describe, it } from 'mocha';
import generateProof from '../scripts/generateProof';

describe('Verifier', () => {
  let verifier: any;

  before(async () => {
    const verifierFactory = await ethers.getContractFactory('Verifier');
    verifier = await verifierFactory.deploy();
    await verifier.waitForDeployment();
  });

  it('should verify a valid proof', async () => {
    // Define test inputs for the circuit
    const inputs = {
      // Add your circuit inputs here based on your Noir circuit
      // Example inputs (adjust based on your actual circuit):
      x: 5,
      y: 10
    };

    // Generate proof using the generateProof script
    const proof = await generateProof(inputs);
    expect(proof).to.not.be.undefined;

    // Verify the proof on-chain
    const isValid = await verifier.verify(proof);
    expect(isValid).to.be.true;
  });

  it('should reject an invalid proof', async () => {
    // Create an invalid proof (random bytes)
    const invalidProof = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes'],
      [ethers.randomBytes(1000)] // Random invalid proof data
    );

    // Verify the invalid proof should fail
    const isValid = await verifier.verify(invalidProof);
    expect(isValid).to.be.false;
  });
});
