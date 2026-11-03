// Frozen handout content. Do not add doses, drug strengths, or statistics on stage.
//
// What this is: general patient education, written to conventional US cath-lab discharge
// practice. It is not taken from a single published source, and a clinician should review it
// before it is handed to patients. All text is static: no network, no AI.
//
// The only numbers used, all conventional discharge-sheet instructions (not outcome statistics):
//   - 10 minutes of firm pressure for access-site bleeding before calling 911
//     (standard manual-hemostasis instruction on radial and femoral discharge sheets).
//   - Day counts: keep the dressing dry for one day, no driving for at least one day after
//     sedation, two days of wrist rest after radial access, one week of no soaking and no heavy
//     lifting after radial or femoral access.
//   - 911 for emergencies (US emergency number).
// Antibiotic-before-dental-work wording for TAVR and TEER follows the AHA position that
// prosthetic valves and valve repairs with prosthetic material are high-risk for endocarditis
// (Wilson WR et al. Circulation 2021;143:e963-e978). No drug names with doses appear anywhere.

export type Lang = 'en' | 'es'

export const PROCEDURES = ['tavr', 'pci', 'laao', 'teer', 'radialcath'] as const
export type ProcedureId = (typeof PROCEDURES)[number]

export const LEVELS = ['simple', 'standard'] as const
export type Level = (typeof LEVELS)[number]

export const LANGS = ['en', 'es'] as const satisfies readonly Lang[]

export const SECTION_ORDER = ['done', 'firstWeek', 'wound', 'activity', 'medicines', 'callUs'] as const
export type SectionId = (typeof SECTION_ORDER)[number]

export const SECTION_HEADINGS: Record<Lang, Record<SectionId, string>> = {
  en: {
    done: 'What was done today',
    firstWeek: 'The first week at home',
    wound: 'Your wound (access site) care',
    activity: 'Activity',
    medicines: 'Medicines',
    callUs: 'Call us or go to the emergency department if',
  },
  es: {
    done: 'Lo que se hizo hoy',
    firstWeek: 'La primera semana en casa',
    wound: 'Cuidado de la herida (sitio de acceso)',
    activity: 'Actividad',
    medicines: 'Medicamentos',
    callUs: 'Llámenos o vaya a urgencias si',
  },
}

export const CLOSING: Record<Lang, string> = {
  en: "This sheet is general education. Your own care team's instructions come first.",
  es: 'Esta hoja es educación general. Las instrucciones de su propio equipo médico van primero.',
}

export const PROCEDURE_TITLES: Record<Lang, Record<ProcedureId, string>> = {
  en: {
    tavr: 'Aortic valve replacement by catheter (TAVR)',
    pci: 'Coronary stent (PCI)',
    laao: 'Left atrial appendage closure (LAAO)',
    teer: 'Mitral valve clip repair (TEER)',
    radialcath: 'Heart catheterization through the wrist',
  },
  es: {
    tavr: 'Reemplazo de válvula aórtica por catéter (TAVR)',
    pci: 'Stent coronario (ICP)',
    laao: 'Cierre de la orejuela auricular izquierda (LAAO)',
    teer: 'Reparación de la válvula mitral con clip (TEER)',
    radialcath: 'Cateterismo cardíaco por la muñeca',
  },
}

export const LEVEL_NAMES: Record<Lang, Record<Level, string>> = {
  en: { simple: 'Simple reading level', standard: 'Standard reading level' },
  es: { simple: 'Lectura sencilla', standard: 'Lectura estándar' },
}

export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español' }

type Body = Record<SectionId, readonly string[]>

export const CONTENT: Record<ProcedureId, Record<Level, Record<Lang, Body>>> = {
  // ─────────────────────────────── TAVR ───────────────────────────────
  tavr: {
    simple: {
      en: {
        done: [
          "Today you got a new aortic valve. It was placed inside your old, narrow valve.",
          "The doctor used a thin tube, most often in your groin. There was no open-heart surgery.",
        ],
        firstWeek: [
          "You may feel tired. This gets better each week.",
          "Weigh yourself each morning.",
          "Go to your check-up and your heart ultrasound.",
        ],
        wound: [
          "Keep the site dry for one day. Then you may shower.",
          "No baths, pools, or hot tubs for one week.",
          "If it bleeds, lie down and press hard on it for 10 minutes.",
        ],
        activity: [
          "Walk a little every day.",
          "Do not lift anything heavy for one week.",
          "Do not drive until your team says it is okay.",
        ],
        medicines: [
          "Take the blood thinner your team prescribed. Do not stop it without calling us.",
          "Tell your dentist you have a new valve. You may need an antibiotic first.",
        ],
        callUs: [
          "Your face droops, an arm or leg is weak, or you cannot talk well. Call 911.",
          "You have chest pain, new trouble breathing, or you faint. Call 911.",
          "The site bleeds and does not stop after 10 minutes of firm pressure. Call 911.",
          "Your heartbeat feels very slow or very fast.",
          "You gain weight fast, your legs swell, or you get a fever.",
        ],
      },
      es: {
        done: [
          "Hoy le pusieron una válvula aórtica nueva. Se colocó dentro de su válvula vieja y estrecha.",
          "El médico usó un tubo delgado, casi siempre por la ingle. No hubo cirugía de corazón abierto.",
        ],
        firstWeek: [
          "Puede sentir cansancio. Esto mejora cada semana.",
          "Pésese cada mañana.",
          "Vaya a su cita de control y a su ultrasonido del corazón.",
        ],
        wound: [
          "Mantenga el sitio seco un día. Luego puede ducharse.",
          "No use tina, piscina ni jacuzzi por una semana.",
          "Si sangra, acuéstese y apriete fuerte por 10 minutos.",
        ],
        activity: [
          "Camine un poco cada día.",
          "No levante nada pesado por una semana.",
          "No maneje hasta que su equipo le diga que puede.",
        ],
        medicines: [
          "Tome la medicina para diluir la sangre que le recetaron. No la deje sin llamarnos.",
          "Diga a su dentista que tiene una válvula nueva. Puede necesitar un antibiótico antes.",
        ],
        callUs: [
          "Se le cae un lado de la cara, tiene un brazo o una pierna débil, o le cuesta hablar. Llame al 911.",
          "Tiene dolor de pecho, le falta el aire o se desmaya. Llame al 911.",
          "El sitio sangra y no para después de 10 minutos de presión firme. Llame al 911.",
          "Siente el corazón muy lento o muy rápido.",
          "Sube de peso rápido, se le hinchan las piernas o tiene fiebre.",
        ],
      },
    },
    standard: {
      en: {
        done: [
          "Today you had a transcatheter aortic valve replacement (TAVR) to treat a narrowed aortic valve.",
          "A new valve was guided through a thin tube, usually from the groin, and expanded inside your old valve.",
        ],
        firstWeek: [
          "Fatigue is common at first; energy and breathing usually improve over the following weeks.",
          "Weigh yourself each morning, and keep your follow-up echocardiogram (heart ultrasound).",
        ],
        wound: [
          "Keep the site clean and dry for the first day, then shower; avoid baths, pools, and hot tubs for one week.",
          "If the site bleeds, lie down and apply firm pressure for 10 minutes.",
        ],
        activity: [
          "Walk daily, building up gradually.",
          "Avoid heavy lifting for one week, and do not drive until your care team says it is safe.",
        ],
        medicines: [
          "Take the blood thinner your team prescribed, and do not stop it without calling us.",
          "With an artificial valve you may need an antibiotic before dental work, so tell your dentist.",
        ],
        callUs: [
          "You notice stroke signs: face drooping, arm or leg weakness, or trouble speaking; call 911.",
          "You have chest pain, new or worse shortness of breath, or you faint; call 911.",
          "The access site bleeds and does not stop after 10 minutes of firm pressure; call 911.",
          "Your heartbeat feels unusually slow, fast, or irregular.",
          "You gain weight quickly, your legs swell, or you develop a fever.",
        ],
      },
      es: {
        done: [
          "Hoy le hicieron un reemplazo de válvula aórtica transcatéter (TAVR) para tratar una válvula aórtica estrecha.",
          "Se guió una válvula nueva por un tubo delgado, por lo general desde la ingle, y se expandió dentro de su válvula vieja.",
        ],
        firstWeek: [
          "Es común sentir cansancio al principio; la energía y la respiración suelen mejorar en las semanas siguientes.",
          "Pésese cada mañana y acuda a su ecocardiograma (ultrasonido del corazón) de control.",
        ],
        wound: [
          "Mantenga el sitio seco el primer día; luego dúchese, pero evite tina, piscina y jacuzzi durante una semana.",
          "Si el sitio sangra, acuéstese y presione con firmeza durante 10 minutos.",
        ],
        activity: [
          "Camine a diario y aumente poco a poco.",
          "Evite levantar peso durante una semana y no maneje hasta que su equipo le diga que es seguro.",
        ],
        medicines: [
          "Tome el medicamento para diluir la sangre que le recetaron y no lo suspenda sin llamarnos.",
          "Con una válvula artificial puede necesitar un antibiótico antes de un trabajo dental, así que avise a su dentista.",
        ],
        callUs: [
          "Nota señales de derrame cerebral: cara caída de un lado, debilidad en un brazo o una pierna, o dificultad para hablar; llame al 911.",
          "Tiene dolor de pecho, falta de aire nueva o peor, o se desmaya; llame al 911.",
          "El sitio de acceso sangra y no para después de 10 minutos de presión firme; llame al 911.",
          "Siente los latidos inusualmente lentos, rápidos o irregulares.",
          "Sube de peso rápidamente, se le hinchan las piernas o tiene fiebre.",
        ],
      },
    },
  },

  // ─────────────────────────────── PCI ────────────────────────────────
  pci: {
    simple: {
      en: {
        done: [
          "Today your doctor opened a narrow or blocked artery in your heart.",
          "A tiny balloon opened it. Then a stent, a small mesh tube, was left inside to hold it open.",
        ],
        firstWeek: [
          "You may feel tired for a few days. A bruise at the site is normal.",
          "Walk a little more each day.",
        ],
        wound: [
          "Keep the bandage dry for one day. Then you may shower.",
          "No baths, pools, or hot tubs for one week.",
          "If it bleeds, press hard on it for 10 minutes.",
        ],
        activity: [
          "Do not lift anything heavy for one week.",
          "If your wrist was used, rest that hand for a few days.",
          "Ask about cardiac rehab, an exercise class for your heart.",
        ],
        medicines: [
          "Your blood thinners keep the stent from clotting. Take them every day.",
          "Do not stop them without calling your heart doctor, even for dental work.",
        ],
        callUs: [
          "You have chest pain like before, or it does not go away with rest. Call 911.",
          "The site bleeds and does not stop after 10 minutes of firm pressure. Call 911.",
          "The bump at the site grows, or your hand or leg turns cold, pale, or numb.",
          "You get a fever, or redness or pus at the site.",
          "You faint, or you see black stool or blood in your urine.",
        ],
      },
      es: {
        done: [
          "Hoy su médico abrió una arteria del corazón que estaba estrecha o tapada.",
          "Un globo pequeño la abrió. Luego dejó un stent, un tubito de malla, para mantenerla abierta.",
        ],
        firstWeek: [
          "Puede sentir cansancio unos días. Un moretón en el sitio es normal.",
          "Camine un poco más cada día.",
        ],
        wound: [
          "Mantenga la venda seca un día. Luego puede ducharse.",
          "No use tina, piscina ni jacuzzi por una semana.",
          "Si sangra, apriete fuerte por 10 minutos.",
        ],
        activity: [
          "No levante nada pesado por una semana.",
          "Si entraron por la muñeca, descanse esa mano unos días.",
          "Pregunte por la rehabilitación cardíaca, una clase de ejercicio para su corazón.",
        ],
        medicines: [
          "Sus medicinas para diluir la sangre evitan coágulos en el stent. Tómelas todos los días.",
          "No las deje sin llamar a su cardiólogo, ni siquiera para un trabajo dental.",
        ],
        callUs: [
          "Tiene dolor de pecho como antes, o un dolor que no se quita con reposo. Llame al 911.",
          "El sitio sangra y no para después de 10 minutos de presión firme. Llame al 911.",
          "El bulto crece, o la mano o la pierna se pone fría, pálida o dormida.",
          "Tiene fiebre, o enrojecimiento o pus en el sitio.",
          "Se desmaya, o ve heces negras o sangre en la orina.",
        ],
      },
    },
    standard: {
      en: {
        done: [
          "Today you had a percutaneous coronary intervention (PCI) to open a narrowed heart artery.",
          "Through your wrist or groin, your doctor widened it with a balloon and placed a stent, a small mesh tube, to hold it open.",
        ],
        firstWeek: [
          "Mild soreness or bruising at the access site is normal for a few days.",
          "Rest today, then increase your walking gradually.",
        ],
        wound: [
          "Keep the dressing dry for the first day, then shower; avoid baths, pools, and hot tubs for one week.",
          "If the site bleeds, lie down and press firmly on or just above it for 10 minutes.",
        ],
        activity: [
          "Avoid heavy lifting for one week, and if your wrist was used, rest that hand for a few days.",
          "Ask about cardiac rehabilitation and when you may drive or return to work.",
        ],
        medicines: [
          "Antiplatelet blood thinners protect the new stent from clotting; take them every day as prescribed.",
          "Do not stop them, even for dental work or surgery, without talking to your cardiologist first.",
        ],
        callUs: [
          "You have chest pain or pressure like before, or pain that does not ease with rest; call 911.",
          "The access site bleeds and does not stop after 10 minutes of firm pressure; call 911.",
          "A lump at the site grows, or your hand or leg becomes cold, pale, or numb.",
          "You faint, feel very short of breath, or notice fever, drainage at the site, black stools, or blood in your urine.",
        ],
      },
      es: {
        done: [
          "Hoy le hicieron una intervención coronaria percutánea (ICP) para abrir una arteria del corazón estrecha.",
          "Por un tubo delgado en la muñeca o la ingle, su médico la amplió con un globo y colocó un stent, un tubito de malla, para mantenerla abierta.",
        ],
        firstWeek: [
          "Es normal tener algo de dolor o un moretón en el sitio de acceso durante unos días.",
          "Descanse hoy y luego camine un poco más cada día.",
        ],
        wound: [
          "Mantenga el vendaje seco el primer día; luego dúchese, pero evite tina, piscina y jacuzzi durante una semana.",
          "Si el sitio sangra, acuéstese y presione con firmeza sobre el sitio o justo encima durante 10 minutos.",
        ],
        activity: [
          "Evite levantar peso durante una semana y, si se usó la muñeca, descanse esa mano unos días.",
          "Pregunte por la rehabilitación cardíaca y cuándo puede manejar o volver al trabajo.",
        ],
        medicines: [
          "Sus antiagregantes plaquetarios (para diluir la sangre) protegen el stent de coágulos; tómelos todos los días.",
          "No los suspenda, ni siquiera para un trabajo dental o una cirugía, sin hablar antes con su cardiólogo.",
        ],
        callUs: [
          "Tiene dolor o presión en el pecho como antes, o que no se alivia con reposo; llame al 911.",
          "El sitio de acceso sangra y no para después de 10 minutos de presión firme; llame al 911.",
          "Un bulto en el sitio crece, o la mano o la pierna se pone fría, pálida o adormecida.",
          "Se desmaya, le falta mucho el aire, o nota fiebre, supuración en el sitio, heces negras o sangre en la orina.",
        ],
      },
    },
  },

  // ─────────────────────────────── LAAO ───────────────────────────────
  laao: {
    simple: {
      en: {
        done: [
          "Today you got a small device in your heart, such as the Watchman.",
          "It closes a pouch where clots form in AFib. This lowers your chance of a stroke.",
        ],
        firstWeek: [
          "You may feel tired for a few days. Your throat may be sore if a camera tube was used.",
          "Please go to your heart scan in the next few weeks.",
        ],
        wound: [
          "Keep the site dry for one day. Then you may shower.",
          "No baths, pools, or hot tubs for one week.",
          "If it bleeds, lie down and press hard on it for 10 minutes.",
        ],
        activity: [
          "Walk a little each day.",
          "Do not lift anything heavy for one week.",
          "Ask your team when you can drive.",
        ],
        medicines: [
          "Keep taking the blood thinner your team prescribed. They will tell you when to change it.",
          "Do not stop or change it on your own.",
        ],
        callUs: [
          "Your face droops, an arm or leg is weak, or you cannot talk well. Call 911.",
          "You have chest pain, trouble breathing, or you faint. Call 911.",
          "The site bleeds and does not stop after 10 minutes of firm pressure. Call 911.",
          "The bump in your groin grows, or your leg swells or hurts.",
          "You have a fever, black stool, or blood in your urine.",
        ],
      },
      es: {
        done: [
          "Hoy le pusieron un pequeño dispositivo en el corazón, como el Watchman.",
          "Cierra una bolsita donde se forman coágulos en la fibrilación auricular. Así baja el riesgo de un derrame cerebral.",
        ],
        firstWeek: [
          "Puede sentir cansancio unos días. La garganta puede doler si le pasaron un tubo con cámara.",
          "Por favor, vaya a su estudio del corazón en las próximas semanas.",
        ],
        wound: [
          "Mantenga el sitio seco un día. Luego puede ducharse.",
          "No use tina, piscina ni jacuzzi por una semana.",
          "Si sangra, acuéstese y apriete fuerte por 10 minutos.",
        ],
        activity: [
          "Camine un poco cada día.",
          "No levante nada pesado por una semana.",
          "Pregunte a su equipo cuándo puede manejar.",
        ],
        medicines: [
          "Siga tomando la medicina para diluir la sangre que le recetaron. Su equipo le dirá cuándo cambiarla.",
          "No la deje ni la cambie por su cuenta.",
        ],
        callUs: [
          "Se le cae un lado de la cara, tiene un brazo o una pierna débil, o le cuesta hablar. Llame al 911.",
          "Tiene dolor de pecho, le falta el aire o se desmaya. Llame al 911.",
          "El sitio sangra y no para después de 10 minutos de presión firme. Llame al 911.",
          "El bulto en la ingle crece, o la pierna se hincha o le duele.",
          "Tiene fiebre, heces negras o sangre en la orina.",
        ],
      },
    },
    standard: {
      en: {
        done: [
          "Today you had left atrial appendage occlusion (LAAO) with a device such as the Watchman.",
          "It seals a small heart pouch where most stroke-causing clots form in atrial fibrillation, and may later let you stop long-term blood thinners.",
        ],
        firstWeek: [
          "Mild groin soreness, tiredness, and sometimes a sore throat are normal for a few days.",
          "Keep your follow-up visits, including heart imaging in the coming weeks to check the seal.",
        ],
        wound: [
          "Keep the site dry for the first day, then shower; avoid baths, pools, and hot tubs for one week.",
          "If the site bleeds, lie down and apply firm pressure for 10 minutes.",
        ],
        activity: [
          "Walk daily, but avoid heavy lifting and strenuous exercise for one week.",
          "Ask your care team when you may drive.",
        ],
        medicines: [
          "You will stay on a blood-thinning plan while heart tissue grows over the device.",
          "Your team will change that plan when it is safe, usually after imaging; do not stop or change it on your own.",
        ],
        callUs: [
          "You notice stroke signs: face drooping, arm or leg weakness, or trouble speaking; call 911.",
          "You have chest pain, shortness of breath, or you faint; call 911.",
          "The groin site bleeds and does not stop after 10 minutes of firm pressure; call 911.",
          "A lump at the site grows, your leg swells, or you notice fever, black stools, or blood in your urine.",
        ],
      },
      es: {
        done: [
          "Hoy le hicieron un cierre de la orejuela auricular izquierda (LAAO) con un dispositivo como el Watchman.",
          "Sella una bolsita del corazón donde se forma la mayoría de los coágulos en la fibrilación auricular; más adelante puede permitirle dejar los anticoagulantes.",
        ],
        firstWeek: [
          "Es normal sentir cansancio, algo de dolor en la ingle y a veces dolor de garganta unos días.",
          "Acuda a sus citas de control, incluido un estudio de imagen del corazón en las próximas semanas.",
        ],
        wound: [
          "Mantenga el sitio seco el primer día; luego dúchese, pero evite tina, piscina y jacuzzi durante una semana.",
          "Si el sitio sangra, acuéstese y presione con firmeza durante 10 minutos.",
        ],
        activity: [
          "Camine a diario, pero evite levantar peso y el ejercicio intenso durante una semana.",
          "Pregunte a su equipo cuándo puede manejar.",
        ],
        medicines: [
          "Seguirá un plan de medicamentos para diluir la sangre mientras el tejido del corazón cubre el dispositivo.",
          "Su equipo cambiará ese plan cuando sea seguro, por lo general tras el estudio de imagen; no lo cambie por su cuenta.",
        ],
        callUs: [
          "Nota señales de derrame cerebral: cara caída de un lado, debilidad en un brazo o una pierna, o dificultad para hablar; llame al 911.",
          "Tiene dolor de pecho, falta de aire o se desmaya; llame al 911.",
          "El sitio de la ingle sangra y no para después de 10 minutos de presión firme; llame al 911.",
          "Un bulto en el sitio crece, la pierna se hincha, o nota fiebre, heces negras o sangre en la orina.",
        ],
      },
    },
  },

  // ─────────────────────────────── TEER ───────────────────────────────
  teer: {
    simple: {
      en: {
        done: [
          "Today your doctor put a small clip, such as a MitraClip, on your leaky mitral valve.",
          "This helps the valve close better. There was no open-heart surgery.",
        ],
        firstWeek: [
          "You may feel tired. Your breathing may get better over the next few weeks.",
          "Weigh yourself each morning.",
        ],
        wound: [
          "Keep the site dry for one day. Then you may shower.",
          "No baths, pools, or hot tubs for one week.",
          "If it bleeds, lie down and press hard on it for 10 minutes.",
        ],
        activity: [
          "Walk a little every day.",
          "Do not lift anything heavy for one week.",
          "Do not drive until your team says it is okay.",
        ],
        medicines: [
          "Keep taking your heart medicines. Your water pill may change, so follow your new list.",
          "Do not stop a blood thinner without calling us.",
          "Tell your dentist about the clip. You may need an antibiotic first.",
        ],
        callUs: [
          "You have new or worse trouble breathing, or you cannot lie flat. Call us right away.",
          "You have chest pain or you faint. Call 911.",
          "Your face droops, an arm or leg is weak, or you cannot talk well. Call 911.",
          "The site bleeds and does not stop after 10 minutes of firm pressure. Call 911.",
          "You gain weight fast, your legs swell, or you get a fever.",
        ],
      },
      es: {
        done: [
          "Hoy su médico puso un pequeño clip, como el MitraClip, en su válvula mitral, que goteaba.",
          "Esto ayuda a que la válvula cierre mejor. No hubo cirugía de corazón abierto.",
        ],
        firstWeek: [
          "Puede sentir cansancio. Su respiración puede mejorar en las próximas semanas.",
          "Pésese cada mañana.",
        ],
        wound: [
          "Mantenga el sitio seco un día. Luego puede ducharse.",
          "No use tina, piscina ni jacuzzi por una semana.",
          "Si sangra, acuéstese y apriete fuerte por 10 minutos.",
        ],
        activity: [
          "Camine un poco cada día.",
          "No levante nada pesado por una semana.",
          "No maneje hasta que su equipo le diga que puede.",
        ],
        medicines: [
          "Siga tomando sus medicinas del corazón. Su pastilla para orinar puede cambiar, así que siga su lista nueva.",
          "No deje una medicina para diluir la sangre sin llamarnos.",
          "Diga a su dentista que tiene un clip. Puede necesitar un antibiótico antes.",
        ],
        callUs: [
          "Le falta el aire más que antes, o no puede respirar bien al acostarse. Llámenos de inmediato.",
          "Tiene dolor de pecho o se desmaya. Llame al 911.",
          "Se le cae un lado de la cara, tiene un brazo o una pierna débil, o le cuesta hablar. Llame al 911.",
          "El sitio sangra y no para después de 10 minutos de presión firme. Llame al 911.",
          "Sube de peso rápido, se le hinchan las piernas o tiene fiebre.",
        ],
      },
    },
    standard: {
      en: {
        done: [
          "Today you had transcatheter edge-to-edge repair (TEER) to reduce leakage of your mitral valve.",
          "Through a groin vein, your doctor attached one or more clips, such as the MitraClip, to help the valve close.",
        ],
        firstWeek: [
          "Fatigue is common at first, and breathing often improves over the following weeks.",
          "Weigh yourself each morning; sudden weight gain can signal fluid buildup.",
        ],
        wound: [
          "Keep the site dry for the first day, then shower; avoid baths, pools, and hot tubs for one week.",
          "If the site bleeds, lie down and apply firm pressure for 10 minutes.",
        ],
        activity: [
          "Walk daily as your breathing allows, but avoid heavy lifting for one week.",
          "Do not drive until your care team says it is safe.",
        ],
        medicines: [
          "Continue your heart medicines; your water pill (diuretic) may have changed, so follow the updated list.",
          "Do not stop any blood thinner without calling us, and tell your dentist: you may need an antibiotic first.",
        ],
        callUs: [
          "Your shortness of breath returns or worsens, or you cannot lie flat; call us the same day, or 911 if severe.",
          "You have chest pain, you faint, or you have stroke signs such as face drooping or trouble speaking; call 911.",
          "The access site bleeds and does not stop after 10 minutes of firm pressure; call 911.",
          "You gain weight quickly, your legs swell, you develop a fever, or a lump at the site grows.",
        ],
      },
      es: {
        done: [
          "Hoy le hicieron una reparación transcatéter borde a borde (TEER) para reducir la fuga de su válvula mitral.",
          "Por una vena de la ingle, su médico colocó uno o más clips, como el MitraClip, para que la válvula cierre mejor.",
        ],
        firstWeek: [
          "Es común sentir cansancio al principio, y la respiración suele mejorar en las semanas siguientes.",
          "Pésese cada mañana; subir de peso de repente puede indicar acumulación de líquido.",
        ],
        wound: [
          "Mantenga el sitio seco el primer día; luego dúchese, pero evite tina, piscina y jacuzzi durante una semana.",
          "Si el sitio sangra, acuéstese y presione con firmeza durante 10 minutos.",
        ],
        activity: [
          "Camine a diario según lo permita su respiración, pero evite levantar peso durante una semana.",
          "No maneje hasta que su equipo le diga que es seguro.",
        ],
        medicines: [
          "Continúe sus medicamentos del corazón; quizá ajustaron su diurético (pastilla para orinar), así que siga la lista actualizada.",
          "No suspenda ningún anticoagulante sin llamarnos, y avise a su dentista: puede necesitar un antibiótico antes.",
        ],
        callUs: [
          "La falta de aire vuelve o empeora, o no puede respirar bien al acostarse; llámenos el mismo día, o al 911 si es grave.",
          "Tiene dolor de pecho, se desmaya o tiene señales de derrame cerebral, como la cara caída o dificultad para hablar; llame al 911.",
          "El sitio de acceso sangra y no para después de 10 minutos de presión firme; llame al 911.",
          "Sube de peso rápidamente, se le hinchan las piernas, tiene fiebre o crece un bulto en el sitio.",
        ],
      },
    },
  },

  // ──────────────────────── Radial cath (diagnostic) ────────────────────────
  radialcath: {
    simple: {
      en: {
        done: [
          "Today your doctor looked at your heart arteries with dye and X-rays.",
          "The thin tube went in through your wrist. This was a test, so no stent was placed.",
        ],
        firstWeek: [
          "Your wrist may be sore or bruised for a few days.",
          "Drink extra water today, unless you were told to limit fluids.",
          "Do not drive for at least one day.",
        ],
        wound: [
          "Keep the bandage dry for one day. Then you may shower.",
          "Do not soak your wrist for one week. No baths, pools, or hot tubs.",
          "If it bleeds, press hard on and just above the site for 10 minutes.",
        ],
        activity: [
          "For two days, do not lift, push, or pull anything heavy with that hand.",
          "Do not lean on that hand to get up.",
          "For one week, avoid hard sports and heavy work with that arm.",
        ],
        medicines: [
          "Keep taking your usual medicines, including any blood thinner, unless your team says to change them.",
          "If a medicine was paused because of the dye, restart it only when your team says to.",
        ],
        callUs: [
          "The site bleeds and does not stop after 10 minutes of firm pressure. Call 911.",
          "Your hand turns cold, pale, blue, or numb.",
          "The bump at your wrist grows or gets very painful.",
          "You have chest pain or you faint. Call 911.",
          "You get a fever, or the site gets red, hot, or has pus.",
        ],
      },
      es: {
        done: [
          "Hoy su médico revisó las arterias de su corazón con un tinte y rayos X.",
          "El tubo delgado entró por la muñeca. Fue un estudio, así que no se puso ningún stent.",
        ],
        firstWeek: [
          "La muñeca puede doler o tener un moretón unos días.",
          "Tome más agua hoy, a menos que le hayan dicho que limite los líquidos.",
          "No maneje por lo menos durante un día.",
        ],
        wound: [
          "Mantenga la venda seca un día. Luego puede ducharse.",
          "No meta la muñeca en agua por una semana. Nada de tina, piscina ni jacuzzi.",
          "Si sangra, apriete fuerte sobre el sitio y justo encima por 10 minutos.",
        ],
        activity: [
          "Por dos días, no levante, empuje ni jale nada pesado con esa mano.",
          "No se apoye en esa mano para levantarse.",
          "Por una semana, evite deportes fuertes y trabajo pesado con ese brazo.",
        ],
        medicines: [
          "Siga con sus medicinas de siempre, incluso las que diluyen la sangre, salvo que su equipo le diga otra cosa.",
          "Si le pausaron una medicina por el tinte, vuelva a tomarla solo cuando su equipo lo indique.",
        ],
        callUs: [
          "El sitio sangra y no para después de 10 minutos de presión firme. Llame al 911.",
          "La mano se pone fría, pálida, azul o dormida.",
          "El bulto en la muñeca crece o duele mucho.",
          "Tiene dolor de pecho o se desmaya. Llame al 911.",
          "Tiene fiebre, o el sitio se pone rojo, caliente o tiene pus.",
        ],
      },
    },
    standard: {
      en: {
        done: [
          "Today you had a diagnostic cardiac catheterization (coronary angiogram) to look for narrowed heart arteries.",
          "A thin tube was passed through your wrist and X-ray dye was used to take pictures; no stent was placed.",
        ],
        firstWeek: [
          "Mild wrist soreness or bruising is common and fades over several days.",
          "Drink extra fluids today unless you have been told to limit them, and do not drive for at least one day.",
        ],
        wound: [
          "Keep the dressing dry for the first day, then shower; avoid soaking the wrist in a bath, pool, or hot tub for one week.",
          "If the site bleeds, press firmly on and just above it for 10 minutes.",
        ],
        activity: [
          "For two days, do not lift, push, or pull anything heavy with that hand, or lean on it to stand.",
          "For one week, avoid strenuous use of that arm, such as racquet sports, golf, or yard work.",
        ],
        medicines: [
          "Continue your usual medicines, including any blood thinner, unless your care team said otherwise.",
          "If a medicine was paused because of the contrast dye, restart it only when your team says to.",
        ],
        callUs: [
          "The wrist bleeds and does not stop after 10 minutes of firm pressure; call 911.",
          "Your hand becomes cold, pale, blue, or numb.",
          "The lump at the site grows or becomes very painful, or you develop a fever or drainage there.",
          "You have chest pain or pressure, or you faint; call 911.",
        ],
      },
      es: {
        done: [
          "Hoy le hicieron un cateterismo cardíaco diagnóstico (angiografía coronaria) para buscar arterias del corazón estrechas.",
          "Se pasó un tubo delgado por la muñeca y se usó un tinte de rayos X para tomar imágenes; no se colocó ningún stent.",
        ],
        firstWeek: [
          "Es común tener algo de dolor o un moretón en la muñeca, que desaparece en varios días.",
          "Tome más líquidos hoy, a menos que le hayan indicado limitarlos, y no maneje durante al menos un día.",
        ],
        wound: [
          "Mantenga el vendaje seco el primer día; luego dúchese, pero no sumerja la muñeca en tina, piscina o jacuzzi durante una semana.",
          "Si el sitio sangra, presione con firmeza sobre el sitio y justo encima durante 10 minutos.",
        ],
        activity: [
          "Durante dos días, no levante, empuje ni jale objetos pesados con esa mano, ni se apoye en ella para levantarse.",
          "Durante una semana, evite el esfuerzo intenso con ese brazo, como deportes de raqueta, golf o trabajos de jardín.",
        ],
        medicines: [
          "Continúe sus medicamentos habituales, incluido cualquier medicamento para diluir la sangre, a menos que su equipo le indique otra cosa.",
          "Si le pausaron un medicamento por el tinte de contraste, vuelva a tomarlo solo cuando su equipo lo indique.",
        ],
        callUs: [
          "La muñeca sangra y no para después de 10 minutos de presión firme; llame al 911.",
          "La mano se pone fría, pálida, azul o adormecida.",
          "El bulto en el sitio crece o duele mucho, o tiene fiebre o supuración en el sitio.",
          "Tiene dolor o presión en el pecho, o se desmaya; llame al 911.",
        ],
      },
    },
  },
}

export interface HandoutSection {
  id: SectionId
  heading: string
  items: readonly string[]
}

export interface Handout {
  procedure: ProcedureId
  level: Level
  lang: Lang
  title: string
  caption: string
  sections: HandoutSection[]
  closing: string
}

export function getHandout(procedure: ProcedureId, level: Level, lang: Lang): Handout {
  const body = CONTENT[procedure][level][lang]
  return {
    procedure,
    level,
    lang,
    title: PROCEDURE_TITLES[lang][procedure],
    caption: `${LEVEL_NAMES[lang][level]} · ${LANG_NAMES[lang]}`,
    sections: SECTION_ORDER.map((id) => ({ id, heading: SECTION_HEADINGS[lang][id], items: body[id] })),
    closing: CLOSING[lang],
  }
}

/** Plain-text version of a handout, used for share / copy. Ends with the closing line. */
export function handoutText(h: Handout): string {
  const parts = [`${h.title}\n${h.caption}`]
  for (const s of h.sections) {
    const body = s.id === 'done' ? s.items.join(' ') : s.items.map((i) => `• ${i}`).join('\n')
    parts.push(`${s.heading}\n${body}`)
  }
  parts.push(h.closing)
  return parts.join('\n\n')
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

/** Sentences in the handout body (section items only; headings, title and closing excluded). */
export function bodySentences(h: Handout): string[] {
  return h.sections
    .flatMap((s) => s.items)
    .flatMap((item) => item.split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean)
}

export function averageSentenceLength(h: Handout): number {
  const sentences = bodySentences(h)
  return sentences.reduce((n, s) => n + wordCount(s), 0) / sentences.length
}
