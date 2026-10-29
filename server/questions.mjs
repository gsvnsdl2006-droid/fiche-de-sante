// Exact bilingual questions supplied by the group; no member responses.
export default [
  {
    "id": "unit",
    "section": "Identification",
    "question": "Choisissez l'unité du membre",
    "type": "select",
    "options": [
      "Meute - Louveteaux",
      "Troupe - Eclaireurs",
      "Clan - Pionners"
    ]
  },
  {
    "id": "lastName",
    "section": "Identification",
    "question": "Nom",
    "arabic": "الشهرة",
    "type": "text"
  },
  {
    "id": "firstName",
    "section": "Identification",
    "question": "Prénom",
    "arabic": "الإسم",
    "type": "text"
  },
  {
    "id": "father",
    "section": "Identification",
    "question": "Nom du père et Numéro du téléphone",
    "type": "text"
  },
  {
    "id": "mother",
    "section": "Identification",
    "question": "Nom de la mère et Numéro du téléphone",
    "type": "text"
  },
  {
    "id": "birth",
    "section": "Identification",
    "question": "Date de naissance",
    "arabic": "تاريخ الولادة",
    "type": "text",
    "placeholder": "JJ/MM/AAAA"
  },
  {
    "id": "birthplace",
    "section": "Identification",
    "question": "Lieu de naissance",
    "arabic": "مكان الولادة",
    "type": "text"
  },
  {
    "id": "address",
    "section": "Identification",
    "question": "Adresse",
    "arabic": "العنوان",
    "type": "textarea"
  },
  {
    "id": "blood",
    "section": "Identification",
    "question": "Groupe sanguin",
    "arabic": "فئة الدم",
    "type": "select",
    "options": [
      "O+",
      "O-",
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "Je ne sais pas"
    ]
  },
  {
    "id": "doctor",
    "section": "Identification",
    "question": "Nom et numéro du médecin traitant",
    "arabic": "إسم ورقم هاتف الطبيب المعالج",
    "type": "text"
  },
  {
    "id": "diphtheria",
    "section": "Vaccins",
    "question": "Dyphtérie",
    "type": "text",
    "placeholder": "Date ou information du carnet de santé"
  },
  {
    "id": "polio",
    "section": "Vaccins",
    "question": "Poliomyélite",
    "type": "text",
    "placeholder": "Date ou information du carnet de santé"
  },
  {
    "id": "dtpolio",
    "section": "Vaccins",
    "question": "Ou DT polio",
    "type": "text"
  },
  {
    "id": "tetracoq",
    "section": "Vaccins",
    "question": "Ou DT Tétracoq",
    "type": "text"
  },
  {
    "id": "bcg",
    "section": "Vaccins",
    "question": "BCG",
    "type": "text"
  },
  {
    "id": "hepatitis",
    "section": "Vaccins",
    "question": "Date de : Hépatite B",
    "type": "text",
    "placeholder": "JJ/MM/AAAA ou inconnu"
  },
  {
    "id": "whooping",
    "section": "Vaccins",
    "question": "Date de : Coqueluche",
    "type": "text",
    "placeholder": "JJ/MM/AAAA ou inconnu"
  },
  {
    "id": "mmr",
    "section": "Vaccins",
    "question": "Date de : Rubéole - Oreillon - Rougeole",
    "type": "text"
  },
  {
    "id": "flu",
    "section": "Vaccins",
    "question": "Grippe",
    "type": "yesno"
  },
  {
    "id": "covid",
    "section": "Vaccins",
    "question": "Covid-19",
    "type": "yesno"
  },
  {
    "id": "tetanus",
    "section": "Vaccins",
    "question": "Date du dernier rappel du vaccin antitétanique",
    "arabic": "تاريخ إجراء التذكير الأخير للّقاح ضد الكزاز",
    "type": "text"
  },
  {
    "id": "allergy",
    "section": "Allergies",
    "question": "Votre enfant présente une allergie ?",
    "arabic": "هل يعاني الولد من أي حساسيّة؟",
    "type": "yesno"
  },
  {
    "id": "allergyType",
    "section": "Allergies",
    "question": "De quel type et Produit allergisant",
    "arabic": "نوع الحساسية - مسبّب الحساسية",
    "type": "textarea",
    "when": "allergy"
  },
  {
    "id": "allergyAction",
    "section": "Allergies",
    "question": "Précisez la conduite à tenir",
    "arabic": "طريقة التصرّف",
    "type": "textarea",
    "when": "allergy"
  },
  {
    "id": "takesMedication",
    "section": "Médicaments",
    "question": "Votre enfant prend un médicament ?",
    "arabic": "هل يتابع ولدكم علاج صحي معيّن؟",
    "type": "yesno"
  },
  {
    "id": "treatmentStart",
    "section": "Médicaments",
    "question": "Date début traitement",
    "arabic": "تاريخ البدء بالعلاج",
    "type": "text",
    "when": "takesMedication"
  },
  {
    "id": "treatmentEnd",
    "section": "Médicaments",
    "question": "Date fin traitement",
    "arabic": "تاريخ إنتهاء العلاج",
    "type": "text",
    "when": "takesMedication"
  },
  {
    "id": "medication",
    "section": "Médicaments",
    "question": "Médicament",
    "arabic": "الدواء",
    "type": "text",
    "when": "takesMedication"
  },
  {
    "id": "dosage",
    "section": "Médicaments",
    "question": "Posologie",
    "arabic": "الجرعة وطريقة الإستعمال",
    "type": "textarea",
    "when": "takesMedication"
  },
  {
    "id": "schedule",
    "section": "Médicaments",
    "question": "Horaire",
    "arabic": "الأوقات",
    "type": "text",
    "when": "takesMedication"
  },
  {
    "id": "medicationNotes",
    "section": "Médicaments",
    "question": "Observations",
    "arabic": "ملاحظات",
    "type": "textarea",
    "when": "takesMedication"
  },
  {
    "id": "followup",
    "section": "Suivi",
    "question": "Votre enfant est suivi en orthophonie, psychomotricité, psychologie, psychiatrie, ... ?",
    "arabic": "هل طفلكم مُتابَع في علاج النطق واللّغة أو علاج الحسي الحركي أو علاج نفسي ... ؟",
    "type": "yesno"
  },
  {
    "id": "followupType",
    "section": "Suivi",
    "question": "Suivi en :",
    "type": "textarea",
    "when": "followup"
  },
  {
    "id": "followupNotes",
    "section": "Suivi",
    "question": "Remarques",
    "arabic": "ملاحظات",
    "type": "textarea",
    "when": "followup"
  },
  {
    "id": "sports",
    "section": "Autres informations",
    "question": "Y a-t-il des activités sportives que votre enfant doit éviter ?",
    "arabic": "هل من نشاط رياضي ينبغي على الولد تجنبه ؟",
    "type": "yesno"
  },
  {
    "id": "sportsDetails",
    "section": "Autres informations",
    "question": "Si oui, précisez",
    "arabic": "في حال الابجاب بنعم, الرجاء التحديد",
    "type": "textarea",
    "when": "sports"
  },
  {
    "id": "diet",
    "section": "Autres informations",
    "question": "Y a-t-il un régime alimentaire que votre enfant doit suivre ?",
    "arabic": "هل من حمية غذائية معيّنة ينبغي على الولد إتّباعها ؟",
    "type": "yesno"
  },
  {
    "id": "dietDetails",
    "section": "Autres informations",
    "question": "Si oui, précisez",
    "arabic": "في حال الابجاب بنعم, الرجاء التحديد",
    "type": "textarea",
    "when": "diet"
  },
  {
    "id": "guardian",
    "section": "Autorisation du responsable légal",
    "question": "Autorisation et Consentement du responsable legal",
    "arabic": "أنا الموّقع(ة) أدناه____________ أؤكد صحة المعلومات الواردة في هذا السجل و دقّتها",
    "type": "text",
    "placeholder": "Nom du responsable légal"
  }
];
