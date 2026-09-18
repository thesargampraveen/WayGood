import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import api from '../api/client';
import { COLORS, CARD_SHADOW } from '../theme';

const CATEGORY_META = {
  alphabet: { label: 'Letters', icon: 'text' },
  words: { label: 'Words', icon: 'chatbubbles' },
  phrases: { label: 'Phrases', icon: 'document-text' },
};

const LessonListScreen = ({ navigation, route }) => {
  const language = route.params.language;
  const [lessons, setLessons] = useState(null);
  const [completed, setCompleted] = useState(() => new Set());

  const loadData = useCallback(async () => {
    const [lessonsRes, progressRes] = await Promise.all([
      api.get(`/api/lessons/language/${language.code}`),
      api.get('/api/progress'),
    ]);
    setLessons(lessonsRes.data.lessons);
    setCompleted(
      new Set((progressRes.data.progress?.completedLessons || []).map((l) => l._id))
    );
  }, [language.code]);

  useFocusEffect(
    useCallback(() => {
      setLessons(null);
      loadData().catch(() => setLessons([]));
    }, [loadData])
  );

  const doneCount = lessons ? lessons.filter((l) => completed.has(l._id)).length : 0;

  const renderLesson = ({ item, index }) => {
    const isDone = completed.has(item._id);
    const cat = CATEGORY_META[item.category] || CATEGORY_META.words;

    return (
      <View style={[styles.lessonRow, CARD_SHADOW]}>
        <TouchableOpacity
          style={styles.lessonMain}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Lesson', { lessonId: item._id, language })}
        >
          <View
            style={[
              styles.indexBadge,
              { backgroundColor: isDone ? COLORS.successLight : language.lightColor },
            ]}
          >
            {isDone ? (
              <Ionicons name="checkmark" size={22} color={COLORS.success} />
            ) : (
              <Text style={[styles.indexText, { color: language.color }]}>{index + 1}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name={cat.icon} size={12} color={COLORS.subtext} />
              <Text style={styles.lessonMeta}>
                {cat.label} • {item.itemCount} items
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quizBtn, { backgroundColor: language.lightColor }]}
          onPress={() => navigation.navigate('Quiz', { lessonId: item._id, language })}
        >
          <View style={styles.quizBtnInner}>
            <MaterialCommunityIcons name="target" size={14} color={COLORS.text} />
            <Text style={styles.quizBtnText}>Quiz</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Colored header */}
      <View style={[styles.header, { backgroundColor: language.lightColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name={language.icon} size={34} color={language.color} />
        <Text style={[styles.headerTitle, { color: language.color }]}>{language.nativeName}</Text>
        <Text style={styles.headerSub}>
          {lessons ? `${doneCount} of ${lessons.length} lessons completed` : ' '}
        </Text>
      </View>

      {lessons === null ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={language.color} />
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item._id}
          renderItem={renderLesson}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: { position: 'absolute', left: 16, top: 14, padding: 6 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  headerSub: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', marginTop: 4 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lessonRow: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  lessonMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  indexBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: { fontSize: 18, fontWeight: 'bold' },
  lessonTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  lessonMeta: { fontSize: 12, color: COLORS.subtext },
  quizBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quizBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quizBtnText: { fontSize: 13, fontWeight: 'bold', color: COLORS.text },
});

export default LessonListScreen;
