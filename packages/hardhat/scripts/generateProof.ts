import { ethers } from 'ethers';
import { InputMap, Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';
import path from 'path';
import fs from 'fs';

const circuitPath = path.join(__dirname, '../target/noir.json');
const circuit = JSON.parse(fs.readFileSync(circuitPath, 'utf8'));

const generateProof = async (inputs: InputMap): Promise<string | undefined> => {
  const noir = new Noir(circuit);
  const bb = new UltraHonkBackend(circuit.bytecode, { threads: 1 });

  try {
    const { witness } = await noir.execute(inputs);

    const { proof } = await bb.generateProof(witness, { keccak: true });

    const encodedProof = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes'],
      [proof]
    );

    return encodedProof;
  } catch (error) {
    throw error;
  }
};

export default generateProof;
