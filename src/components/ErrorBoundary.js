import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../theme/colors';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={s.screen}>
        <Text style={s.emoji}>⚠️</Text>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.sub}>{this.state.error?.message ?? 'An unexpected error occurred.'}</Text>
        <TouchableOpacity style={s.btn} onPress={() => this.setState({ hasError: false, error: null })}>
          <Text style={s.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:  { fontSize: 56, marginBottom: 16 },
  title:  { fontSize: 22, fontWeight: 'bold', color: C.text, marginBottom: 10, textAlign: 'center' },
  sub:    { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  btn:    { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  btnText:{ fontSize: 16, fontWeight: 'bold', color: C.bg },
});
