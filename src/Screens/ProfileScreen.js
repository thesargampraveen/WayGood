import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LANGUAGES from '../data/languages';
import { COLORS, CARD_SHADOW } from '../theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(null);
  const [totals, setTotals] = useState(null); // { langCode: totalLessons }

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/api/progress'),
        ...LANGUAGES.map((l) => api.get(`/api/lessons/language/${l.code}`)),
      ])
        .then(([progressRes, ...lessonRes]) => {
          setProgress(progressRes.data.progress);
          const t = {};
          LANGUAGES.forEach((l, i) => {
            t[l.code] = lessonRes[i].data.lessons.length;
          });
          setTotals(t);
        })
        .catch(() => {
          setProgress(null);
          setTotals(null);
        });
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const completedLessons = progress?.completedLessons || [];
  const quizResults = progress?.quizResults || [];
  const avgScore =
    quizResults.length > 0
      ? Math.round(
          (quizResults.reduce((s, q) => s + q.score / q.total, 0) / quizResults.length) * 100
        )
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={[styles.userCard, CARD_SHADOW]}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={styles.userStatNum}>{completedLessons.length}</Text>
              <Text style={styles.userStatLabel}>Lessons</Text>
            </View>
            <View style={[styles.userStat, styles.userStatBorder]}>
              <Text style={styles.userStatNum}>{quizResults.length}</Text>
              <Text style={styles.userStatLabel}>Quizzes</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNum}>{avgScore}%</Text>
              <Text style={styles.userStatLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        {/* Per-language progress */}
        <Text style={styles.sectionTitle}>Progress by language</Text>
        {progress === null || totals === null ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
        ) : (
          LANGUAGES.map((lang) => {
            const done = completedLessons.filter((l) => l.language === lang.code).length;
            const total = totals[lang.code] || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <View key={lang.code} style={[styles.langCard, CARD_SHADOW]}>
                <View style={styles.langRow}>
                  <View style={[styles.langBadge, { backgroundColor: lang.lightColor }]}>
                    <Text style={{ fontSize: 20 }}>{lang.emoji}</Text>
                  </View>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={[styles.langPct, { color: lang.color }]}>{pct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%`, backgroundColor: lang.color },
                    ]}
                  />
                </View>
                <Text style={styles.langMeta}>
                  {done} of {total} lessons
                </Text>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  userCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
  },
  bigAvatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigAvatarText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 21, fontWeight: 'bold', color: COLORS.text, marginTop: 12 },
  userEmail: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  userStats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 20,
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 12,
  },
  userStat: { flex: 1, alignItems: 'center' },
  userStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  userStatNum: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  userStatLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 26,
    marginBottom: 12,
  },
  langCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  langBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  langPct: { fontSize: 16, fontWeight: 'bold' },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  langMeta: { fontSize: 12, color: COLORS.subtext, marginTop: 8 },
  logoutBtn: {
    borderWidth: 2,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
  logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 15 },
});

export default ProfileScreen;
