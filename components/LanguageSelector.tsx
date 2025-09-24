
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage, Language } from '../contexts/LanguageContext';
import Icon from './Icon';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('english'), flag: '🇺🇸' },
    { code: 'fr', name: t('french'), flag: '🇫🇷' },
  ];

  return (
    <View>
      <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
        {t('selectLanguage')}
      </Text>
      
      {languages.map(lang => (
        <TouchableOpacity
          key={lang.code}
          style={[
            commonStyles.card,
            {
              marginBottom: 8,
              borderWidth: 2,
              borderColor: language === lang.code ? colors.primary : colors.border,
              backgroundColor: language === lang.code ? colors.primary + '10' : colors.card,
            }
          ]}
          onPress={() => setLanguage(lang.code)}
        >
          <View style={commonStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
              <Text style={[
                commonStyles.text,
                { color: language === lang.code ? colors.primary : colors.text }
              ]}>
                {lang.name}
              </Text>
            </View>
            {language === lang.code && (
              <Icon name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
