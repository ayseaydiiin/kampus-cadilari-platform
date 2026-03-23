export type ArticleRecord = {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  image: string;
  readTime: string;
  body: string[];
  relatedAction: string;
};

export const articles: ArticleRecord[] = [
  {
    id: 'domestic-violence-are-laws-enough',
    title: 'Domestic Violence: Are Laws Enough?',
    category: 'Legal Analysis',
    author: 'Ayse Yilmaz',
    date: '2026-03-15',
    excerpt: 'Examining legal protection mechanisms against domestic violence in Türkiye, gaps in implementation, and urgent reform needs.',
    image: '⚖️',
    readTime: '6 min',
    relatedAction: 'Local solidarity lines and bar association women\'s rights centers should be strengthened as first contact points.',
    body: [
      'While the legal framework against domestic violence appears comprehensive on paper, access to protective orders and their effective enforcement remain serious problems. Young people around campus, in particular, need support language that recognizes violence not just as physical, but as economic and psychological.',
      'Law 6284 provides vital ground; however, when coordination between police stations, prosecutor offices, and social services weakens, the rights-seeking process becomes a second burden for individuals. At this point, feminist legal networks fill a critical gap not just through guidance, but by taking on monitoring responsibilities.',
      'Three points stand out for a strong system: rapid protective orders, offender-focused risk assessment, and monitoring mechanisms. Solidarity structures like Campus Witches, while clarifying legal information in accessible language, also remind us that we are not alone.',
    ],
  },
  {
    id: 'being-a-woman-on-campus-interview-series',
    title: 'Being a Woman on Campus: Interview Series',
    category: 'Interviews',
    author: 'Zeynep Kara',
    date: '2026-03-12',
    excerpt: 'Conversations with students from different universities document shared experiences ranging from campus safety to solidarity.',
    image: '🎤',
    readTime: '5 min',
    relatedAction: 'The interviews highlight unified demands for safe spaces, night transportation, and support mechanisms at each campus.',
    body: [
      'Campus experience, beyond classrooms and libraries, relates to who feels safe. The students we spoke with point to unlit walking paths, sexist language, and women\'s invisible labor at events.',
      'The most recurring theme in interviews was simultaneous growing distrust in formal mechanisms and growing need for student solidarity. A student club or feminist community sometimes becomes the first place where people can breathe, before psychological support.',
      'This series shows how solutions, not just problems, are created by students on campuses: night walk-matching schemes, anonymous complaint forms, and rapid defense networks built through shared texts are some examples.',
    ],
  },
  {
    id: 'invisible-labor-cleaning-workers',
    title: 'Invisible Labor: Cleaning Workers',
    category: 'Invisible Women',
    author: 'Fatma Demir',
    date: '2026-03-10',
    excerpt: 'Examining the labor conditions, precarity, and dignity rights of cleaning workers who sustain campuses\' invisible work.',
    image: '🧹',
    readTime: '7 min',
    relatedAction: 'University components must unite around common demands against outsourcing and precarious work conditions.',
    body: [
      'The cleaning workers who prep campus early morning are least visible for the rest of the day. For women workers, this invisibility deepens when combined with low wages, insecure contracts, and heavy workloads.',
      'Workers we spoke with described problems from insufficient break areas to missing protective equipment. Many said they\'re only noticed by students and academics when a problem arises.',
      'Feminist labor politics must focus not just on representation but on working conditions and institutional dignity. On campuses, labor justice is not a side note outside lesson schedules; it\'s directly a matter of living conditions.',
    ],
  },
  {
    id: 'one-song-thousand-years-women-musicians',
    title: 'One Song, Thousand Years: Women Musicians',
    category: 'Culture & Art',
    author: 'Muzeyyen Senar',
    date: '2026-03-08',
    excerpt: 'Exploring how women\'s voices are silenced in music and the archive, stage, and memory practices built in resistance.',
    image: '🎵',
    readTime: '4 min',
    relatedAction: 'Programming principles that make space for women musicians should become permanent in local event calendars.',
    body: [
      'Women musicians have long been underrepresented both on stage and in archives. Yet a song\'s story is shaped as much by who wrote it as by who was silenced.',
      'Today feminist cultural politics means more than "put more women musicians on stage"; it demands that from technical crew to programming boards, decision-making spaces become egalitarian.',
      'This memory work asks a question reaching from campus events to independent music venues: whose voice counts as permanent, whose as temporary? Every organized answer to this question opens new ground.',
    ],
  },
  {
    id: 'feminism-and-psychological-freedom',
    title: 'Feminism and Psychological Freedom',
    category: 'Psychology',
    author: 'Dr. Gulsum Alp',
    date: '2026-03-05',
    excerpt: 'Examining how psychological freedom, self-esteem, and sense of security connect to feminist politics in scientific and experiential frameworks.',
    image: '🧠',
    readTime: '6 min',
    relatedAction: 'Support groups should think individual well-being alongside collective safety and solidarity.',
    body: [
      'Psychological freedom is not just about an individual\'s inner world; it also encompasses the effects of social pressures, gender roles, and constant vigilance on our mental state. For many women, ease becomes possible only within a safe community.',
      'Feminism offers therapeutic language here: it helps us read guilt not as individual failure but as the result of structural burdens. This perspective eases self-directed harshness while strengthening the search for solidarity.',
      'Feminist approaches in mental health focus not just on individual healing but on changing harmful structures. Support lines on campuses are therefore both a social service heading and a direct political rights demand.',
    ],
  },
  {
    id: 'women-in-media-othering-and-images',
    title: 'Women in Media: Othering and Images',
    category: 'Media Collective',
    author: 'Imam Cicek',
    date: '2026-03-01',
    excerpt: 'Analyzing how women are othered in media through news language, headline choices, and visual preferences.',
    image: '📺',
    readTime: '5 min',
    relatedAction: 'Editorial guidelines must include clear principles against victim-blaming and sexist language use.',
    body: [
      'Media is one of the most powerful areas reproducing the gender regime. Centering a victim\'s life rather than a perpetrator\'s in news directly affects how the public grasps violence and equality.',
      'Language in headlines that frames women as passive, exceptional, or controversial subjects narrows how society understands violence and equality. Feminist media critique therefore focuses not just on representation numbers but on representation forms.',
      'From the Campus Witches perspective, the solution is not just criticism but alternative production: offender-focused news language, context-providing graphics, and solidarity-centered narratives can be key building blocks of this production.',
    ],
  },
];

const articleIdAliases = new Map([
  ['1', 'domestic-violence-are-laws-enough'],
  ['2', 'being-a-woman-on-campus-interview-series'],
  ['3', 'invisible-labor-cleaning-workers'],
  ['4', 'one-song-thousand-years-women-musicians'],
  ['5', 'feminism-and-psychological-freedom'],
  ['6', 'women-in-media-othering-and-images'],
]);

export function getArticleById(id: string) {
  const resolvedId = articleIdAliases.get(id) || id;
  return articles.find((article) => article.id === resolvedId);
}
