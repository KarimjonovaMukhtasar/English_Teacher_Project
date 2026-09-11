import { StudentGroup } from '@/types';

export { SUPPLIED_FACULTY_LESSONS as MEDICAL_LESSONS } from './facultyCurriculum';

export const MEDICAL_STUDENT_GROUPS: StudentGroup[] = [
  {
    id: 'grp_hamshiralik_101',
    name: 'Hamshiralik Ishi 101-guruh (1-kurs)',
    students: [
      'Dilnoza Karimova',
      'Madina Rahimova',
      'Shahlo Mirzayeva',
      'Kamola Rustamova',
      'Zarina Xolmirzayeva',
      'Nodira Qodirova',
      'Gulchehra Shokirova',
      'Laylo Vohidova',
      'Nilufar Ismoilova',
      'Fotima Nazarova',
      'Zuhra Nazarova',
      'Malika Aliyeva',
    ],
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'grp_hamshiralik_202',
    name: 'Hamshiralik Ishi 202-guruh (2-kurs)',
    students: [
      'Alisher Usmonov',
      'Bekzod Toshmatov',
      'Javohir Sayidov',
      'Sardor Nurmatov',
      'Otabek Yoqubov',
      'Bobur Azimov',
      'Azizbek Ergashev',
      'Farhod Temirov',
      'Diyorbek Mahmudov',
      'Jasurbek Ergashev',
      'Sherzod Xoliqov',
      'Ulugbek Jo‘rayev',
    ],
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'grp_davolash_ishi_301',
    name: 'Davolash Ishi (Feldsher) 301-guruh',
    students: [
      'Anvar Mahmudov',
      'Zilola Saidova',
      'Shaxzod Bekmurodov',
      'Malika Rustamova',
      'Bekzod Toirov',
      'Kamila Yusupova',
      'Nodirbek Qosimova',
      'Sardorbek Ergashev',
    ],
    createdAt: Date.now() - 86400000 * 4,
  },
];
