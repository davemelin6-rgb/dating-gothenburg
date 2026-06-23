export type Language = 'sv' | 'en';

export const translations = {
  sv: {
    // App
    appName: 'Dating Göteborg',
    tagline: 'Dejta ikväll',

    // Auth
    email: 'E-post',
    password: 'Lösenord',
    signIn: 'Logga in',
    signUp: 'Registrera dig',
    forgotPassword: 'Glömt lösenord?',
    forgotPasswordTitle: 'Återställ lösenord',
    forgotPasswordSub: 'Ange din e-post så skickar vi en länk för att återställa ditt lösenord.',
    sendResetLink: 'Skicka länk',
    sending: 'Skickar...',
    resetSent: 'Kolla din e-post! Vi har skickat en återställningslänk.',
    backToLogin: 'Tillbaka till inloggning',
    noAccount: 'Har du inget konto?',
    haveAccount: 'Har du redan ett konto?',
    signingIn: 'Loggar in...',
    signingUp: 'Registrerar...',
    incorrectCredentials: 'Fel e-post eller lösenord. Försök igen.',
    fillInFields: 'Fyll i din e-post och lösenord.',
    name: 'Namn',
    age: 'Ålder',
    yourName: 'Ditt namn',
    yourAge: 'Din ålder',

    // Tabs
    discover: 'Utforska',
    messages: 'Meddelanden',
    events: 'Events',
    profile: 'Profil',
    settings: 'Inställningar',

    // Swipe
    noMoreProfiles: 'Inga fler profiler',
    noMoreProfilesText: 'Du har sett alla som matchar dina preferenser i Göteborg just nu.',
    refresh: 'Uppdatera',
    liked: '💚 Gillad!',
    passed: '❌ Passad',

    // Match popup
    itsAMatch: 'Det är en match!',
    matchSub: 'Du och {name} gillade varandra',
    keepSwiping: 'Fortsätt swipa',
    sendMessage: 'Skicka meddelande',

    // Matches
    matchesTitle: 'Meddelanden',
    noMatchesYet: 'Inga matchningar än',
    noMatchesText: 'Fortsätt swipa för att hitta din match i Göteborg!',
    tapToSayHello: 'Tryck för att säga hej!',

    // Chat
    writeMessage: 'Skriv ett meddelande...',
    sayHello: 'Säg hej till {name}!',

    // Profile
    myProfile: 'Min profil',
    aboutMe: 'Om mig',
    lookingFor: 'Jag söker',
    addPhoto: 'Lägg till foto',
    nameLabel: 'Namn',
    ageLabel: 'Ålder',
    iAm: 'Jag är',
    aboutMeLabel: 'Om mig',
    myInterests: 'Mina intressen',
    interestedIn: 'Intresserad av',
    partnerAgeRange: 'Partnerns åldersintervall',
    lookingForSomeone: 'Söker någon mellan {min} och {max} år',
    saveProfile: 'Spara profil',
    saved: '✓ Sparat!',
    saving: 'Sparar...',
    signOut: 'Logga ut',
    permissionNeeded: 'Behörighet krävs',
    allowPhotos: 'Vänligen tillåt åtkomst till dina foton',
    errorSaving: 'Fel vid sparning',
    lookingForHint: 'Berätta vad du söker så hittar vi bättre matchningar åt dig.',
    min: 'Min',
    max: 'Max',
    man: 'Man',
    woman: 'Kvinna',
    other: 'Annat',
    women: 'Kvinnor',
    men: 'Män',
    everyone: 'Alla',

    // Events
    eventsTitle: 'Events i Göteborg',
    eventsSubtitle: 'Tryck på ett hjärtdatum för att se vad som händer',
    selectDate: 'Välj ett rosa datum för att se eventet',

    // Settings
    settingsTitle: 'Inställningar',
    language: 'Språk',
    languageSwedish: 'Svenska',
    languageEnglish: 'English',
    appearance: 'Utseende',
    about: 'Om appen',
    version: 'Version 1.0.0',
  },

  en: {
    appName: 'Dating Gothenburg',
    tagline: 'Dejta ikväll',

    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot password?',
    forgotPasswordTitle: 'Reset password',
    forgotPasswordSub: 'Enter your email and we will send you a link to reset your password.',
    sendResetLink: 'Send reset link',
    sending: 'Sending...',
    resetSent: 'Check your email! We sent you a reset link.',
    backToLogin: 'Back to login',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signingIn: 'Signing in...',
    signingUp: 'Signing up...',
    incorrectCredentials: 'Incorrect email or password. Please try again.',
    fillInFields: 'Please fill in your email and password.',
    name: 'Name',
    age: 'Age',
    yourName: 'Your name',
    yourAge: 'Your age',

    discover: 'Discover',
    messages: 'Messages',
    events: 'Events',
    profile: 'Profile',
    settings: 'Settings',

    noMoreProfiles: 'No more profiles',
    noMoreProfilesText: "You've seen everyone matching your preferences in Gothenburg right now.",
    refresh: 'Refresh',
    liked: '💚 Liked!',
    passed: '❌ Passed',

    itsAMatch: "It's a Match!",
    matchSub: 'You and {name} liked each other',
    keepSwiping: 'Keep Swiping',
    sendMessage: 'Send Message',

    matchesTitle: 'Messages',
    noMatchesYet: 'No matches yet',
    noMatchesText: 'Keep swiping to find your match in Gothenburg!',
    tapToSayHello: 'Tap to say hello!',

    writeMessage: 'Write a message...',
    sayHello: 'Say hello to {name}!',

    myProfile: 'My Profile',
    aboutMe: 'About Me',
    lookingFor: "I'm Looking For",
    addPhoto: 'Add Photo',
    nameLabel: 'Name',
    ageLabel: 'Age',
    iAm: 'I am a',
    aboutMeLabel: 'About me',
    myInterests: 'My Interests',
    interestedIn: 'Interested In',
    partnerAgeRange: 'Partner Age Range',
    lookingForSomeone: 'Looking for someone between {min} and {max} years old',
    saveProfile: 'Save Profile',
    saved: '✓ Saved!',
    saving: 'Saving...',
    signOut: 'Sign Out',
    permissionNeeded: 'Permission needed',
    allowPhotos: 'Please allow access to your photos',
    errorSaving: 'Error saving profile',
    lookingForHint: 'Tell us what you are looking for so we can find better matches for you.',
    min: 'Min',
    max: 'Max',
    man: 'Man',
    woman: 'Woman',
    other: 'Other',
    women: 'Women',
    men: 'Men',
    everyone: 'Everyone',

    eventsTitle: 'Events in Gothenburg',
    eventsSubtitle: 'Tap a heart date to see what\'s on',
    selectDate: 'Select a pink date to see the event',

    settingsTitle: 'Settings',
    language: 'Language',
    languageSwedish: 'Svenska',
    languageEnglish: 'English',
    appearance: 'Appearance',
    about: 'About',
    version: 'Version 1.0.0',
  },
} as const;

export type TranslationKey = keyof typeof translations.sv;

export function t(lang: Language, key: TranslationKey, vars?: Record<string, string>): string {
  let str = (translations[lang] as any)[key] ?? (translations.en as any)[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
  }
  return str;
}
