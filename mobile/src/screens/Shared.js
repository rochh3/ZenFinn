import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../utils/alert';
import { useSettings, useStyles } from '../theme/SettingsContext';
import { useData } from '../context/DataContext';
import { Screen, Card, Button, Field, Sheet, EmptyState, Avatar, Icon } from '../components/ui';

export const SharedScreen = ({ navigation }) => {
  const { t, theme } = useSettings();
  const styles = useStyles(makeStyles);
  const { groups, createGroup, joinGroup } = useData();
  const [sheet, setSheet] = useState(null); // 'create' | 'join'
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!value.trim()) return Alert.alert(t('error'), t('required'));
    setBusy(true);
    try {
      if (sheet === 'create') await createGroup(value.trim());
      else await joinGroup(value.trim());
      setSheet(null); setValue('');
    } catch (e) {
      Alert.alert(t('error'), /invalid code/i.test(e.message) ? t('invalidCode') : e.message);
    } finally {
      setBusy(false);
    }
  };

  const open = (s) => { setValue(''); setSheet(s); };

  return (
    <Screen edges={[]}>
      <Text style={styles.hint}>{t('sharedHint')}</Text>

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.l }}>
        <Button title={t('newGroup')} icon="add" onPress={() => open('create')} style={{ flex: 1, marginRight: 10 }} small />
        <Button title={t('joinGroup')} icon="enter-outline" variant="secondary" onPress={() => open('join')} style={{ flex: 1 }} small />
      </View>

      {groups.length === 0 ? (
        <Card><EmptyState icon="people-outline" title={t('noGroups')} /></Card>
      ) : (
        groups.map((g) => (
          <Card key={g.id} onPress={() => navigation.navigate('SharedGroup', { groupId: g.id })} style={styles.groupCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>{g.name}</Text>
              <View style={styles.avatars}>
                {g.members.map((m, i) => (
                  <View key={m.id} style={{ marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: theme.colors.surface, borderRadius: 20 }}>
                    <Avatar name={m.name} size={30} color={theme.colors.chart[i % theme.colors.chart.length]} />
                  </View>
                ))}
                <Text style={styles.membersText}>{g.members.map((m) => m.name).join(', ')}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </Card>
        ))
      )}

      <Sheet visible={!!sheet} onClose={() => setSheet(null)} title={sheet === 'create' ? t('newGroup') : t('joinGroup')}>
        <Field
          label={sheet === 'create' ? t('groupName') : t('code')}
          value={value}
          onChangeText={setValue}
          autoFocus
          autoCapitalize={sheet === 'create' ? 'sentences' : 'characters'}
          autoCorrect={false}
          maxLength={sheet === 'create' ? 40 : 12}
          placeholder={sheet === 'create' ? 'Pareja' : 'A1B2C3D4'}
        />
        <Button title={sheet === 'create' ? t('add') : t('joinGroup')} onPress={submit} loading={busy} />
      </Sheet>
    </Screen>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  hint: { ...theme.font.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.l },
  groupCard: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  groupName: { ...theme.font.h1, color: theme.colors.text },
  avatars: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.m },
  membersText: { ...theme.font.small, color: theme.colors.textSecondary, marginLeft: theme.spacing.m, flex: 1 },
});
