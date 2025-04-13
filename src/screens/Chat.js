import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import sent from '../../src/assets/sent.png';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('.');
  const [showDots, setShowDots] = useState(true);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (!user) {
        navigation.replace('Login');
      } else {
        // Load chat only when user is authenticated
        loadChat();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [chat]);

  useEffect(() => {
    let dotsInterval;
    let blinkInterval;
    
    if (loading) {
      let count = 0;
      dotsInterval = setInterval(() => {
        count = (count + 1) % 3;
        setDots('.'.repeat(count + 1));
      }, 300);

      blinkInterval = setInterval(() => {
        setShowDots(prev => !prev);
      }, 500);
    } else {
      setDots('.');
      setShowDots(true);
    }
    
    return () => {
      clearInterval(dotsInterval);
      clearInterval(blinkInterval);
    };
  }, [loading]);

  const clearPreviousChat = async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore()
        .collection('chats')
        .doc(user.uid)
        .delete();
      setChat([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const loadChat = async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      const chatDoc = await firestore()
        .collection('chats')
        .doc(user.uid)
        .get();

      if (chatDoc.exists) {
        const data = chatDoc.data();
        if (data && data.messages) {
          setChat(data.messages);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const saveChat = async newChat => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore()
        .collection('chats')
        .doc(user.uid)
        .set({
          messages: newChat,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          userEmail: user.email,
        }, { merge: true });
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      // Navigation will be handled by the auth state listener
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const handleResponse = async (response, updatedChat) => {
    const data = await response.json();
    const botText = data.response?.trim();
    
    // Complete the dots animation
    setDots('...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const botReply = {
      text: botText || 'Something went wrong.',
      from: 'bot',
      id: (Date.now() + 1).toString(),
      time: getCurrentTime(),
    };

    const finalChat = [...updatedChat, botReply];
    setChat(finalChat);
    saveChat(finalChat);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      text: message,
      from: 'user',
      id: Date.now().toString(),
      time: getCurrentTime(),
    };
    const updatedChat = [...chat, newMessage];
    setChat(updatedChat);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('your api key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: message,
          stream: false,
        }),
      });
      
      await handleResponse(response, updatedChat);
      // Save the user's message immediately
      saveChat(updatedChat);
    } catch (error) {
      console.error('Ollama API error:', error);
      const errorReply = {
        text: 'Failed to get response from AI.',
        from: 'bot',
        id: (Date.now() + 1).toString(),
        time: getCurrentTime(),
      };
      const fallbackChat = [...updatedChat, errorReply];
      setChat(fallbackChat);
      saveChat(fallbackChat);
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.messageContainer,
        item.from === 'user' ? styles.userAlign : styles.botAlign,
      ]}>
      <Text
        style={[
          styles.message,
          item.from === 'user' ? styles.userMsg : styles.botMsg,
        ]}>
        {item.text}
      </Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={[...chat, ...(loading ? [{
          id: 'loading',
          from: 'bot',
          text: showDots ? dots : '',
          time: getCurrentTime()
        }] : [])]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 80}}
      />

      <View style={styles.chatContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Send a message..."
            placeholderTextColor="#888" 
            style={styles.input}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            disabled={loading}>
            <Image source={sent} style={styles.sentImg} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#000'},
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#7b50d3',
    color: '#fff',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
    color: '#fff',
  },
  header: {
    marginTop:30,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: 10,
  },
  sentImg: {
    width: 24,
    height: 24,
    tintColor: '#7b50d3',
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  userAlign: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botAlign: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
    marginHorizontal: 4,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  loadingDots: {
    maxWidth: '40%',
    marginBottom: 10,
  },
  signOutButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
  },
});
