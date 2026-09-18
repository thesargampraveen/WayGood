import React, { useCallback, useEffect, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import api from '../api/client';
import { COLORS, CARD_SHADOW } from '../theme';

const LessonScreen = ({ navigation, route }) => {
  const { lessonId, language } = route.params;
  const [lesson, setLesson] = useState(null);
  const [idx, setIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const load = useCallback(async () => {
    const [lessonRes, progressRes] = await Promise.all([
      api.get(`/api/lessons/${lessonId}`),
      api.get('/api/progress'),
    ]);
    setLesson(lessonRes.data.lesson);
    setIsDone(
      (progressRes.data.progress?.completedLessons || []).some((l) => l._id === lessonId)
    );
  }, [lessonId]);

  useEffect(() => {
    load().catch(() =>
      Alert.alert('Oops', 'Could not load this lesson', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    );
  }, [load, navigation]);

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={language.color} />
      </SafeAreaView>
    );
  }

  const item = lesson.items[idx];
  const isLast = idx === lesson.items.length - 1;

  const markComplete = async () => {
    if (isDone) {
      setShowComplete(true); // already saved — just show the celebration again
      return;
    }
    setFinishing(true);
    try {
      await api.post(`/api/progress/lessons/${lessonId}/complete`);
      setIsDone(true);
      setShowComplete(true);
    } catch {
      Alert.alert('Oops', 'Could not save your progress');
    } finally {
      setFinishing(false);
    }
  };

  const tryAgain = () => {
    setIdx(0);
    setShowComplete(false);
  };

  /* ---------------- Completion screen ---------------- */
  if (showComplete && lesson) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <View style={[styles.resultCard, CARD_SHADOW]}>
          <MaterialCommunityIcons name="party-popper" size={64} color={language.color} />
          <Text style={[styles.resultTitle, { color: language.color }]}>Lesson Complete!</Text>
          <Text style={styles.resultMessage}>
            You learned all {lesson.items.length} words in {language.name}. Great job!
          </Text>
          <TouchableOpacity
            style={[styles.resultBtn, { backgroundColor: language.color }]}
            onPress={tryAgain}
          >
            <Text style={styles.resultBtnText}>
              <Ionicons name="refresh" size={15} color="#FFF" /> Try Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resultBtn, { backgroundColor: language.color }]}
            onPress={() => navigation.replace('Quiz', { lessonId, language })}
          >
            <Text style={styles.resultBtnText}>
              <MaterialCommunityIcons name="target" size={15} color="#FFF" /> Take the Quiz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resultBtnOutline} onPress={() => navigation.goBack()}>
            <Text style={[styles.resultBtnOutlineText, { color: language.color }]}>
              Back to Lessons
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.dotsWrap}>
          {lesson.items.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === idx && { backgroundColor: language.color, width: 20 }]}
            />
          ))}
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {idx + 1}/{lesson.items.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Flashcard */}
        <View style={[styles.card, CARD_SHADOW]}>
          <View style={[styles.categoryChip, { backgroundColor: language.lightColor }]}>
            <View style={styles.categoryChipInner}>
              <MaterialCommunityIcons name={language.icon} size={14} color={language.color} />
              <Text style={[styles.categoryText, { color: language.color }]}>{language.name}</Text>
            </View>
          </View>

          <Text style={styles.term}>{item.term}</Text>
          <View style={styles.translitPill}>
            <Text style={styles.translitText}>
              <Ionicons name="volume-high" size={15} color={COLORS.primaryDark} /> {item.translit}
            </Text>
          </View>

          <Text style={styles.meaning}>{item.meaning}</Text>

          {item.example !== '' && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>{item.example}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        {idx > 0 && (
          <TouchableOpacity style={styles.navBtn} onPress={() => setIdx(idx - 1)}>
            <Text style={styles.navBtnText}>
              <Ionicons name="chevron-back" size={15} color={COLORS.text} /> Prev
            </Text>
          </TouchableOpacity>
        )}
        {isLast ? (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: isDone ? COLORS.success : language.color, flex: 1 },
            ]}
            onPress={markComplete}
            disabled={finishing}
          >
            <Text style={styles.primaryBtnText}>
              {isDone ? 'Completed ' : finishing ? 'Saving…' : 'Complete Lesson '}
              {!finishing && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: language.color, flex: 1 }]}
            onPress={() => setIdx(idx + 1)}
          >
            <Text style={styles.primaryBtnText}>
              Next <Ionicons name="chevron-forward" size={16} color="#FFF" />
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dotsWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: 10,
    flexWrap: 'wrap',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  counter: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  counterText: { fontSize: 12, fontWeight: 'bold', color: COLORS.subtext },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 26,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  categoryChipInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  categoryText: { fontSize: 12, fontWeight: 'bold' },
  term: {
    fontSize: 58,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 68,
  },
  translitPill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  translitText: { color: COLORS.primaryDark, fontSize: 15, fontWeight: '600' },
  meaning: { fontSize: 20, color: COLORS.text, textAlign: 'center', marginTop: 20 },
  exampleBox: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    alignSelf: 'stretch',
  },
  exampleText: { fontSize: 14, color: COLORS.subtext, fontStyle: 'italic', textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 6,
  },
  navBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 22,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navBtnText: { color: COLORS.text, fontWeight: 'bold', fontSize: 15 },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: { fontSize: 26, fontWeight: 'bold', marginTop: 10 },
  resultMessage: { fontSize: 15, color: COLORS.subtext, marginTop: 6, textAlign: 'center' },
  resultBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 14,
  },
  resultBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  resultBtnOutline: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  resultBtnOutlineText: { fontWeight: 'bold', fontSize: 15 },
});

export default LessonScreen;
