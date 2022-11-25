declare module 'vut-scraper' {
  export interface ScraperInterface {}

  export interface SavedSubjects {
    title: string;
    terms: Array<SavedTerm>;
  }

  export interface SavedData {
    subjects: Array<SavedSubjects>;
  }

  export interface Pair {
    hash: number;
    new: TerminData;
    old: TerminData;
  }

  export interface SubjectData {
    title: string;
    terms: Array<TerminData>;
  }

  export interface TerminData {
    hash: number;
    title: string;
    termin: string;
    type: string;
    registered: boolean;
    examiner: string;
    examinerLink: string;
    room: string;
    spots: {
      taken: number;
      total: number;
      free: number;
    };
    filled: boolean;
    onlyExamStudents: boolean;
    note?: string;
    registeredNote?: string;
  }
}
