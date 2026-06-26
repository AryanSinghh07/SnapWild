import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useFriendStore from '../../store/useFriendStore';
import { C } from '../../theme/colors';

function shortTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function ChatScreen({ navigation, route }) {
  const { convId, friend } = route.params;
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const insets    = useSafeAreaInsets();

  const conversations = useFriendStore(s => s.conversations);
  const sendMessage   = useFriendStore(s => s.sendMessage);
  const markRead      = useFriendStore(s => s.markRead);

  const conv = conversations.find(c => c.id === convId);

  useEffect(() => {
    markRead(convId);
  }, [convId]);

  useEffect(() => {
    if (conv?.messages?.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [conv?.messages?.length]);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg) return;
    sendMessage(convId, msg);
    setText('');
    Haptics.selectionAsync();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  if (!conv) {
    return (
      <View style={[s.screen, s.center, { paddingTop: insets.top }]}>
        <Text style={{ color: C.muted, fontSize: 14 }}>Conversation not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarLetter}>{friend.username[0].toUpperCase()}</Text>
            <View style={s.onlineDot} />
          </View>
          <View>
            <Text style={s.headerName}>{friend.username}</Text>
            <Text style={s.headerSub}>{friend.city} · {friend.catches} catches</Text>
          </View>
        </View>

        <TouchableOpacity style={s.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.msgList}
        contentContainerStyle={s.msgContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date divider */}
        <View style={s.dateDivider}>
          <View style={s.dateLine} />
          <Text style={s.dateText}>Today</Text>
          <View style={s.dateLine} />
        </View>

        {conv.messages.length === 0 && (
          <View style={s.emptyChat}>
            <Text style={s.emptyChatEmoji}>👋</Text>
            <Text style={s.emptyChatText}>Say hello to {friend.username}!</Text>
          </View>
        )}

        {conv.messages.map((msg) => (
          <View key={msg.id} style={[s.msgWrap, msg.fromMe && s.msgWrapMe]}>
            {!msg.fromMe && (
              <View style={s.msgAvatar}>
                <Text style={s.msgAvatarLetter}>{friend.username[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={s.msgColumn}>
              <View style={[s.bubble, msg.fromMe ? s.bubbleMe : s.bubbleThem]}>
                <Text style={[s.bubbleText, msg.fromMe && s.bubbleTextMe]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[s.msgTime, msg.fromMe && s.msgTimeMe]}>
                {shortTime(msg.time)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={[s.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder={`Message ${friend.username}...`}
            placeholderTextColor={C.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
        </View>
        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && s.sendBtnOff]}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color={text.trim() ? C.bg : C.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  center:  { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginHorizontal: 10 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  headerAvatarLetter: { fontSize: 17, fontWeight: 'bold', color: C.text },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: C.green, borderWidth: 2, borderColor: C.bg,
  },
  headerName: { fontSize: 15, fontWeight: '700', color: C.text },
  headerSub:  { fontSize: 11, color: C.muted, marginTop: 1 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },

  msgList:    { flex: 1 },
  msgContent: { padding: 16, paddingBottom: 8 },

  dateDivider:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dateLine:     { flex: 1, height: 1, backgroundColor: C.border },
  dateText:     { fontSize: 11, color: C.muted, fontWeight: '600' },

  emptyChat:     { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyChatEmoji:{ fontSize: 40 },
  emptyChatText: { fontSize: 14, color: C.muted },

  msgWrap:   { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
  msgWrapMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },

  msgAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.card2,
    alignItems: 'center', justifyContent: 'center', marginRight: 6, alignSelf: 'flex-end',
  },
  msgAvatarLetter: { fontSize: 12, fontWeight: 'bold', color: C.text },

  msgColumn: { flexDirection: 'column', gap: 3 },

  bubble: {
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    maxWidth: 260,
  },
  bubbleThem: {
    backgroundColor: C.card, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: C.border,
  },
  bubbleMe: {
    backgroundColor: C.accent, borderBottomRightRadius: 4,
  },
  bubbleText:   { fontSize: 14, color: C.text, lineHeight: 20 },
  bubbleTextMe: { color: C.bg },

  msgTime:   { fontSize: 10, color: C.muted, marginLeft: 6 },
  msgTimeMe: { textAlign: 'right', marginLeft: 0, marginRight: 6 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg,
  },
  inputWrap: {
    flex: 1, backgroundColor: C.card, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border, minHeight: 44,
    justifyContent: 'center',
  },
  input:   { fontSize: 14, color: C.text, maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
});
