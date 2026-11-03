import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getAppSetting, setAppSetting } from '@/infrastructure/database/app-settings';

export type AppLanguage = 'es' | 'en';
type TranslationKey = keyof typeof translations.es;
const STORAGE_KEY = 'app_language';

const translations = {
  es: {
    messages: 'Mensajes', settings: 'Configuración', yourMessages: 'Tus mensajes',
    savedReplyOne: 'respuesta guardada', savedReplyMany: 'respuestas guardadas',
    new: 'Nuevo', searchTitle: 'Buscar por título', searchAccessibility: 'Buscar mensajes por título',
    loading: 'Cargando mensajes…', nothingSaved: 'Aún no hay mensajes guardados',
    emptyDescription: 'Crea tu primera respuesta reutilizable y tenla lista para copiar.',
    createMessage: 'Crear mensaje', noMatches: 'No hay mensajes coincidentes',
    tryAnother: 'Prueba con otro título o limpia tu búsqueda.', clearSearch: 'Limpiar búsqueda',
    favorites: 'FAVORITOS', removeFavorite: 'Quitar de favoritos', addFavorite: 'Agregar a favoritos',
    copyMessage: 'Copiar mensaje', edit: 'Editar', delete: 'Eliminar',
    copied: 'Copiado al portapapeles', copiedDescription: 'Tu mensaje está listo para pegarlo en la conversación.',
    dontShowAgain: 'No volver a mostrar', gotIt: 'Entendido',
    somethingWrong: 'Algo salió mal', loadFailed: 'No se pudieron cargar tus mensajes.',
    copyFailed: 'No se pudo copiar', tryAgain: 'Inténtalo de nuevo.',
    preferenceNotSaved: 'No se guardó la preferencia', confirmationAgain: 'La confirmación volverá a aparecer la próxima vez.',
    deleteTitle: '¿Eliminar mensaje?', deleteDescription: '«{title}» se eliminará permanentemente.',
    cancel: 'Cancelar', updateFailed: 'No se pudo actualizar', favoriteFailed: 'No se pudo cambiar el favorito.',
    deleteFailed: 'No se pudo eliminar', title: 'TÍTULO', message: 'MENSAJE',
    newMessage: 'Nuevo mensaje', editMessage: 'Editar mensaje', missingInfo: 'Falta información',
    addTitleAndMessage: 'Agrega un título y un mensaje antes de guardar.',
    deliveryPlaceholder: 'Ej. Información de entrega', titlePlaceholder: 'Título del mensaje',
    messagePlaceholder: 'Escribe la respuesta que quieres reutilizar…',
    reusablePlaceholder: 'Escribe tu respuesta reutilizable…',
    localHint: 'Tu mensaje se guarda únicamente en este dispositivo.',
    saving: 'Guardando…', saveMessage: 'Guardar mensaje', saveChanges: 'Guardar cambios',
    couldNotSave: 'No se pudo guardar', saveFailed: 'No se guardó tu mensaje. Inténtalo de nuevo.',
    changesFailed: 'No se guardaron los cambios. Inténtalo de nuevo.',
    unableToLoad: 'No se pudo cargar', messageLoadFailed: 'No se pudo cargar este mensaje.',
    notFound: 'No se encontró el mensaje.', goBack: 'Volver',
    customize: 'Personaliza cómo se ve Writeless en este dispositivo.',
    appearance: 'Apariencia', theme: 'Tema', system: 'Sistema',
    followDevice: 'Seguir la apariencia del dispositivo', light: 'Claro',
    alwaysLight: 'Usar siempre la apariencia clara', dark: 'Oscuro',
    alwaysDark: 'Usar siempre la apariencia oscura', language: 'Idioma',
    spanish: 'Español', english: 'English',
    overlayTitle: 'Ventana flotante', overlayDescription: 'Copia tus mensajes sobre otras aplicaciones sin salir de la conversación.',
    overlayPermissionGranted: 'Permiso de superposición concedido.', overlayPermissionNeeded: 'Android necesita tu permiso para mostrar Writeless sobre otras aplicaciones.',
    overlayEnable: 'Activar ventana flotante', overlayDisable: 'Desactivar ventana flotante',
    overlayOpenApp: 'Abrir app principal', overlayMinimize: 'Minimizar', overlayClose: 'Cerrar',
    overlayEmpty: 'Aún no tienes mensajes guardados.', overlayCopied: 'Copiado', overlaySearchHint: 'Buscar mensajes', overlayNoMatches: 'No hay mensajes coincidentes',
  },
  en: {
    messages: 'Messages', settings: 'Settings', yourMessages: 'Your messages',
    savedReplyOne: 'saved reply', savedReplyMany: 'saved replies',
    new: 'New', searchTitle: 'Search by title', searchAccessibility: 'Search messages by title',
    loading: 'Loading messages…', nothingSaved: 'Nothing saved yet',
    emptyDescription: 'Create your first reusable reply and keep it ready to copy.',
    createMessage: 'Create a message', noMatches: 'No matching messages',
    tryAnother: 'Try another title or clear your search.', clearSearch: 'Clear search',
    favorites: 'FAVORITES', removeFavorite: 'Remove favorite', addFavorite: 'Add favorite',
    copyMessage: 'Copy message', edit: 'Edit', delete: 'Delete',
    copied: 'Copied to clipboard', copiedDescription: 'Your message is ready to paste in the conversation.',
    dontShowAgain: "Don't show this again", gotIt: 'Got it',
    somethingWrong: 'Something went wrong', loadFailed: 'Your messages could not be loaded.',
    copyFailed: 'Copy failed', tryAgain: 'Please try again.',
    preferenceNotSaved: 'Preference not saved', confirmationAgain: 'The confirmation will appear again next time.',
    deleteTitle: 'Delete message?', deleteDescription: '"{title}" will be permanently deleted.',
    cancel: 'Cancel', updateFailed: 'Update failed', favoriteFailed: 'The favorite status could not be changed.',
    deleteFailed: 'Delete failed', title: 'TITLE', message: 'MESSAGE',
    newMessage: 'New message', editMessage: 'Edit message', missingInfo: 'Missing information',
    addTitleAndMessage: 'Add a title and message before saving.',
    deliveryPlaceholder: 'e.g. Delivery information', titlePlaceholder: 'Message title',
    messagePlaceholder: 'Write the reply you want to reuse…',
    reusablePlaceholder: 'Write your reusable reply…',
    localHint: 'Your message is saved only on this device.',
    saving: 'Saving…', saveMessage: 'Save message', saveChanges: 'Save changes',
    couldNotSave: 'Could not save', saveFailed: 'Your message was not saved. Please try again.',
    changesFailed: 'Your changes were not saved. Please try again.',
    unableToLoad: 'Unable to load', messageLoadFailed: 'This message could not be loaded.',
    notFound: 'Message not found.', goBack: 'Go back',
    customize: 'Customize how Writeless looks on this device.',
    appearance: 'Appearance', theme: 'Theme', system: 'System',
    followDevice: 'Follow your device appearance', light: 'Light',
    alwaysLight: 'Always use light appearance', dark: 'Dark',
    alwaysDark: 'Always use dark appearance', language: 'Language',
    spanish: 'Español', english: 'English',
    overlayTitle: 'Floating panel', overlayDescription: 'Copy your messages over other apps without leaving the conversation.',
    overlayPermissionGranted: 'Overlay permission granted.', overlayPermissionNeeded: 'Android needs your permission to display Writeless over other apps.',
    overlayEnable: 'Enable floating panel', overlayDisable: 'Disable floating panel',
    overlayOpenApp: 'Open main app', overlayMinimize: 'Minimize', overlayClose: 'Close',
    overlayEmpty: 'You have no saved messages yet.', overlayCopied: 'Copied', overlaySearchHint: 'Search messages', overlayNoMatches: 'No matching messages',
  },
} as const;

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => Promise<void>; t: (key: TranslationKey, values?: Record<string, string>) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('es');

  useEffect(() => {
    let active = true;
    void getAppSetting(STORAGE_KEY).then((value) => {
      if (active && (value === 'es' || value === 'en')) setLanguageState(value);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const setLanguage = useCallback(async (value: AppLanguage) => {
    await setAppSetting(STORAGE_KEY, value);
    setLanguageState(value);
  }, []);

  const t = useCallback((key: TranslationKey, values?: Record<string, string>) => {
    let value: string = translations[language][key];
    if (values) for (const [name, replacement] of Object.entries(values)) value = value.replace(`{${name}}`, replacement);
    return value;
  }, [language]);

  const context = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={context}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider.');
  return value;
}
