import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { bibleBook, bibleVersion, bibleVersions, type BibleVersion } from '@/bible/books';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { lastRead, type LastRead } from '@/data/kv';
import { listBookmarks, type Bookmark } from '@/data/bible-marks';
import { BookCover } from '@/features/bible/book-cover';
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

/**
 * The Bible shelf: two real books to take down — Telugu OV in navy
 * leather, the English KJV in burgundy — resting on a wooden shelf.
 * Continue-reading and bookmarks sit above, edition-aware.
 */
export default function BibleShelfScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const [resume, setResume] = useState<LastRead | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useFocusEffect(
    useCallback(() => {
      const store = useBibleNav.getState();
      const shouldRedirect = store.pendingTabRedirect;
      store.clearBibleSession();
      if (shouldRedirect) {
        void lastRead().then((read) => {
          if (read?.bookId) {
            router.push({
              pathname: '/bible/[book]/[chapter]',
              params: {
                book: read.bookId,
                chapter: String(read.chapter),
                v: read.version ?? 'te-ov',
              },
            });
          }
        });
        return () => {};
      }
      let active = true;
      void Promise.all([lastRead(), listBookmarks()]).then(([read, marks]) => {
        if (active) {
          setResume(read);
          setBookmarks(marks.slice(0, 6));
        }
      });
      return () => {
        active = false;
      };
    }, [router]),
  );

  const openBook = (version: BibleVersion) => {
    router.push({ pathname: '/bible', params: { v: version } });
  };

  const resumeBook = resume ? bibleBook(resume.bookId) : undefined;
  const resumeVersion = bibleVersion(resume?.version ?? 'te-ov');

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('appName', lang)} title={t('tabBible', lang)} />

      {resumeBook && resume ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/bible/[book]/[chapter]',
              params: {
                book: resume.bookId,
                chapter: String(resume.chapter),
                v: (resume.version ?? 'te-ov') as BibleVersion,
              },
            })
          }
        >
          <Card tone="cream" padding={spacing.gutter} style={{ gap: 4 }}>
            <ThemedText
              variant="labelMd"
              color="secondary"
              style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
            >
              {t('continueReading', lang)}
            </ThemedText>
            <ThemedText variant="headlineSm" color="primary">
              {resumeBook.name[lang]} · {t('chapterWord', lang)} {resume.chapter + 1}
            </ThemedText>
            {resumeVersion ? (
              <ThemedText variant="labelMd" color="onSurfaceVariant">
                {resumeVersion.subtitle[lang]}
              </ThemedText>
            ) : null}
          </Card>
        </Pressable>
      ) : null}

      <ThemedText
        variant="labelMd"
        color="onSurfaceVariant"
        style={{ textTransform: 'uppercase', letterSpacing: 2.1, marginTop: spacing.stackSm }}
      >
        {t('chooseBible', lang)}
      </ThemedText>

      {/* The shelf: books standing on the board, names beneath it. */}
      <View style={{ paddingTop: spacing.stackSm }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.stackLg,
            paddingHorizontal: spacing.gutter,
          }}
        >
          {bibleVersions.map((info, index) => (
            <View key={info.id} style={{ flex: 1, maxWidth: 168, alignItems: 'stretch' }}>
              <BookCover info={info} lang={lang} index={index} onPress={() => openBook(info.id)} />
              {/* Contact shadow where the book meets the wood */}
              <View
                style={{
                  alignSelf: 'center',
                  width: '74%',
                  height: 7,
                  marginTop: -3,
                  borderRadius: radius.full,
                  backgroundColor: 'rgba(50,35,15,0.30)',
                }}
              />
            </View>
          ))}
        </View>

        {/* Wooden shelf board */}
        <LinearGradient
          colors={['#d4bf9e', '#bda380', '#a78c66']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ height: 12, borderRadius: 2, marginTop: -4 }}
        />
        <View
          style={{
            height: 4,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            backgroundColor: '#8e7452',
            boxShadow: '0 8px 14px rgba(60,42,20,0.22)',
          }}
        />

        {/* Name plates — aligned under each book, below the shelf */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.stackLg,
            paddingHorizontal: spacing.gutter,
            marginTop: spacing.gutter,
          }}
        >
          {bibleVersions.map((info) => (
            <View key={info.id} style={{ flex: 1, maxWidth: 168, alignItems: 'center', gap: 3 }}>
              <ThemedText
                variant="bodyMd"
                color="primary"
                align="center"
                lang={info.id === 'te-ov' ? 'te' : 'en'}
                numberOfLines={1}
              >
                {info.title[lang]}
              </ThemedText>
              <ThemedText
                variant="labelMd"
                color="onSurfaceVariant"
                align="center"
                numberOfLines={2}
                style={{ lineHeight: 17 }}
              >
                {info.subtitle[lang]}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {bookmarks.length > 0 ? (
        <View style={{ gap: spacing.stackSm }}>
          <ThemedText
            variant="labelMd"
            color="onSurfaceVariant"
            style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
          >
            {t('bookmarksLabel', lang)}
          </ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm - 4 }}>
            {bookmarks.map((mark) => {
              const book = bibleBook(mark.bookId);
              if (!book) {
                return null;
              }
              return (
                <Pressable
                  key={`${mark.version}-${mark.bookId}-${mark.chapter}`}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/bible/[book]/[chapter]',
                      params: { book: mark.bookId, chapter: String(mark.chapter), v: mark.version },
                    })
                  }
                  style={{
                    backgroundColor: tints.dailyLoop,
                    borderRadius: radius.full,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <ThemedText variant="labelMd" style={{ color: colors.sage }}>
                    🔖 {book.name[lang]} {mark.chapter + 1} · {mark.version === 'en-kjv' ? 'EN' : 'తె'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
