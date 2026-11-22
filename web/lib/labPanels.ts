// Lab panel catalog for the web account Lab tab.
// Names and markers come from the live lab catalog; prices are set
// separately and are never stored here. No provider names appear.

export interface LabPanel {
  id: string;
  name: string;
  description: string;
  markerCount: number;
  markers: string[];
  collection: string;
}

export const LAB_PANELS: LabPanel[] = [
  {
    id: "35f330ca-8a5b-4caf-9cfe-1827539303f0",
    name: "Athletic Performance Panel",
    description: "Training readiness and recovery: blood counts, metabolic panel, iron stores, vitamin D, testosterone, inflammation, and muscle enzymes.",
    markerCount: 7,
    markers: ["CBC (H/H, RBC, Indices, WBC, Plt)", "Comprehensive Metabolic Panel", "Ferritin", "Cardio IQ  Vitamin D, 25-Hydroxy", "Testosterone, Total, MS", "hs-CRP", "Creatine Kinase (CK), Total"],
    collection: "Walk in blood draw",
  },
  {
    id: "38c76039-05dc-4cd3-8475-7a675989fbf2",
    name: "Baseline Wellness Panel",
    description: "Full-body starting point: blood counts, metabolic health, cholesterol, blood sugar, vitamin D, and thyroid.",
    markerCount: 6,
    markers: ["CBC (H/H, RBC, Indices, WBC, Plt)", "Comprehensive Metabolic Panel", "Lipid Panel, Standard", "Hemoglobin A1c", "Cardio IQ  Vitamin D, 25-Hydroxy", "TSH"],
    collection: "Walk in blood draw",
  },
  {
    id: "07aae08c-fb68-4b2c-9a7f-d5dcaeec2960",
    name: "Energy & Fatigue Panel",
    description: "The usual suspects behind low energy: iron stores and transport, B12, folate, vitamin D, thyroid, and blood counts.",
    markerCount: 6,
    markers: ["Vitamin B12 (Cobalamin)", "Folate, RBC", "Cardio IQ  Vitamin D, 25-Hydroxy", "TSH", "CBC (H/H, RBC, Indices, WBC, Plt)", "Iron, TIBC and Ferritin Panel"],
    collection: "Walk in blood draw",
  },
  {
    id: "9b31a524-40e9-4ae9-86a0-943c4c1234f3",
    name: "Female Baseline Panel",
    description: "A focused panel of 14 markers, listed in full below.",
    markerCount: 14,
    markers: ["hs-CRP", "Comprehensive Metabolic Panel", "Testosterone, Total, MS", "Estradiol, Ultrasensitive, LC/MS", "TSH", "Hemoglobin A1c", "Lipid Panel, Standard", "CBC (includes Differential and Platelets)", "Cbc Morphology", "Cbc Morphology", "Platelet Estimation", "Platelet Estimation", "Differential, Manual", "Differential, Manual"],
    collection: "Walk in blood draw",
  },
  {
    id: "e7ab67c4-90fa-4952-98ca-e282a51e1540",
    name: "GLP1 Panel",
    description: "A focused panel of 10 markers, listed in full below.",
    markerCount: 10,
    markers: ["Comprehensive Metabolic Panel", "Hemoglobin A1c", "Lipid Panel, Standard", "CBC (includes Differential and Platelets)", "Cbc Morphology", "Cbc Morphology", "Platelet Estimation", "Platelet Estimation", "Differential, Manual", "Differential, Manual"],
    collection: "Walk in blood draw",
  },
  {
    id: "e6aa5d0c-2ace-4aab-a220-bcc673302e83",
    name: "Heart Health Panel",
    description: "Cardiovascular risk beyond basic cholesterol: lipids, ApoB, Lp(a), hs-CRP, and homocysteine.",
    markerCount: 5,
    markers: ["Lipid Panel, Standard", "Apolipoprotein B", "Lipoprotein (a)", "hs-CRP", "Homocysteine"],
    collection: "Walk in blood draw",
  },
  {
    id: "fc3295a1-3b0f-40ca-9a88-6f5aa9219656",
    name: "Longevity Panel",
    description: "Comprehensive annual deep-dive across metabolic, cardiovascular, inflammatory, and hormonal health markers.",
    markerCount: 11,
    markers: ["CBC (H/H, RBC, Indices, WBC, Plt)", "Comprehensive Metabolic Panel", "Lipid Panel, Standard", "Hemoglobin A1c", "Insulin", "hs-CRP", "Apolipoprotein B", "Cardio IQ  Vitamin D, 25-Hydroxy", "Homocysteine", "Ferritin", "TSH"],
    collection: "Walk in blood draw",
  },
  {
    id: "b909fb21-b264-483c-a915-4ce87713cfa9",
    name: "Male Baseline Test",
    description: "A focused panel of 12 markers, listed in full below.",
    markerCount: 12,
    markers: ["hs-CRP", "Comprehensive Metabolic Panel", "PSA, Free and Total", "Testosterone, Free, Bioavailable and Total, Males (Adult), Immunoassay", "Lipid Panel, Standard", "CBC (includes Differential and Platelets)", "Cbc Morphology", "Cbc Morphology", "Platelet Estimation", "Platelet Estimation", "Differential, Manual", "Differential, Manual"],
    collection: "Walk in blood draw",
  },
  {
    id: "c1d6b276-e42a-48dd-81c4-ca9e87f2b979",
    name: "Male TRT Panel",
    description: "A focused panel of 16 markers, listed in full below.",
    markerCount: 16,
    markers: ["Testosterone, Free, Bioavailable and Total, MS", "Comprehensive Metabolic Panel", "PSA, Free and Total", "T3, Free", "Sex Hormone Binding Globulin (SHBG)", "Estradiol, Ultrasensitive, LC/MS", "FSH and LH", "TSH", "T4 Free (FT4)", "CBC (includes Differential and Platelets)", "Cbc Morphology", "Cbc Morphology", "Platelet Estimation", "Platelet Estimation", "Differential, Manual", "Differential, Manual"],
    collection: "Walk in blood draw",
  },
  {
    id: "abfabb68-c777-4457-87c2-46bf5fe26d81",
    name: "Men's Hormone Panel",
    description: "Male hormone status: total testosterone, SHBG, estradiol, LH, and FSH.",
    markerCount: 4,
    markers: ["Testosterone, Total, MS", "Sex Hormone Binding Globulin (SHBG)", "Estradiol", "FSH and LH"],
    collection: "Walk in blood draw",
  },
  {
    id: "f12fe316-367a-4c53-9735-8c0129c45506",
    name: "Metabolic Health Panel",
    description: "Blood sugar control and metabolic risk: A1c, fasting insulin, cholesterol, and a full metabolic panel.",
    markerCount: 4,
    markers: ["Hemoglobin A1c", "Insulin", "Lipid Panel, Standard", "Comprehensive Metabolic Panel"],
    collection: "Walk in blood draw",
  },
  {
    id: "c06548bc-d5c3-42ed-904d-9dd3c935444a",
    name: "Stress & Recovery Panel",
    description: "Stress load and recovery capacity: cortisol, DHEA-S, thyroid, and inflammation.",
    markerCount: 4,
    markers: ["Cortisol, Total", "DHEA Sulfate, Immunoassay", "TSH", "hs-CRP"],
    collection: "Walk in blood draw",
  },
  {
    id: "1760616d-44d3-4654-817d-440a969e5cdf",
    name: "Thyroid Complete Panel",
    description: "Complete thyroid workup: TSH, free T4, free T3, and TPO antibodies.",
    markerCount: 3,
    markers: ["Tsh+Free T4", "T3, Free", "Thyroid Peroxidase Antibodies (TPO)"],
    collection: "Walk in blood draw",
  },
  {
    id: "8034d779-bafe-491f-ad95-7aa9c4cd0fb5",
    name: "Women's Hormone Panel",
    description: "Female hormone status: estradiol, progesterone, FSH, LH, DHEA-S, and testosterone.",
    markerCount: 5,
    markers: ["Estradiol", "Progesterone, LC/MS", "FSH and LH", "DHEA Sulfate, Immunoassay", "Testosterone, Total, MS"],
    collection: "Walk in blood draw",
  },
];
