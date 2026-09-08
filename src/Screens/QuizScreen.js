import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../api/client';
import { COLORS, CARD_SHADOW } from '../theme';

const QuizScreen = ({ navigation, route }) => {
  const { lessonId, language } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/api/lessons/${lessonId}/quiz`)
      .then((res) => setQuiz(res.data.quiz))
      .catch(() => setQuiz(null));
  }, [lessonId]);

  // Save the result once the quiz ends
  useEffect(() => {
    if (finished && !saving) {
      setSaving(true);
      api
        .post('/api/progress/quiz', { lessonId, score, total: quiz.questions.length })
        .catch(() => {});
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (quiz === null) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={language.color} />
        <Text style={styles.loadingText}>Preparing your quiz…</Text>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[idx];
  const total = quiz.questions.length;

  const pick = (option) => {
    if (selected !== null) return; // already answered
    setSelected(option);
    if (option === question.answer) setScore(score + 1);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const retry = () => {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setSaving(false);
    api
      .get(`/api/lessons/${lessonId}/quiz`)
      .then((res) => setQuiz(res.data.quiz))
      .catch(() => {});
  };

  /* ---------------- Result screen ---------------- */
  if (finished) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚';
    const message =
      pct >= 80 ? 'Amazing work!' : pct >= 50 ? 'Good try, keep going!' : 'Practice makes perfect!';

    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <View style={[styles.resultCard, CARD_SHADOW]}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={[styles.resultScore, { color: language.color }]}>
            {score}/{total}
          </Text>
          <Text style={styles.resultMessage}>{message}</Text>
          <TouchableOpacity style={[styles.resultBtn, { backgroundColor: language.color }]} onPress={retry}>
            <Text style={styles.resultBtnText}>🔄 Retry Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resultBtnOutline}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.resultBtnOutlineText, { color: language.color }]}>
              Back to Lessons
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- Question screen ---------------- */
  const pct = Math.round((idx / total) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.trackWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${pct}%`, backgroundColor: language.color }]}
            />
          </View>
        </View>
        <Text style={styles.counterText}>
          {idx + 1}/{total}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionLabel}>What does this mean?</Text>

        <View style={[styles.questionCard, CARD_SHADOW]}>
          <Text style={styles.term}>{question.term}</Text>
          <Text style={styles.translit}>{question.translit}</Text>
        </View>

        {question.options.map((option, i) => {
          const isAnswer = option === question.answer;
          const isSelected = option === selected;

          let bg = COLORS.card;
          let border = COLORS.border;
          if (selected !== null && isAnswer) {
            bg = COLORS.successLight;
            border = COLORS.success;
          } else if (isSelected && !isAnswer) {
            bg = COLORS.dangerLight;
            border = COLORS.danger;
          }

          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => pick(option)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionLabel}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{option}</Text>
              {selected !== null && isAnswer && <Text style={styles.optionMark}>✓</Text>}
              {isSelected && !isAnswer && <Text style={styles.optionMark}>✕</Text>}
            </TouchableOpacity>
          );
        })}

        {selected !== null && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: language.color }]}
            onPress={next}
          >
            <Text style={styles.nextBtnText}>
              {idx + 1 === total ? 'See Results 🎉' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.subtext },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  trackWrap: { flex: 1 },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  counterText: { fontSize: 13, fontWeight: 'bold', color: COLORS.subtext },
  content: { padding: 20 },
  questionLabel: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  term: { fontSize: 36, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  translit: { fontSize: 14, color: COLORS.subtext, marginTop: 8 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    gap: 12,
  },
  optionLabel: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.subtext,
    overflow: 'hidden',
  },
  optionText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  optionMark: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  nextBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  nextBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  resultEmoji: { fontSize: 64 },
  resultScore: { fontSize: 42, fontWeight: 'bold', marginTop: 10 },
  resultMessage: { fontSize: 15, color: COLORS.subtext, marginTop: 6 },
  resultBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 24,
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

export default QuizScreen;
