// Textos de la interfaz. t('clave', { var: 1 }) interpola {var}.
export const translations = {
  es: {
    appName: 'ZenFin', tryDemo: 'Probar sin cuenta (demo)',
    // Navegación
    tabHome: 'Inicio', tabStats: 'Análisis', tabAdd: 'Añadir', tabAssistant: 'Asistente', tabMore: 'Más',
    budgets: 'Presupuestos', calendar: 'Calendario', categories: 'Categorías', shared: 'Cuentas compartidas', profile: 'Mi perfil',
    moreSubtitle: 'Todo lo demás, en un solo lugar',
    // Comunes
    cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', add: 'Añadir', edit: 'Editar', back: 'Atrás', done: 'Hecho', next: 'Siguiente', skip: 'Omitir', continue: 'Continuar',
    error: 'Error', required: 'Rellena los campos obligatorios', loading: 'Cargando…', retry: 'Reintentar', offline: 'Sin conexión: mostrando datos guardados',
    expense: 'Gasto', income: 'Ingreso', expenses: 'Gastos', incomes: 'Ingresos', balance: 'Saldo', today: 'Hoy', yesterday: 'Ayer', noCategory: 'Sin categoría',
    // Auth
    welcomeBack: 'Bienvenido de nuevo', createAccount: 'Crea tu cuenta', authSubtitle: 'Tus finanzas, sincronizadas en todos tus dispositivos',
    email: 'Correo electrónico', password: 'Contraseña', yourName: 'Tu nombre', signIn: 'Entrar', signUp: 'Crear cuenta',
    noAccount: '¿No tienes cuenta? Regístrate', haveAccount: '¿Ya tienes cuenta? Entra', forgot: '¿Olvidaste la contraseña?',
    resetSent: 'Te hemos enviado un correo para restablecer la contraseña.', resetNeedEmail: 'Escribe tu correo arriba primero.',
    confirmEmail: 'Revisa tu correo para confirmar la cuenta y luego entra.', passwordMin: 'La contraseña debe tener al menos 6 caracteres',
    invalidCreds: 'Correo o contraseña incorrectos', notConfigured: 'Falta configurar Supabase (EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY).',
    // Onboarding
    obHello: '¡Hola! Vamos a dejarlo a tu gusto', obName: '¿Cómo te llamas?', obTheme: 'Elige tu estilo',
    obCategories: 'Tus categorías', obCategoriesHint: 'Toca para elegir las que usarás. Podrás cambiarlas luego.',
    obFixed: 'Gastos fijos', obFixedHint: 'Alquiler, suscripciones… (opcional)', obStart: 'Empezar', step: 'Paso {n} de {total}',
    // Inicio
    hello: 'Hola, {name}', currentBalance: 'Saldo total', thisMonth: 'Este mes', recent: 'Movimientos', seeAll: 'Ver todo',
    noTransactions: 'Aún no hay movimientos', noTransactionsHint: 'Añade tu primer gasto o ingreso con el botón +',
    deleteTxTitle: 'Eliminar movimiento', deleteTxMsg: '¿Seguro que quieres eliminarlo? No se puede deshacer.',
    // Añadir
    newTransaction: 'Nuevo movimiento', editTransaction: 'Editar movimiento', amount: 'Importe', note: 'Nota (opcional)', notePlaceholder: '¿En qué fue?',
    category: 'Categoría', date: 'Fecha', saveTransaction: 'Guardar movimiento', invalidAmount: 'Introduce un importe válido',
    createCategoryFirst: 'Crea primero una categoría', saved: 'Guardado',
    // Estadísticas
    stats: 'Análisis', day: 'Día', month: 'Mes', quarter: 'Trimestre', year: 'Año', net: 'Neto', byCategory: 'Gasto por categoría', evolution: 'Evolución', noData: 'No hay datos en este periodo',
    // Calendario
    noDayTransactions: 'Sin movimientos este día',
    // Categorías
    newCategory: 'Nueva categoría', editCategory: 'Editar categoría', categoryName: 'Nombre', icon: 'Icono', color: 'Color', archiveCategoryMsg: 'La categoría se ocultará pero tus movimientos antiguos la conservarán.',
    categoriesHint: 'Toca una categoría para editarla',
    // Presupuestos
    fixedExpenses: 'Gastos fijos', recurringIncomes: 'Ingresos recurrentes', categoryLimits: 'Límites por categoría', newPlan: 'Nuevo límite',
    monthlyMargin: 'Margen mensual estimado', perMonth: '/ mes', name: 'Nombre', dayOfMonth: 'Día del mes', limit: 'Límite mensual',
    noFixed: 'Sin gastos fijos', noRecurring: 'Sin ingresos recurrentes', noLimits: 'Sin límites configurados', leftThisMonth: 'Te quedan {amount} este mes', overBy: 'Te has pasado {amount}',
    pickCategory: 'Elige una categoría', everyMonthDay: 'Cada mes, día {day}',
    // Compartidas
    sharedHint: 'Gastos a medias con tu pareja o amigos. Cada uno ve lo mismo desde su móvil.', newGroup: 'Nueva cuenta', groupName: 'Nombre de la cuenta', joinGroup: 'Unirme', inviteCode: 'Código de invitación',
    inviteShare: 'Compartir código', members: 'Miembros', settleUp: 'Ajustar cuentas', allSettled: 'Todo saldado ✨', owes: 'debe a', settle: 'Saldar', newSharedExpense: 'Nuevo gasto compartido', concept: 'Concepto', whoPaid: '¿Quién pagó?',
    alsoRecord: 'Apuntarlo también en mis gastos', leaveGroup: 'Salir de la cuenta', leaveGroupMsg: 'Dejarás de ver esta cuenta compartida.', noGroups: 'Aún no tienes cuentas compartidas', noSharedExpenses: 'Sin gastos todavía',
    you: 'Tú', settleMsg: '¿Marcar como pagados {amount} de {from} a {to}?', invalidCode: 'Código no válido', code: 'Código', history: 'Historial', transfer: 'Pago',
    // Chat
    assistantTitle: 'Asistente IA', assistantHello: '¡Hola{name}! Dime en lenguaje natural un gasto o ingreso y lo registro por ti.', assistantExamples: 'Prueba: “Ayer 45€ de cena” · “Cobré la nómina 2100”', typeMessage: 'Escribe un mensaje…',
    registered: 'Registrado', needCategory: 'Falta elegir categoría para', aiError: 'No he podido conectar con el asistente. Inténtalo de nuevo.', apiMissing: 'Falta configurar EXPO_PUBLIC_API_URL.',
    // Perfil
    appearance: 'Apariencia', theme: 'Tema', language: 'Idioma', account: 'Cuenta', whatsapp: 'WhatsApp', whatsappHint: 'Vincula tu número (con prefijo, sin +) para registrar gastos por WhatsApp.', signOut: 'Cerrar sesión', signOutMsg: '¿Cerrar sesión en este dispositivo?',
    importLegacy: 'Importar datos antiguos de este móvil', importLegacyMsg: 'Se han encontrado datos guardados antes de usar cuentas. ¿Importarlos a tu cuenta?', imported: 'Importados {n} movimientos', import: 'Importar',
  },
  en: {
    appName: 'ZenFin', tryDemo: 'Try without an account (demo)',
    tabHome: 'Home', tabStats: 'Insights', tabAdd: 'Add', tabAssistant: 'Assistant', tabMore: 'More',
    budgets: 'Budgets', calendar: 'Calendar', categories: 'Categories', shared: 'Shared accounts', profile: 'My profile',
    moreSubtitle: 'Everything else, in one place',
    cancel: 'Cancel', save: 'Save', delete: 'Delete', add: 'Add', edit: 'Edit', back: 'Back', done: 'Done', next: 'Next', skip: 'Skip', continue: 'Continue',
    error: 'Error', required: 'Fill in the required fields', loading: 'Loading…', retry: 'Retry', offline: 'Offline: showing saved data',
    expense: 'Expense', income: 'Income', expenses: 'Expenses', incomes: 'Income', balance: 'Balance', today: 'Today', yesterday: 'Yesterday', noCategory: 'No category',
    welcomeBack: 'Welcome back', createAccount: 'Create your account', authSubtitle: 'Your finances, synced across all your devices',
    email: 'Email', password: 'Password', yourName: 'Your name', signIn: 'Sign in', signUp: 'Create account',
    noAccount: "Don't have an account? Sign up", haveAccount: 'Already have an account? Sign in', forgot: 'Forgot your password?',
    resetSent: 'We sent you an email to reset your password.', resetNeedEmail: 'Type your email above first.',
    confirmEmail: 'Check your email to confirm your account, then sign in.', passwordMin: 'Password must be at least 6 characters',
    invalidCreds: 'Wrong email or password', notConfigured: 'Supabase is not configured (EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY).',
    obHello: "Hi! Let's make it yours", obName: "What's your name?", obTheme: 'Pick your style',
    obCategories: 'Your categories', obCategoriesHint: 'Tap the ones you will use. You can change them later.',
    obFixed: 'Fixed expenses', obFixedHint: 'Rent, subscriptions… (optional)', obStart: 'Get started', step: 'Step {n} of {total}',
    hello: 'Hi, {name}', currentBalance: 'Total balance', thisMonth: 'This month', recent: 'Activity', seeAll: 'See all',
    noTransactions: 'No transactions yet', noTransactionsHint: 'Add your first expense or income with the + button',
    deleteTxTitle: 'Delete transaction', deleteTxMsg: 'Are you sure? This cannot be undone.',
    newTransaction: 'New transaction', editTransaction: 'Edit transaction', amount: 'Amount', note: 'Note (optional)', notePlaceholder: 'What was it for?',
    category: 'Category', date: 'Date', saveTransaction: 'Save transaction', invalidAmount: 'Enter a valid amount',
    createCategoryFirst: 'Create a category first', saved: 'Saved',
    stats: 'Insights', day: 'Day', month: 'Month', quarter: 'Quarter', year: 'Year', net: 'Net', byCategory: 'Spending by category', evolution: 'Trend', noData: 'No data in this period',
    noDayTransactions: 'No transactions this day',
    newCategory: 'New category', editCategory: 'Edit category', categoryName: 'Name', icon: 'Icon', color: 'Color', archiveCategoryMsg: 'The category will be hidden, but past transactions keep it.',
    categoriesHint: 'Tap a category to edit it',
    fixedExpenses: 'Fixed expenses', recurringIncomes: 'Recurring income', categoryLimits: 'Category limits', newPlan: 'New limit',
    monthlyMargin: 'Estimated monthly margin', perMonth: '/ month', name: 'Name', dayOfMonth: 'Day of month', limit: 'Monthly limit',
    noFixed: 'No fixed expenses', noRecurring: 'No recurring income', noLimits: 'No limits set', leftThisMonth: '{amount} left this month', overBy: 'Over by {amount}',
    pickCategory: 'Pick a category', everyMonthDay: 'Every month, day {day}',
    sharedHint: 'Split costs with your partner or friends. Everyone sees the same from their phone.', newGroup: 'New account', groupName: 'Account name', joinGroup: 'Join', inviteCode: 'Invite code',
    inviteShare: 'Share code', members: 'Members', settleUp: 'Settle up', allSettled: 'All settled ✨', owes: 'owes', settle: 'Settle', newSharedExpense: 'New shared expense', concept: 'Description', whoPaid: 'Who paid?',
    alsoRecord: 'Also record in my expenses', leaveGroup: 'Leave account', leaveGroupMsg: "You'll stop seeing this shared account.", noGroups: 'No shared accounts yet', noSharedExpenses: 'No expenses yet',
    you: 'You', settleMsg: 'Mark {amount} from {from} to {to} as paid?', invalidCode: 'Invalid code', code: 'Code', history: 'History', transfer: 'Payment',
    assistantTitle: 'AI assistant', assistantHello: 'Hi{name}! Tell me an expense or income in plain words and I will log it for you.', assistantExamples: 'Try: “Dinner 45€ yesterday” · “Got paid 2100”', typeMessage: 'Type a message…',
    registered: 'Logged', needCategory: 'Category needed for', aiError: "I couldn't reach the assistant. Please try again.", apiMissing: 'EXPO_PUBLIC_API_URL is not configured.',
    appearance: 'Appearance', theme: 'Theme', language: 'Language', account: 'Account', whatsapp: 'WhatsApp', whatsappHint: 'Link your number (with country code, no +) to log expenses via WhatsApp.', signOut: 'Sign out', signOutMsg: 'Sign out on this device?',
    importLegacy: 'Import old data from this phone', importLegacyMsg: 'Data saved before accounts was found. Import it into your account?', imported: 'Imported {n} transactions', import: 'Import',
  },
};

export const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

export const makeT = (lang) => (key, vars) => {
  let s = translations[lang]?.[key] ?? translations.es[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
};
