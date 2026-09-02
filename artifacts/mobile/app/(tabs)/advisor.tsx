import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useProfile } from '@/context/ProfileContext';
import { AuthGate } from '@/components/AuthGate';

interface Message {
  id: string;
  role: 'user' | 'advisor';
  text: string;
}

const QUICK_QUESTIONS = [
  'What scholarships can I apply for?',
  'How do I improve my IELTS?',
  'Can I get Chevening with 3.0 GPA?',
  'What documents do I need for DAAD?',
  'How to write a strong SOP?',
];

function getAdvisorResponse(text: string, cgpa4: number, ielts: number, level: string): string {
  const q = text.toLowerCase();

  if (q.includes('chevening')) {
    if (cgpa4 >= 2.75 && ielts >= 6.5) {
      return `Based on your profile (GPA ${cgpa4.toFixed(1)}, IELTS ${ielts}), you meet Chevening's minimum requirements. The scholarship is highly competitive — focus on demonstrating leadership, networking ambition, and a clear plan to return and contribute to your home country. Apply by November 5. Tip: Your personal statement is the deciding factor.`;
    }
    return `Chevening requires a minimum 2:1 degree (≈2.75 GPA) and IELTS 6.5. ${cgpa4 < 2.75 ? `Your GPA of ${cgpa4.toFixed(1)} is below the threshold — consider boosting it or applying to similar scholarships. ` : ''}${ielts < 6.5 ? `Your IELTS of ${ielts} needs to reach 6.5. Aim for 7.0 for a stronger application. ` : ''}Focus on strengthening your leadership narrative.`;
  }

  if (q.includes('daad')) {
    return `DAAD scholarships are Germany's flagship awards for graduate students. Requirements: CGPA ≥ 3.0 (4.0 scale), IELTS ≥ 6.0 or equivalent German language. Deadline: typically October 15. ${cgpa4 >= 3.0 ? 'Your GPA qualifies you. ' : 'Consider improving your GPA or applying for a different DAAD category. '}DAAD values research experience and a clear academic motivation letter. Germany has no tuition at most public universities, so DAAD covers living costs (~€934/month).`;
  }

  if (q.includes('erasmus')) {
    return `Erasmus Mundus is a joint master/PhD programme funded by the EU. You study in 2-3 European countries and receive €1,400/month + travel costs. Requirements: CGPA ≥ 3.0, IELTS ≥ 6.5. Apply directly through your chosen Erasmus Mundus programme (deadlines vary, mostly January). Strong research background helps significantly. Look for programmes aligned with your field of study.`;
  }

  if (q.includes('ielts') || q.includes('english') || q.includes('language')) {
    if (ielts >= 7.0) {
      return `Your IELTS of ${ielts} is strong and qualifies you for most major scholarships. For elite programmes like Gates Cambridge or Rhodes, a 7.5+ is preferred. Practice academic writing (Task 2) to push your score higher. Some scholarships (e.g., Swedish Institute) accept TOEFL iBT 90+ as an alternative.`;
    }
    return `To improve your IELTS: (1) Daily academic reading — BBC, The Guardian, The Economist. (2) Practice writing Task 2 essays daily with timed conditions. (3) For Speaking, record yourself and identify fillers. Most scholarships need 6.5; elite ones need 7.0–7.5. With consistent study, 3–6 months is enough to improve by 1 band. British Council and IDP offer official practice tests.`;
  }

  if (q.includes('sop') || q.includes('statement of purpose') || q.includes('personal statement')) {
    return `A strong SOP has 5 key elements: (1) Opening hook — a specific moment that drew you to your field. (2) Academic background — relevant courses and research. (3) Professional experience — what you've done and learned. (4) Why this programme — specific professors, labs, or courses. (5) Future goals — how this degree advances your mission. Avoid generic openings like "Since childhood, I have been passionate about..." Keep it to 1–2 pages. Have it reviewed by someone in your field.`;
  }

  if (q.includes('gpa') || q.includes('cgpa') || q.includes('grade')) {
    const scoreText = cgpa4 > 0 ? `Your current GPA is ${cgpa4.toFixed(2)} on a 4.0 scale. ` : '';
    return `${scoreText}GPA requirements for major scholarships: Chevening (2.75+), DAAD/Erasmus (3.0+), Fulbright (3.2+), Gates Cambridge/Rhodes (3.7+). If your GPA is below requirements, consider: (1) Taking additional courses to boost it. (2) Applying to scholarships with lower thresholds (e.g., KGSP requires only 2.64). (3) Compensating with strong research, IELTS, or leadership experience. Many committees weigh your trend — a rising GPA reads better than a flat low one.`;
  }

  if (q.includes('scholarship') && (q.includes('which') || q.includes('what') || q.includes('qualify') || q.includes('apply'))) {
    const hasProfile = cgpa4 > 0;
    if (hasProfile) {
      let recs = '';
      if (cgpa4 >= 3.7 && ielts >= 7.0) recs = 'Gates Cambridge, Rhodes, Fulbright, Chevening';
      else if (cgpa4 >= 3.0 && ielts >= 6.5) recs = 'Chevening, DAAD, Erasmus Mundus, Commonwealth, Swedish Institute';
      else if (cgpa4 >= 2.75) recs = 'Chevening, Australia Awards, KGSP (Korea), MEXT (Japan), Orange Tulip';
      else recs = 'KGSP (Korea), MEXT (Japan), Orange Tulip — these have lower GPA thresholds';
      return `Based on your profile (GPA ${cgpa4.toFixed(2)}, IELTS ${ielts}), your strongest matches include: ${recs}. Go to the Match tab to see all ${15} scholarships ranked by probability. Update your profile in the Profile tab to get more precise recommendations.`;
    }
    return 'Set up your profile first (Profile tab) with your GPA, IELTS, and degree level. Then visit the Match tab to see all scholarships ranked by your probability of success. The AI scores each scholarship from 0–100% based on how your profile meets its requirements.';
  }

  if (q.includes('cv') || q.includes('resume')) {
    return `For scholarship CVs: (1) Start with Education — include GPA, thesis title if any. (2) Research & Publications — even conference presentations count. (3) Awards & Honours. (4) Leadership & Extracurriculars. (5) Work Experience. (6) Skills & Languages. Keep it to 2 pages max. For academic CVs (PhD applications), 3–4 pages is acceptable. Use clean formatting — no photos unless required. Quantify achievements: "Led a team of 12" is stronger than "Led a team."`;
  }

  if (q.includes('document') || q.includes('require')) {
    return `Most scholarships require: (1) Transcripts — official, sealed, translated if not in English. (2) Recommendation Letters — typically 2–3 from academic/professional references. (3) Statement of Purpose / Motivation Letter. (4) CV/Resume. (5) Language test scores (IELTS/TOEFL). (6) Passport copy. (7) Research proposal (for PhD). (8) Evidence of leadership/community service. Start collecting these 3 months before deadlines — official transcripts can take weeks.`;
  }

  if (q.includes('research') || q.includes('publication') || q.includes('paper')) {
    return `Research experience dramatically improves your scholarship odds, especially for DAAD, Erasmus, Gates Cambridge, and Vanier. Even if you don't have publications, you can: (1) Assist a professor with their research. (2) Present at a student conference. (3) Write a working paper or preprint. (4) Complete an online research methodology course. For PhD scholarships, aim for at least one published or accepted paper. Google Scholar profile, ResearchGate, and ORCID are good to set up even as a student.`;
  }

  if (q.includes('deadline') || q.includes('when')) {
    return `Key scholarship deadlines to bookmark:\n• Chevening: November 5\n• Gates Cambridge: October 12\n• Rhodes: August 1\n• DAAD: October 15\n• Erasmus Mundus: January 10\n• Fulbright: February 28\n• Commonwealth: December 12\n• KGSP (Korea): March 5\n• Australian Awards: April 30\n\nMost deadlines are for the academic year starting the following September. Use the Tracker tab to manage your deadlines.`;
  }

  return `I'm your ScholarshipAI advisor. I can help you with:\n\n• Which scholarships match your profile\n• How to improve your GPA, IELTS, or research score\n• How to write your SOP, CV, or motivation letter\n• Understanding scholarship requirements\n• Managing your application timeline\n\nTry asking about a specific scholarship (e.g., "Can I get Chevening?") or a specific topic (e.g., "How to write an SOP").`;
}

export default function AdvisorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'advisor',
      text: `Hello${profile.name ? `, ${profile.name.split(' ')[0]}` : ''}! I\'m your ScholarshipAI advisor. Ask me anything about scholarships, eligibility, documents, or how to improve your application.`,
    },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
    };
    const advisorMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'advisor',
      text: getAdvisorResponse(text.trim(), profile.cgpa4, profile.ielts, profile.degreeLevel),
    };
    setMessages((prev) => [advisorMsg, userMsg, ...prev]);
    setInput('');
  }, [profile.cgpa4, profile.ielts, profile.degreeLevel]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAdvisor]}>
        {!isUser && (
          <View style={[styles.avatarDot, { backgroundColor: colors.primary }]}>
            <Feather name="cpu" size={12} color="#FFFFFF" />
          </View>
        )}
        <View style={[
          styles.bubbleInner,
          isUser
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        ]}>
          <Text style={[
            styles.bubbleText,
            {
              color: isUser ? colors.primaryForeground : colors.foreground,
              fontFamily: 'Inter_400Regular',
            },
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AuthGate
      feature="Advisor"
      icon="message-circle"
      description="Chat with your AI scholarship advisor — get tailored guidance on eligibility, documents, SOPs, and deadlines."
    >
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
          <Feather name="cpu" size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Scholarship Advisor
          </Text>
          <Text style={[styles.headerSub, { color: colors.success, fontFamily: 'Inter_400Regular' }]}>
            Online · Ready to help
          </Text>
        </View>
      </View>

      {/* Quick questions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.quickRow, { borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {QUICK_QUESTIONS.map((q) => (
          <Pressable
            key={q}
            onPress={() => sendMessage(q)}
            style={({ pressed }) => [styles.quickChip, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.quickText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: 12 },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8),
        },
      ]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about scholarships..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={() => sendMessage(input)}
          style={({ pressed }) => [styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }]}
          disabled={!input.trim()}
        >
          <Feather name="send" size={18} color={input.trim() ? '#FFFFFF' : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16 },
  headerSub: { fontSize: 11, marginTop: 1 },
  quickRow: { maxHeight: 50, borderBottomWidth: 1, paddingVertical: 8 },
  quickChip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'center' },
  quickText: { fontSize: 12 },
  messageList: { paddingHorizontal: 16, paddingTop: 12 },
  bubble: { marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleAdvisor: { justifyContent: 'flex-start' },
  avatarDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 },
  bubbleInner: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
