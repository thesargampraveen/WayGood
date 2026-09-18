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
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import api from '../api/client';
import { COLORS, CARD_SHADOW } from '../theme';

const QuizScreen = ({ navigation, route }) => {
  const { lessonId, language } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
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
    if (option === question.answer) {
      setScore(score + 1);
    } else {
      setWrong([
        ...wrong,
        { term: question.term, translit: question.translit, answer: question.answer, picked: option },
      ]);
    }
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
    setWrong([]);
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
    const resultIcon = pct >= 80 ? 'trophy' : pct >= 50 ? 'trending-up' : 'book';
    const message =
      pct >= 80 ? 'Amazing work!' : pct >= 50 ? 'Good try, keep going!' : 'Practice makes perfect!';
    const tip =
      pct >= 80
        ? 'Almost perfect! Just revisit the words you missed and this lesson is yours.'
        : pct >= 50
          ? 'Good effort! Read the mistakes below once more, then try the quiz again.'
          : 'No worries! Replay the lesson flashcards first, then come back to this quiz.';

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={[styles.resultCard, CARD_SHADOW]}>
            <Ionicons name={resultIcon} size={64} color={language.color} />
            <Text style={[styles.resultScore, { color: language.color }]}>
              {score}/{total}
            </Text>
            <Text style={styles.resultMessage}>{message}</Text>

            {/* How to improve */}
            <View style={[styles.tipBox, { backgroundColor: language.lightColor }]}>
              <Text style={[styles.tipTitle, { color: language.color }]}>
                <Ionicons name="bulb" size={13} color={language.color} /> How to improve
              </Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>

            {/* What went wrong */}
            {wrong.length > 0 && (
              <View style={styles.mistakesWrap}>
                <Text style={styles.mistakesTitle}>
                  <Ionicons name="close-circle" size={14} color={COLORS.danger} /> What went wrong (
                  {wrong.length})
                </Text>
                {wrong.map((w, i) => (
                  <View key={i} style={styles.mistakeItem}>
                    <Text style={styles.mistakeTerm}>
                      {w.term}{' '}
                      <Text style={styles.mistakeTranslit}>({w.translit})</Text>
                    </Text>
                    <Text style={styles.mistakeCorrect}>
                      <Ionicons name="checkmark" size={13} color={COLORS.success} /> Correct answer:{' '}
                      {w.answer}
                    </Text>
                    <Text style={styles.mistakePicked}>
                      <Ionicons name="close" size={13} color={COLORS.danger} /> You picked: {w.picked}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.resultBtn, { backgroundColor: language.color }]}
              onPress={retry}
            >
              <Text style={styles.resultBtnText}>
                <Ionicons name="refresh" size={15} color="#FFF" /> Try Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultBtn, { backgroundColor: language.color }]}
              onPress={() => navigation.replace('Lesson', { lessonId, language })}
            >
              <Text style={styles.resultBtnText}>
                <Ionicons name="book" size={15} color="#FFF" /> Review Lesson
              </Text>
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
        </ScrollView>
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
          <Ionicons name="close" size={22} color={COLORS.text} />
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
              {selected !== null && isAnswer && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              )}
              {isSelected && !isAnswer && (
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              )}
            </TouchableOpacity>
          );
        })}

        {selected !== null && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: language.color }]}
            onPress={next}
          >
            <Text style={styles.nextBtnText}>
              {idx + 1 === total ? (
                <>
                  See Results <MaterialCommunityIcons name="party-popper" size={16} color="#FFF" />
                </>
              ) : (
                <>
                  Next Question <Ionicons name="chevron-forward" size={16} color="#FFF" />
                </>
              )}
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
  resultWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  tipBox: { borderRadius: 16, padding: 14, marginTop: 18, alignSelf: 'stretch' },
  tipTitle: { fontSize: 13, fontWeight: 'bold' },
  tipText: { fontSize: 13, color: COLORS.text, marginTop: 4 },
  mistakesWrap: { alignSelf: 'stretch', marginTop: 18 },
  mistakesTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  mistakeItem: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  mistakeTerm: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  mistakeTranslit: { fontSize: 12, fontWeight: 'normal', color: COLORS.subtext },
  mistakeCorrect: { fontSize: 13, color: COLORS.success, fontWeight: '600', marginTop: 4 },
  mistakePicked: { fontSize: 13, color: COLORS.danger, fontWeight: '600', marginTop: 2 },
});

export default QuizScreen;
