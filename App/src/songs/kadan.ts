import { parseNotation } from '../core/parser';
import type { Instrument, Song } from '../core/model';
import { ensembleSection, ensembleTracks } from './ensemble';

// Complete arrangement from Assets/Songs/Kadan.cs.
const pattern = (name: string, raw: string, instrument: Instrument) =>
  parseNotation(raw, { name, instrument, subdivisions: 3 });

const patterns = {
  djembeCall: pattern("Call", "m.o2o2O.1O O1.1O O1.1O O1.1. m", 'djembe'),
  djembeWait: pattern("Wait", "m.1.1. .1.1. .1.1. .1.1. m", 'djembe'),
  djembeEchauffement: pattern("Call", "mO1O1O X1X1X O1O1O X1X1X m", 'djembe'),
  djembeEchauffementEnd: pattern("Call end", "mO1O1O X1X1X O1O1O X1.1. m", 'djembe'),
  djembeIntroBreak: pattern("Intro break", "mX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. .1.1. m", 'djembe'),
  djembeBreak: pattern("Break", "mX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1O .1O1. X1X1X mX1.1O .1O1. X1X1X X1.1O m\r\nm.1X1. O1.1X .1O1. X1X1X mX1.1O .1O1. .iXR1.1. .1.1. m", 'djembe'),
  djembeAccompany1: pattern("Accompany 1", "m>X1.1O X1.1. X1.1O X1.1B <m", 'djembe'),
  djembeAccompany2: pattern("Accompany 2", "m>X1.1. X1O1O X1.1B X1O1O <m", 'djembe'),
  djembeAccompany2End: pattern("Accompany 2 end", "m>X1.1. X1O1O X1.1B X1.1. <m", 'djembe'),
  djembeSolo1: pattern("Solo 1", "m.1.1. .1.1. .1.1. .1Or1Ol mxr2xl2Xr1Xl Xr1.1. .1.1. .1Or1Ol m\r\nmxr2xl2Xr1Xl Xr1.1. .1.1. .1Or1Ol mxr2xl2Xr1Xl xr2xl2Xr1Xl xr2xl2Xr1Xl .1Or1Ol m\r\nmxr2xl2Xr1Xl Xr1.1. .1.1. .1.1. m", 'djembe'),
  djembeSolo2: pattern("Solo 2", "m.1.1. .1.1. .1.1. .1.1Xl mor2ol2Or1Ol Or1Xl1. .1.1. .1.1Xl m\r\nmor2ol2Or1Ol Or1Xl1. .1.1. .1.1. m", 'djembe'),
  djembeSolo3: pattern("Solo 3", "mor2ol2Or1Xl or2ol2Or1X Xr1Xl1. Xl1Xr1Xl m.1.1. .1.1. .1.1. .1.1. m", 'djembe'),
  djembeSolo4: pattern("Solo 4", "m.1.1. .1.1. .1.1. .1Xr1Xl mOr1Ol1. .1Xr1Xl Or1Ol1. .1Xr1Xl m\r\nmOr1Ol1. .1Xr1Xl Or1Ol1. .1.1. m", 'djembe'),
  dununbaIntroBreak: pattern("Dununba Intro break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1vO vO1.1vO vO1.1. m", 'dununba'),
  dununbaBreak: pattern("Dununba Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nm.1.1. .1.1vO .1vO1. .1.1. m.1.1vO .1vO1. .1.1. .1.1vO m\r\nm.1.1. vO1.1. .1vO1. .1.1. m.1.1vO .1vO1. vO1.1. .1.1. m", 'dununba'),
  dununbaWait: pattern("Kenkeni Wait", "m.1.1. .1.1. .1.1. .1.1. m", 'dununba'),
  dununba: pattern("Dununba Base", "m>v.1.1v v1.1vO vO1.1vO vO1.1v. <m", 'dununba'),
  kenkeniIntroBreak: pattern("Kenkeni Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1. .1.1. .1.1. m", 'kenkeni'),
  kenkeniBreak: pattern("Kenkeni Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. .1.1. vO1vO1vO mvO1.1. .1.1. vO1vO1vO vO1.1. m\r\nm.1vO1. .1.1vO .1.1. vO1vO1vO mvO1.1 .1.1. vO1.1. .1.1. m", 'kenkeni'),
  kenkeni: pattern("Kenkeni Base", "m>.1v.1vO .1vO1vO .1v.1vO .1vO1vO <m", 'kenkeni'),
  sangbanIntroBreak: pattern("Sangban Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1. .1.1. .1.1. m", 'sangban'),
  sangbanBreak: pattern("Sangban Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. .1.1. vO1vO1vO mvO1.1. .1.1. vO1vO1vO vO1.1. m\r\nm.1vO1. .1.1vO .1.1. vO1vO1vO mvO1.1 .1.1. vO1.1. .1.1. m", 'sangban'),
  sangbanWait: pattern("Kenkeni Wait", "m.1.1. .1.1. .1.1. .1.1. m", 'sangban'),
  sangban: pattern("Sangban Base", "m>vO1.1v. vX1.1v. vO1.1v. vX1.1v. <m", 'sangban'),
};

export const kadan: Song = {
  id: 'kadan', name: 'Kadan', bpm: 100, beatsPerMeasure: 4,
  description: "An extended introduction, four solos, and the complete break sequence.",
  tracks: ensembleTracks(),
  sections: [
    ensembleSection('section-01', "Opening call", 1, { lead: patterns.djembeCall }),
    ensembleSection('section-02', "Intro break", 1, { lead: patterns.djembeIntroBreak, accompaniment: patterns.djembeIntroBreak, kenkeni: patterns.kenkeniIntroBreak, sangban: patterns.sangbanIntroBreak, dununba: patterns.dununbaIntroBreak }),
    ensembleSection('section-03', "Accompany 2", 4, { lead: patterns.djembeAccompany2, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-04', "Accompany 2 end", 1, { lead: patterns.djembeAccompany2End, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-05', "Call", 1, { lead: patterns.djembeCall, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-06', "Échauffement", 4, { lead: patterns.djembeEchauffement, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-07', "Échauffement ending", 1, { lead: patterns.djembeEchauffementEnd, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-08', "Call", 1, { lead: patterns.djembeCall, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-09', "Break", 1, { lead: patterns.djembeBreak, accompaniment: patterns.djembeBreak, kenkeni: patterns.kenkeniBreak, sangban: patterns.sangbanBreak, dununba: patterns.dununbaBreak }),
    ensembleSection('section-10', "Rest", 1, { lead: patterns.djembeWait, accompaniment: patterns.djembeWait, kenkeni: patterns.kenkeni, sangban: patterns.sangbanWait, dununba: patterns.dununbaWait }),
    ensembleSection('section-11', "Solo 1", 2, { lead: patterns.djembeSolo1, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-12', "Solo 2", 2, { lead: patterns.djembeSolo2, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-13', "Solo 3", 4, { lead: patterns.djembeSolo3, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-14', "Solo 4", 2, { lead: patterns.djembeSolo4, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-15', "Échauffement", 4, { lead: patterns.djembeEchauffement, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-16', "Échauffement ending", 1, { lead: patterns.djembeEchauffementEnd, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-17', "Call", 1, { lead: patterns.djembeCall, accompaniment: patterns.djembeAccompany1, kenkeni: patterns.kenkeni, sangban: patterns.sangban, dununba: patterns.dununba }),
    ensembleSection('section-18', "Break", 1, { lead: patterns.djembeBreak, accompaniment: patterns.djembeBreak, kenkeni: patterns.kenkeniBreak, sangban: patterns.sangbanBreak, dununba: patterns.dununbaBreak }),
  ],
};
