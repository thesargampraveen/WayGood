import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LANGUAGES from '../data/languages';
import { COLORS, CARD_SHADOW } from '../theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState(null); // { langCode: {done, total, quizzes} }
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // Load lessons of every language + my progress, then merge
    const lessonResponses = await Promise.all(
      LANGUAGES.map((l) => api.get(`/api/lessons/language/${l.code}`))
    );
    const progressRes = await api.get('/api/progress');

    const completed = new Set(
      (progressRes.data.progress?.completedLessons || []).map((l) => l._id)
    );
    const quizResults = progressRes.data.progress?.quizResults || [];

    const map = {};
    LANGUAGES.forEach((l, i) => {
      const lessons = lessonResponses[i].data.lessons;
      const done = lessons.filter((ls) => completed.has(ls._id)).length;
      const quizzes = quizResults.filter(
        (q) => lessons.some((ls) => ls._id === q.lesson)
      ).length;
      map[l.code] = { done, total: lessons.length, quizzes };
    });
    setProgressMap(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData().catch(() => setProgressMap(null));
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const totalDone = progressMap
    ? Object.values(progressMap).reduce((s, v) => s + v.done, 0)
    : 0;
  const totalQuizzes = progressMap
    ? Object.values(progressMap).reduce((s, v) => s + v.quizzes, 0)
    : 0;

  const renderLanguageCard = ({ item, index }) => {
    const stats = progressMap?.[item.code];
    const pct = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
      <TouchableOpacity
        style={[styles.card, CARD_SHADOW, { marginBottom: index === LANGUAGES.length - 1 ? 30 : 16 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Lessons', { language: item })}
      >
        <View style={styles.cardTop}>
          <View style={[styles.emojiBadge, { backgroundColor: item.lightColor }]}>
            <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nativeName}>{item.nativeName}</Text>
            <Text style={styles.langDesc}>{item.description}</Text>
          </View>
          <Text style={[styles.pct, { color: item.color }]}>{pct}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${pct}%`, backgroundColor: item.color },
            ]}
          />
        </View>

        <Text style={styles.cardMeta}>
          {stats ? `${stats.done}/${stats.total} lessons completed` : 'Loading…'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            Namaste, {user?.name?.split(' ')[0]}{' '}
            <MaterialCommunityIcons name="hand-wave" size={22} color={COLORS.primary} />
          </Text>
          <Text style={styles.question}>What will you learn today?</Text>
        </View>
        <TouchableOpacity
          style={[styles.avatar, CARD_SHADOW]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statPill, CARD_SHADOW]}>
          <Text style={styles.statNumber}>{totalDone}</Text>
          <Text style={styles.statLabel}>lessons done</Text>
        </View>
        <View style={[styles.statPill, CARD_SHADOW]}>
          <Text style={styles.statNumber}>{totalQuizzes}</Text>
          <Text style={styles.statLabel}>quizzes played</Text>
        </View>
      </View>

      {progressMap === null ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your languages…</Text>
        </View>
      ) : (
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={renderLanguageCard}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  hello: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  question: { fontSize: 14, color: COLORS.subtext, marginTop: 2 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 19, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.subtext },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeName: { fontSize: 21, fontWeight: 'bold', color: COLORS.text },
  langDesc: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  pct: { fontSize: 18, fontWeight: 'bold' },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  cardMeta: { fontSize: 12, color: COLORS.subtext, marginTop: 8 },
});

export default HomeScreen;
