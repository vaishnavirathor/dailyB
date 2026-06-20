import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/button';
import { MenuButton } from '@/components/menu-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { CheckIcon, ChevronRightIcon, GoogleIcon, MailIcon, UserIcon, PenIcon, SproutIcon } from '@/components/icons';
import { t, type StringKey } from '@/i18n';
import { useAuth } from '@/stores/auth';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';
import { trackButtonTap } from '@/services/app-tracking';

WebBrowser.maybeCompleteAuthSession();

type Step =
  | 'welcome'
  | 'email'
  | 'sign-in-password'
  | 'sign-up-details'
  | 'email-verify'
  | 'profile';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'undisclosed', label: 'Prefer not to say' },
] as const;

function getPrevStep(step: Step): Step | null {
  switch (step) {
    case 'email': return 'welcome';
    case 'sign-in-password': return 'email';
    case 'sign-up-details': return 'email';
    case 'email-verify': return 'sign-up-details';
    default: return null;
  }
}

function getHeaderTitle(step: Step, isAuthenticated: boolean): string {
  if (isAuthenticated && step === 'profile') return 'Account';
  switch (step) {
    case 'welcome': return 'Account';
    case 'email': return 'Your Email';
    case 'sign-in-password': return 'Password';
    case 'sign-up-details': return 'Your Details';
    case 'email-verify': return 'Verify Email';
    default: return 'Account';
  }
}

function haptic() {
  if (process.env.EXPO_OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function AuthSheet() {
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const auth = useAuth();

  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setStep('profile');
      auth.fetchProfile();
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (auth.isAuthenticated && step === 'profile' && auth.profile) {
      setEditName(auth.profile.display_name);
      setEditGender(auth.profile.gender);
    }
  }, [step, auth.isAuthenticated, auth.profile]);

  const go = (s: Step) => {
    haptic();
    setError(null);
    setStep(s);
  };

  const goBack = () => {
    const prev = getPrevStep(step);
    if (prev) go(prev);
  };

  const handleGoogleSignIn = async () => {
    trackButtonTap('google_sign_in', 'auth');
    setError(null);
    setLoading(true);
    try {
      await auth.signInWithGoogle();
      await auth.fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailContinue = () => {
    if (!email.trim()) return;
    trackButtonTap('email_continue', 'auth');
    setError(null);
    if (mode === 'sign-in') {
      go('sign-in-password');
    } else {
      go('sign-up-details');
    }
  };

  const handleSignIn = async () => {
    trackButtonTap('sign_in_submit', 'auth');
    setError(null);
    setLoading(true);
    try {
      await auth.signIn(email, password);
      await auth.fetchProfile();
      const verified = await auth.checkEmailVerified();
      if (!verified) {
        setVerifySent(true);
        go('email-verify');
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login')) {
        setError('Wrong email or password. Try again.');
      } else {
        setError(err.message || 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    trackButtonTap('sign_up_submit', 'auth');
    setError(null);
    setLoading(true);
    try {
      const anonymousId = auth.userId;
      let result: { verified: boolean };
      if (anonymousId && !auth.isAuthenticated) {
        await auth.mergeAndSignUp(anonymousId, email, password);
        result = { verified: false };
      } else {
        result = await auth.signUp(email, password, displayName, gender ?? undefined);
      }
      await auth.fetchProfile();
      if (!result.verified) {
        setVerifySent(true);
        go('email-verify');
      }
    } catch (err: any) {
      if (err.message?.includes('already registered') || err.message?.includes('EMAIL_EXISTS')) {
        setError('An account with this email already exists.');
      } else if (err.message?.includes('password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    trackButtonTap('check_verification', 'auth');
    setError(null);
    setLoading(true);
    try {
      const verified = await auth.checkEmailVerified();
      if (verified) {
        go('profile');
      } else {
        setError('Email not yet verified. Check your inbox and tap the link, then try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    trackButtonTap('resend_verification', 'auth');
    setError(null);
    setLoading(true);
    try {
      await auth.resendVerification();
      setVerifySent(true);
      setError('Verification email sent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    trackButtonTap('save_profile', 'auth');
    setError(null);
    setLoading(true);
    try {
      await auth.updateProfile({ display_name: editName, gender: editGender ?? undefined });
      setEditing(false);
      setError('Profile saved!');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    trackButtonTap('sign_out', 'auth');
    await auth.signOut();
    setStep('welcome');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setGender(null);
    setVerifySent(false);
    setEditing(false);
  };

  const goHome = () => {
    router.back();
  };

  const stepBack = getPrevStep(step);

  return (
    <Screen bottom={40}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.stackSm,
        }}
      >
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {stepBack ? (
            <BackButton onPress={goBack} />
          ) : (
            <MenuButton />
          )}
        </View>
        <ThemedText variant="headlineMd" color="primary">
          {getHeaderTitle(step, auth.isAuthenticated)}
        </ThemedText>
        <View style={{ width: 40 }}>
          {step === 'profile' && auth.isAuthenticated && !editing ? (
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              onPress={() => {
                haptic();
                setEditing(true);
                if (auth.profile) {
                  setEditName(auth.profile.display_name);
                  setEditGender(auth.profile.gender);
                }
              }}
            >
              <PenIcon size={20} color={colors.secondary} />
            </Pressable>
          ) : <View style={{ width: 20 }} />}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.gutter,
          paddingTop: spacing.stackMd,
          gap: spacing.gutter,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'welcome' && !auth.isAuthenticated && (
          <WelcomeStep
            lang={lang}
            loading={loading}
            error={error}
            onGoogle={handleGoogleSignIn}
            onEmail={() => { trackButtonTap('email_option', 'auth'); go('email'); }}
            onSkip={() => { trackButtonTap('skip_auth', 'auth'); auth.signInAnonymously(); }}
            onToggleMode={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError(null);
            }}
            mode={mode}
          />
        )}

        {step === 'email' && (
          <EmailStep
            lang={lang}
            email={email}
            setEmail={setEmail}
            onContinue={handleEmailContinue}
            mode={mode}
            setMode={setMode}
          />
        )}

        {step === 'sign-in-password' && (
          <PasswordStep
            lang={lang}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            onSubmit={handleSignIn}
            label={t('signIn', lang)}
          />
        )}

        {step === 'sign-up-details' && (
          <SignUpDetailsStep
            lang={lang}
            displayName={displayName}
            setDisplayName={setDisplayName}
            gender={gender}
            setGender={setGender}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            onSubmit={handleSignUp}
          />
        )}

        {step === 'email-verify' && (
          <VerifyStep
            lang={lang}
            email={email}
            error={error}
            loading={loading}
            verifySent={verifySent}
            onCheck={handleCheckVerification}
            onResend={handleResendVerification}
          />
        )}

        {step === 'profile' && auth.isAuthenticated && (
          <ProfileStep
            lang={lang}
            error={error}
            loading={loading}
            editing={editing}
            editName={editName}
            setEditName={setEditName}
            editGender={editGender}
            setEditGender={setEditGender}
            onSave={handleSaveProfile}
            onSignOut={handleSignOut}
            onGoHome={goHome}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function WelcomeStep({
  lang, loading, error, onGoogle, onEmail, onSkip, onToggleMode, mode,
}: {
  lang: string; loading: boolean; error: string | null;
  onGoogle: () => void; onEmail: () => void; onSkip: () => void;
  onToggleMode: () => void; mode: 'sign-in' | 'sign-up';
}) {
  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <View
          style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: tints.promise,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: spacing.stackSm,
          }}
        >
          <UserIcon size={28} color={colors.gold} />
        </View>
        <ThemedText variant="headlineSm" color="primary" align="center">
          {mode === 'sign-in' ? t('signIn', lang) : t('signUp', lang)}
        </ThemedText>
      </View>

      <GoogleButton loading={loading} onPress={onGoogle} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
        <ThemedText variant="bodySm" color="onSurfaceVariant">or</ThemedText>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
      </View>

      <Button
        label={t('continueWithEmail', lang)}
        onPress={onEmail}
        variant="secondary"
      />

      {error ? <ErrorCard error={error} /> : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => { haptic(); onToggleMode(); }}
        style={{ alignItems: 'center', paddingVertical: spacing.stackSm }}
      >
        <ThemedText variant="bodySm" color="secondary">
          {mode === 'sign-in' ? t('noAccount', lang) : t('hasAccount', lang)}
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => { haptic(); onSkip(); }}
        style={{ alignItems: 'center', paddingVertical: spacing.stackSm }}
      >
        <ThemedText variant="bodySm" color="onSurfaceVariant">
          {t('skipAuth', lang)}
        </ThemedText>
      </Pressable>

      <ThemedText variant="bodySm" color="onSurfaceVariant" align="center" style={{ paddingTop: spacing.stackSm }}>
        {t('authOptional', lang)}
      </ThemedText>
    </View>
  );
}

function GoogleButton({ loading, onPress }: { loading: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={() => { haptic(); onPress(); }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.gutter,
        paddingVertical: spacing.unit * 2,
        borderRadius: radius.full,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dadce0',
        opacity: loading ? 0.5 : 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.navyMuted} />
      ) : (
        <>
          <GoogleIcon size={20} />
          <ThemedText variant="labelMd" color="primary" style={{ fontWeight: '500', color: '#3c4043' }}>
            Continue with Google
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

function EmailStep({
  lang, email, setEmail, onContinue, mode, setMode,
}: {
  lang: string; email: string; setEmail: (v: string) => void;
  onContinue: () => void; mode: string; setMode: (m: 'sign-in' | 'sign-up') => void;
}) {
  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg }}>
      <ThemedText variant="headlineSm" color="primary">
        {t('yourEmail', lang)}
      </ThemedText>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.surfaceContainerHigh,
        borderRadius: radius.base, paddingHorizontal: spacing.gutter,
      }}>
        <MailIcon size={18} color={colors.navyMuted} />
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor={colors.onSurfaceVariant}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoFocus
          style={{
            flex: 1, paddingVertical: 14, paddingLeft: spacing.stackSm,
            fontSize: 16, color: colors.primary,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
        {(['sign-in', 'sign-up'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="button"
            onPress={() => { haptic(); setMode(m); }}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: radius.base,
              backgroundColor: mode === m ? colors.sage : colors.surfaceContainer,
              alignItems: 'center',
            }}
          >
            <ThemedText
              variant="labelMd"
              color={mode === m ? 'onPrimary' : 'onSurfaceVariant'}
              style={{ fontWeight: '600' }}
            >
              {m === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Button
        label={t('continue', lang)}
        onPress={onContinue}
        disabled={!email.trim()}
        variant={email.trim() ? 'primary' : 'secondary'}
      />
    </View>
  );
}

function PasswordStep({
  lang, password, setPassword, loading, error, onSubmit, label,
}: {
  lang: string; password: string; setPassword: (v: string) => void;
  loading: boolean; error: string | null; onSubmit: () => void; label: string;
}) {
  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg }}>
      <ThemedText variant="headlineSm" color="primary">
        {t('yourPassword', lang)}
      </ThemedText>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.surfaceContainerHigh,
        borderRadius: radius.base, paddingHorizontal: spacing.gutter,
      }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.navyMuted, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.navyMuted }} />
        </View>
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.onSurfaceVariant}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoFocus
          style={{
            flex: 1, paddingVertical: 14, paddingLeft: spacing.stackSm,
            fontSize: 16, color: colors.primary,
          }}
        />
      </View>

      {error ? <ErrorCard error={error} /> : null}

      <Button
        label={loading ? '' : label}
        onPress={onSubmit}
        disabled={loading || !password}
        variant={(loading || !password) ? 'secondary' : 'primary'}
      />
    </View>
  );
}

function SignUpDetailsStep({
  lang, displayName, setDisplayName, gender, setGender,
  password, setPassword, loading, error, onSubmit,
}: {
  lang: string;
  displayName: string; setDisplayName: (v: string) => void;
  gender: string | null; setGender: (v: string | null) => void;
  password: string; setPassword: (v: string) => void;
  loading: boolean; error: string | null; onSubmit: () => void;
}) {
  const ready = displayName.trim().length > 0 && password.length >= 6;
  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg }}>
      <ThemedText variant="headlineSm" color="primary">
        {t('yourDetails', lang)}
      </ThemedText>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.surfaceContainerHigh,
        borderRadius: radius.base, paddingHorizontal: spacing.gutter,
      }}>
        <UserIcon size={18} color={colors.navyMuted} />
        <TextInput
          placeholder={t('yourName', lang)}
          placeholderTextColor={colors.onSurfaceVariant}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoFocus
          style={{
            flex: 1, paddingVertical: 14, paddingLeft: spacing.stackSm,
            fontSize: 16, color: colors.primary,
          }}
        />
      </View>

      <ThemedText variant="labelSm" color="onSurfaceVariant" style={{ paddingTop: spacing.unit }}>
        {t('gender', lang)}
      </ThemedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm }}>
        {GENDERS.map((g) => (
          <Pressable
            key={g.value}
            accessibilityRole="button"
            onPress={() => { haptic(); setGender(g.value === gender ? null : g.value); }}
            style={{
              paddingVertical: spacing.unit, paddingHorizontal: spacing.gutter,
              borderRadius: radius.full,
              backgroundColor: gender === g.value ? colors.sage : colors.surfaceContainer,
            }}
          >
            <ThemedText
              variant="labelSm"
              color={gender === g.value ? 'onPrimary' : 'primary'}
              style={{ fontWeight: gender === g.value ? '600' : '400' }}
            >
              {g.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.surfaceContainerHigh,
        borderRadius: radius.base, paddingHorizontal: spacing.gutter,
        marginTop: spacing.stackSm,
      }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.navyMuted, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.navyMuted }} />
        </View>
        <TextInput
          placeholder={t('passwordPlaceholder', lang)}
          placeholderTextColor={colors.onSurfaceVariant}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            flex: 1, paddingVertical: 14, paddingLeft: spacing.stackSm,
            fontSize: 16, color: colors.primary,
          }}
        />
      </View>
      <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ marginTop: -spacing.unit }}>
        {t('passwordHint', lang)}
      </ThemedText>

      {error ? <ErrorCard error={error} /> : null}

      <Button
        label={loading ? '' : t('createAccount', lang)}
        onPress={onSubmit}
        disabled={loading || !ready}
      />
    </View>
  );
}

function VerifyStep({
  lang, email, error, loading, verifySent, onCheck, onResend,
}: {
  lang: string; email: string; error: string | null;
  loading: boolean; verifySent: boolean;
  onCheck: () => void; onResend: () => void;
}) {
  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg, alignItems: 'center' }}>
      <View
        style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: tints.promise,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: spacing.stackSm,
        }}
      >
        <MailIcon size={24} color={colors.gold} />
      </View>

      <ThemedText variant="headlineSm" color="primary" align="center">
        {t('checkEmail', lang)}
      </ThemedText>

      <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center" style={{ paddingHorizontal: spacing.gutter }}>
        {t('verificationSent', lang)} {email}
      </ThemedText>

      {error ? <ErrorCard error={error} /> : null}

      <Button
        label={t('iVerified', lang)}
        onPress={onCheck}
        disabled={loading}
        style={{ width: '100%' }}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => { haptic(); onResend(); }}
        disabled={loading}
        style={{ paddingVertical: spacing.stackSm }}
      >
        {verifySent ? (
          <ThemedText variant="bodySm" color="onSurfaceVariant">Email sent! Check your inbox.</ThemedText>
        ) : (
          <ThemedText variant="bodySm" color="secondary">{t('resendEmail', lang)}</ThemedText>
        )}
      </Pressable>
    </View>
  );
}

function ProfileStep({
  lang, error, loading, editing, editName, setEditName,
  editGender, setEditGender, onSave, onSignOut, onGoHome,
}: {
  lang: string; error: string | null; loading: boolean;
  editing: boolean; editName: string; setEditName: (v: string) => void;
  editGender: string | null; setEditGender: (v: string | null) => void;
  onSave: () => void; onSignOut: () => void; onGoHome: () => void;
}) {
  const { profile, verified } = useAuth();
  const initial = (profile?.display_name || '?')[0]?.toUpperCase();

  return (
    <View style={{ gap: spacing.gutter, paddingTop: spacing.stackLg }}>
      <View style={{ alignItems: 'center', gap: spacing.gutter }}>
        <View
          style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.sage,
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <ThemedText variant="titleLg" color="onPrimary" style={{ fontSize: 32, fontWeight: '700' }}>
            {initial}
          </ThemedText>
        </View>

        {editing ? (
          <View style={{ width: '100%', gap: spacing.gutter }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: colors.surfaceContainerHigh,
              borderRadius: radius.base, paddingHorizontal: spacing.gutter,
            }}>
              <UserIcon size={18} color={colors.navyMuted} />
              <TextInput
                placeholder="Your name"
                placeholderTextColor={colors.onSurfaceVariant}
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="words"
                autoFocus
                style={{
                  flex: 1, paddingVertical: 14, paddingLeft: spacing.stackSm,
                  fontSize: 16, color: colors.primary,
                }}
              />
            </View>

            <ThemedText variant="labelSm" color="onSurfaceVariant">{t('gender', lang)}</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm }}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g.value}
                  onPress={() => { haptic(); setEditGender(g.value === editGender ? null : g.value); }}
                  style={{
                    paddingVertical: spacing.unit, paddingHorizontal: spacing.gutter,
                    borderRadius: radius.full,
                    backgroundColor: editGender === g.value ? colors.sage : colors.surfaceContainer,
                  }}
                >
                  <ThemedText variant="labelSm" color={editGender === g.value ? 'onPrimary' : 'primary'}>
                    {g.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <Button label="Save" onPress={onSave} disabled={loading || !editName.trim()} />
          </View>
        ) : (
          <>
            <ThemedText variant="headlineSm" color="primary" align="center">
              {profile?.display_name || 'User'}
            </ThemedText>

            <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center">
              {profile?.email || ''}
            </ThemedText>

            {verified ? (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                alignSelf: 'center',
                paddingVertical: spacing.unit - 4, paddingHorizontal: spacing.gutter,
                borderRadius: radius.full, backgroundColor: '#e8f5e9',
              }}>
                <CheckIcon size={14} color="#2e7d32" />
                <ThemedText variant="labelSm" style={{ color: '#2e7d32' }}>
                  Email verified
                </ThemedText>
              </View>
            ) : (
              <View style={{
                alignSelf: 'center',
                paddingVertical: spacing.unit - 4, paddingHorizontal: spacing.gutter,
                borderRadius: radius.full, backgroundColor: '#fff3e0',
              }}>
                <ThemedText variant="labelSm" style={{ color: '#e65100' }}>
                  Email not verified — check your inbox
                </ThemedText>
              </View>
            )}

            {profile?.gender ? (
              <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
                {profile.gender}
              </ThemedText>
            ) : null}

            <StatsRow />

            <ThemedText variant="bodySm" color="onSurfaceVariant" align="center" style={{ paddingTop: spacing.unit }}>
              {t('signedIn', lang)}
            </ThemedText>
          </>
        )}
      </View>

      {error ? <ErrorCard error={error} /> : null}

      {!editing && (
        <>
          <View style={{ height: 1, backgroundColor: colors.surfaceContainerHigh, marginVertical: spacing.stackMd }} />

          <Button
            label={t('signOut', lang)}
            onPress={onSignOut}
            variant="secondary"
          />

          <Button
            label="Back to Home"
            onPress={() => { haptic(); onGoHome(); }}
            variant="primary"
          />
        </>
      )}
    </View>
  );
}

function StatsRow() {
  const streak = useProgress((s) => s.streak);
  return (
    <View style={{
      flexDirection: 'row',
      gap: spacing.gutter,
      paddingTop: spacing.stackSm,
    }}>
      <View style={{
        flex: 1, alignItems: 'center', gap: 4,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radius.base,
        padding: spacing.gutter,
      }}>
        <SproutIcon size={22} color={colors.sage} />
        <ThemedText variant="titleLg" color="primary" style={{ fontWeight: '700' }}>
          {streak.length}
        </ThemedText>
        <ThemedText variant="labelSm" color="onSurfaceVariant">
          day streak
        </ThemedText>
      </View>
    </View>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <View style={{
      backgroundColor: colors.errorContainer,
      borderRadius: radius.base,
      padding: spacing.gutter,
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
    }}>
      <ThemedText variant="bodySm" style={{ color: colors.onErrorContainer }}>
        {error}
      </ThemedText>
    </View>
  );
}
