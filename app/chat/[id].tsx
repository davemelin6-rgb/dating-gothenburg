import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('Chat');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);

      // Fetch the match to find the other user's name
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id, user1:profiles!matches_user1_id_fkey(name), user2:profiles!matches_user2_id_fkey(name)')
        .eq('id', id)
        .single();

      if (match) {
        const isUser1 = match.user1_id === user.id;
        const other = isUser1 ? (match.user2 as any) : (match.user1 as any);
        if (other?.name) setOtherName(other.name);
      }
    });

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    loadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', id)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }

  async function sendMessage() {
    if (!text.trim() || !userId) return;
    const content = text.trim();
    setText('');

    await supabase.from('messages').insert({
      match_id: id,
      sender_id: userId,
      content,
    });
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerName}>{otherName}</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isOwn = item.sender_id === userId;
          return (
            <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
                {item.content}
              </Text>
              <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>{t('sayHello', { name: otherName })}</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={t('writeMessage')}
          placeholderTextColor="#aaa"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 44,
    alignItems: 'center',
  },
  backText: {
    fontSize: 30,
    color: '#e91e8c',
    lineHeight: 34,
  },
  headerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  bubbleOwn: {
    alignSelf: 'flex-end',
    backgroundColor: '#e91e8c',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: '#fff',
  },
  bubbleTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyChatText: {
    fontSize: 15,
    color: '#aaa',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a2e',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e91e8c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
});
