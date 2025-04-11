import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import icon from '../../src/assets/sparkle.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        navigation.replace('Chat');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      if (result.user) {
        navigation.replace('Chat');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      if (result.user) {
        navigation.replace('Chat');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Image style={styles.icon} source={icon} />
        <Text style={styles.title}>AI ChatBot</Text>
      </View>
  
      {/* Keyboard-Aware Scrollable Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContent}>
            <Text style={styles.text1}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
  
            <Text style={styles.text2}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />
  
            {loading ? (
              <ActivityIndicator size="large" color="#7b50d3" style={styles.loading} />
            ) : (
              <>
                <TouchableOpacity style={styles.button} onPress={signIn}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
  
                <TouchableOpacity style={styles.button2} onPress={register}>
                  <Text style={styles.buttonText2}>Register</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#160b2c',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
    // marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom:20
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 100,
  },
  input: {
    backgroundColor: '#f1edfa',
    borderRadius: 10,
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    color:"000"
  },
  text1: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  text2: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#7b50d3',
    borderRadius: 10,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button2: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonText2: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loading: {
    marginTop: 20,
  },
  
});
