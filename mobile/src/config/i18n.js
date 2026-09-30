export const translations = {
  es: {
    // Navigation
    dashboard: 'RESUMEN',
    assistant: '✦ ASISTENTE IA',
    budgets: 'PLANES Y LÍMITES',
    statistics: 'ESTADÍSTICAS',
    addTransaction: 'NUEVA TRANSACCIÓN',
    calendar: 'CALENDARIO DIARIO',
    categories: 'CATEGORÍAS',
    profile: 'MI PERFIL',
    shared: 'COMPARTIDO', // New Tab

    // Dashboard
    hello: 'Hola',
    currentBalance: 'SALDO ACTUAL',
    addExpense: '+ GASTO',
    addIncome: '+ INGRESO',
    history: 'HISTORIAL',
    noTransactions: 'Añade tu primera transacción con el botón de arriba',
    deleteTxTitle: 'Eliminar transacción',
    deleteTxMsg: '¿Estás seguro de que deseas eliminar esta transacción?',
    cancel: 'Cancelar',
    delete: 'Eliminar',

    // Account
    controlCenter: 'CENTRO DE CONTROL',
    username: 'Nombre de Usuario',
    customization: 'PERSONALIZACIÓN',
    appTheme: 'TEMA DE LA APLICACIÓN',
    language: 'IDIOMA',
    saveChanges: 'GUARDAR CAMBIOS',
    saved: '✓ GUARDADO',
    dark: 'Oscuro',
    light: 'Claro',
    pink: 'Rosa',
    spanish: 'Español',
    english: 'English',

    // Statistics
    stats: 'ESTADÍSTICAS',
    daily: 'Diario',
    monthly: 'Mensual',
    quarterly: 'Trimestre',
    yearly: 'Anual',

    // Shared
    sharedGroups: 'CUENTAS COMPARTIDAS',
    newGroup: 'Nueva Cuenta',
  },
  en: {
    // Navigation
    dashboard: 'DASHBOARD',
    assistant: '✦ AI ASSISTANT',
    budgets: 'BUDGETS & LIMITS',
    statistics: 'STATISTICS',
    addTransaction: 'NEW TRANSACTION',
    calendar: 'DAILY CALENDAR',
    categories: 'CATEGORIES',
    profile: 'MY PROFILE',
    shared: 'SHARED', // New Tab

    // Dashboard
    hello: 'Hello',
    currentBalance: 'CURRENT BALANCE',
    addExpense: '+ EXPENSE',
    addIncome: '+ INCOME',
    history: 'HISTORY',
    noTransactions: 'Add your first transaction with the button above',
    deleteTxTitle: 'Delete transaction',
    deleteTxMsg: 'Are you sure you want to delete this transaction?',
    cancel: 'Cancel',
    delete: 'Delete',

    // Account
    controlCenter: 'CONTROL CENTER',
    username: 'Username',
    customization: 'CUSTOMIZATION',
    appTheme: 'APP THEME',
    language: 'LANGUAGE',
    saveChanges: 'SAVE CHANGES',
    saved: '✓ SAVED',
    dark: 'Dark',
    light: 'Light',
    pink: 'Pink',
    spanish: 'Español',
    english: 'English',

    // Statistics
    stats: 'STATISTICS',
    daily: 'Daily',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',

    // Shared
    sharedGroups: 'SHARED ACCOUNTS',
    newGroup: 'New Account',
  }
};

export const t = (key, lang = 'es') => {
  return translations[lang]?.[key] || translations['es'][key] || key;
};
