import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSettings } from '../theme/SettingsContext';

/** Gráfico de anillo. data: [{ value, color }] */
export const DonutChart = ({ data, size = 170, thickness = 20, centerTop, centerBottom }) => {
  const { theme } = useSettings();
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.surfaceAlt} strokeWidth={thickness} fill="none" />
        {total > 0 &&
          data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <Circle
                key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${Math.max(len - 2, 0.5)} ${c}`} strokeDashoffset={-offset}
                rotation={-90} origin={`${size / 2}, ${size / 2}`}
              />
            );
            offset += len;
            return el;
          })}
      </Svg>
      {centerTop ? <Text style={{ ...theme.font.caption, color: theme.colors.textSecondary }}>{centerTop}</Text> : null}
      {centerBottom ? <Text style={{ ...theme.font.h1, color: theme.colors.text, marginTop: 2 }}>{centerBottom}</Text> : null}
    </View>
  );
};

/** Barras agrupadas ingresos/gastos. data: [{ label, income, expense }] */
export const BarChart = ({ data, height = 140 }) => {
  const { theme } = useSettings();
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  const dense = data.length > 14;
  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end' }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: dense ? 0.5 : 3 }}>
            <View style={{ flex: 1, height: Math.max((d.income / max) * height, d.income > 0 ? 3 : 0), backgroundColor: theme.colors.success, borderTopLeftRadius: 4, borderTopRightRadius: 4, marginRight: dense ? 0 : 1 }} />
            <View style={{ flex: 1, height: Math.max((d.expense / max) * height, d.expense > 0 ? 3 : 0), backgroundColor: theme.colors.danger, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
          </View>
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: theme.colors.border, marginTop: 4 }} />
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ width: 28, flexShrink: 0, textAlign: 'center', fontSize: 10, color: theme.colors.textSecondary }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
