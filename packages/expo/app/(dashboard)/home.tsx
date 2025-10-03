import {
  generateNoirProof,
  getNoirVerificationKey,
  verifyNoirProof
} from '@/modules/mopro';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

function NoirProofComponent() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [inputs, setInputs] = useState<string[]>([]);
  const [proof, setProof] = useState<Uint8Array>(new Uint8Array());
  const [isValid, setIsValid] = useState<string>('');
  const [vk, setVk] = useState<Uint8Array>(new Uint8Array());

  async function genProof(): Promise<void> {
    const circuitInputs = [a, b];
    if (Platform.OS === 'web') {
      console.log('not implemented');
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const circuitName = 'noir_multiplier2.json';

      const content = require(`@/assets/keys/${circuitName}`);

      const newFilePath = `${FileSystem.documentDirectory}${circuitName}`;

      const fileInfo = await FileSystem.getInfoAsync(newFilePath);
      if (!fileInfo.exists) {
        try {
          await FileSystem.writeAsStringAsync(
            newFilePath,
            JSON.stringify(content)
          );
        } catch (error) {
          console.error('Error copying file:', error);
          throw error;
        }
      }

      try {
        const onChain = true;
        const lowMemoryMode = false;
        let verificationKey: Uint8Array;
        if (vk.length === 0) {
          verificationKey = await getNoirVerificationKey(
            newFilePath.replace('file://', ''),
            null,
            onChain,
            lowMemoryMode
          );
          setVk(verificationKey);
        } else {
          verificationKey = vk;
        }

        const res: Uint8Array = await generateNoirProof(
          newFilePath.replace('file://', ''),
          null,
          circuitInputs,
          onChain,
          verificationKey,
          lowMemoryMode
        );
        setProof(res);
      } catch (error) {
        console.error('Error generating proof:', error);
      }
    }
  }

  async function verifyProof(): Promise<void> {
    if (Platform.OS === 'web') {
      setIsValid('not implemented');
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      if (proof.length === 0) {
        setIsValid('Error: Proof data is not available. Generate proof first.');
        return;
      }

      if (vk.length === 0) {
        setIsValid(
          'Error: Verification key is not available. Generate proof first.'
        );
        return;
      }

      const circuitName = 'noir_multiplier2.json';

      const content = require(`@/assets/keys/${circuitName}`);

      const newFilePath = `${FileSystem.documentDirectory}${circuitName}`;

      const fileInfo = await FileSystem.getInfoAsync(newFilePath);
      if (!fileInfo.exists) {
        try {
          await FileSystem.writeAsStringAsync(
            newFilePath,
            JSON.stringify(content)
          );
        } catch (error) {
          console.error('Error copying file:', error);
          throw error;
        }
      }

      try {
        const onChain = true;
        const lowMemoryMode = false;

        const res: boolean = await verifyNoirProof(
          newFilePath.replace('file://', ''),
          proof,
          onChain,
          vk,
          lowMemoryMode
        );
        setIsValid(res.toString());
      } catch (error) {
        console.error('Error verifying proof:', error);
      }
    }
  }

  return (
    <View style={styles.proofContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>a</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter value for a"
          value={a}
          onChangeText={setA}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>b</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter value for b"
          value={b}
          onChangeText={setB}
          keyboardType="numeric"
        />
      </View>
      <Button title="Generate Noir Proof" onPress={() => genProof()} />
      <Button title="Verify Noir Proof" onPress={() => verifyProof()} />
      <View style={styles.stepContainer}>
        <Text style={{ fontWeight: '600' }}>Proof is Valid:</Text>
        <Text style={styles.output}>{isValid}</Text>
        <Text style={{ fontWeight: '600' }}>Proof:</Text>
        <ScrollView style={styles.outputScroll}>
          <Text style={styles.output}>{proof}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <NoirProofComponent />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    marginRight: 10
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute'
  },
  outputScroll: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10
  },
  output: {
    fontSize: 14,
    padding: 10
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc'
  },
  activeTab: {
    borderBottomColor: '#A1CEDC'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500'
  },
  proofContainer: {
    padding: 10
  }
});
