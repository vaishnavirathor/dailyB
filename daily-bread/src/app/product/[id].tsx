import { Stack, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { ComplianceNotice } from '@/components/compliance-notice';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import {
  ORDER_WHATSAPP_NUMBER,
  STORE_PAYEE_NAME,
  STORE_UPI_VPA,
  formatInr,
  upiPayUrl,
  whatsappOrderUrl,
} from '@/features/store/config';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { iconTile, radius, spacing, tints } from '@/theme';

/**
 * Product detail — quiet commerce. The devotional-oil class of products
 * MUST render the ComplianceNotice (Drugs & Magic Remedies Act, 1954);
 * every devotional item carries the faith-object line.
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lang = useLanguage();
  const [upiMissing, setUpiMissing] = useState(false);
  const product = getContentRepository().product(id);

  if (!product) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  const order = () => {
    const message = `${t('orderMessage', lang)}\n• ${product.name[lang]} — ${formatInr(product.priceInr)}`;
    void Linking.openURL(whatsappOrderUrl(ORDER_WHATSAPP_NUMBER, message)).catch((error) =>
      console.warn('[store] failed to open WhatsApp', error),
    );
  };

  // UPI-first on Android: the upi://pay intent opens the user's UPI app
  // chooser. No payment SDK, no fees under ₹2,000 — how India pays.
  const payUpi = async () => {
    const url = upiPayUrl({
      vpa: STORE_UPI_VPA,
      payeeName: STORE_PAYEE_NAME,
      amountInr: product.priceInr,
      note: `Daily Bread: ${product.name.en}`,
    });
    try {
      await Linking.openURL(url);
    } catch {
      setUpiMissing(true); // no UPI app registered for the scheme
    }
  };

  const isAndroid = process.env.EXPO_OS === 'android';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <View
          style={{
            alignSelf: 'center',
            width: iconTile.size * 2.4,
            height: iconTile.size * 2.4,
            borderRadius: radius.xl,
            borderCurve: 'continuous',
            backgroundColor: tints.money,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.stackSm,
          }}
        >
          <ThemedText style={{ fontSize: 52, lineHeight: 64 }}>{product.emoji}</ThemedText>
        </View>

        <View style={{ gap: 6, alignItems: 'center' }}>
          <ThemedText variant="headlineMd" color="primary" align="center">
            {product.name[lang]}
          </ThemedText>
          <ThemedText variant="labelMd" color="secondary">
            {formatInr(product.priceInr)}
          </ThemedText>
        </View>

        <ThemedText variant="bodyMd" color="onSurfaceVariant">
          {product.description[lang]}
        </ThemedText>

        {product.category === 'devotional' || product.complianceNote ? (
          <ThemedText variant="labelMd" color="onSurfaceVariant" align="center">
            {t('faithObjectNote', lang)}
          </ThemedText>
        ) : null}

        {product.complianceNote ? (
          <ComplianceNotice
            title={t('complianceOilsTitle', lang)}
            body={t('complianceOilsBody', lang)}
          />
        ) : null}

        {isAndroid ? (
          <>
            <Button label={`${t('payUpi', lang)} · ${formatInr(product.priceInr)}`} onPress={() => void payUpi()} />
            {upiMissing ? (
              <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
                {t('upiUnavailable', lang)}
              </ThemedText>
            ) : null}
            <Button label={t('orderWhatsApp', lang)} variant="secondary" onPress={order} />
          </>
        ) : (
          <Button label={t('orderWhatsApp', lang)} onPress={order} />
        )}
      </Screen>
    </>
  );
}
