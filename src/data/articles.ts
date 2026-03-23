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
    id: 'ev-ici-siddet-yasalar-yeterli-mi',
    title: 'Ev Ici Siddet: Yasalar Yeterli mi?',
    category: 'Hukuk',
    author: 'Ayse Yilmaz',
    date: '2026-03-15',
    excerpt: 'Turkiye de ev ici siddetle mucadelede yasal koruma mekanizmalari, uygulamadaki bosluklar ve acil reform ihtiyacini ele aliyoruz.',
    image: '⚖️',
    readTime: '6 dk',
    relatedAction: 'Yerel dayanisma hatlari ve barolarin kadin haklari merkezleri birinci temas noktasi olarak guclendirilmeli.',
    body: [
      'Ev ici siddetle mucadelede hukuki cerceve kagit uzerinde genis gorunse de, koruma kararlarina erisim ve bu kararlarin etkin uygulanmasi hala ciddi bir sorun alani olarak karsimiza cikiyor. Ozellikle kampus cevresinde yasayan genclerin, siddetin sadece fiziksel degil ekonomik ve psikolojik boyutlarini da tanimlayabilecek bir destek diline ihtiyaci var.',
      '6284 sayili kanun hayati bir zemin sunuyor; ancak karakol, savcilik ve sosyal hizmetler arasindaki koordinasyon zayifladiginda, hak arama sureci kisiler icin ikinci bir yuk haline gelebiliyor. Bu noktada feminist hukuk aglari yalnizca yonlendirme degil, surecin takibini de ustlenerek kritik bir boslugu kapatiyor.',
      'Guclu bir sistem icin uc baslik one cikiyor: hizli koruma karari, fail odakli risk degerlendirmesi ve izleme mekanizmasi. Kampus Cadilari gibi dayanisma yapilari, hukuki bilgilendirmeyi sade dille ulasabilir kilarken ayni zamanda yalniz olmadigimizi da hatirlatiyor.',
    ],
  },
  {
    id: 'kampuste-kadin-olmak-roportaj-serisi',
    title: 'Kampuste Kadin Olmak: Roportaj Serisi',
    category: 'Roportaj',
    author: 'Zeynep Kara',
    date: '2026-03-12',
    excerpt: 'Farkli universitelerden ogrencilerle yaptigimiz gorusmeler, kampuste guvenlikten dayanismaya uzanan ortak deneyimleri kayda geciriyor.',
    image: '🎤',
    readTime: '5 dk',
    relatedAction: 'Roportajlarin sonunda her kampus icin guvenli alan, gece ulasim ve destek mekanizmasi talepleri ortaklasiyor.',
    body: [
      'Kampus deneyimi, dersliklerin ve kutuphanelerin otesinde, kimin kendini guvende hissettigiyle de ilgili. Gorustugumuz ogrenciler, aydinlatilmayan yuruyus yollari, cinsiyetci dil ve etkinliklerde kadinlarin gorunmez emegine dikkat cekiyor.',
      'Roportajlarda en cok tekrar eden tema, resmi mekanizmalara duyulan guvensizlik ile ogrenci dayanismasina duyulan ihtiyacin ayni anda buyumesi oldu. Bir ogrenci kulubu veya feminist topluluk, bazen psikolojik destekten once ilk nefes aldiran yer haline gelebiliyor.',
      'Bu seri, kampuslerde yalnizca sorunlarin degil, cozumlerin de ogrenciler tarafindan nasil kuruldugunu gosteriyor: gece yuruyus eslesmeleri, anonim sikayet formlari ve ortak metinlerle kurulan hizli savunma hatlari bunlardan bazilari.',
    ],
  },
  {
    id: 'gorunmeyen-emek-temizlik-iscileri',
    title: 'Gorunmeyen Emek: Temizlik Iscileri',
    category: 'Gorunmeyen Kadinlar',
    author: 'Fatma Demir',
    date: '2026-03-10',
    excerpt: 'Kampuslerin gorunmez emegini ustlenen temizlik iscilerinin emek rejimi, guvencesizlik ve sayginlik hakki uzerinden inceleniyor.',
    image: '🧹',
    readTime: '7 dk',
    relatedAction: 'Taseron ve guvencesiz calisma kosullarina karsi universite bilesenleri ortak talepler etrafinda bir araya gelmeli.',
    body: [
      'Sabahin erken saatlerinde kampusu hazir hale getiren temizlik iscileri, gunun geri kalaninda en az gorunen emekcilerden oluyor. Kadin isciler icin bu gorunmezlik, dusuk ucret, guvencesiz sozlesme ve yogun is yukuyla birlesince daha da derinlesiyor.',
      'Gorustugumuz emekciler, dinlenme alani yetersizliginden koruyucu ekipman eksigine kadar uzanan sorunlari anlatti. Bircogu, ogrenciler ve akademisyenler tarafindan ancak bir sorun ciktiginda fark edildiklerini soyledi.',
      'Feminist emek politikalari, sadece temsil degil calisma kosullari ve kurumsal sayginlik meselesine de odaklanmak zorunda. Kampuslerde emek adaleti, ders programlarinin disinda kalan bir yan baslik degil; dogrudan yasam kosulu meselesi.',
    ],
  },
  {
    id: 'bir-sarki-bin-yil-kadin-muzisyenler',
    title: 'Bir Sarki Bin Yil: Kadin Muzisyenler',
    category: 'Kultur Sanat',
    author: 'Muzeyyen Senar',
    date: '2026-03-08',
    excerpt: 'Muzikte kadinlarin sesinin nasil bastirildigini ve buna karsi kurulan arsiv, sahne ve hafiza pratiklerini konusuyoruz.',
    image: '🎵',
    readTime: '4 dk',
    relatedAction: 'Yerel etkinlik takviminde kadin muzisyenlere alan acan programlama ilkesi kalici hale getirilmeli.',
    body: [
      'Kadin muzisyenler uzun zamandir hem sahnede hem arsivlerde eksik temsil ediliyor. Oysa bir sarkinin hikayesi, onu kimin yazdigi kadar kimin susturulduguyla da sekilleniyor.',
      'Bugun feminist kultur politikasi, yalnizca daha fazla kadin sanatci sahneye ciksin demek degil; teknik ekipten program kurullarina kadar karar veren alanlarin da esitlikci hale gelmesini talep ediyor.',
      'Bu hafiza calismasi, kampus etkinliklerinden bagimsiz muzik mekanlarina kadar uzanan bir soru soruyor: Kimin sesi kalici, kimin sesi gecici sayiliyor? Bu soruya verilen her orgutlu cevap, yeni bir alan aciyor.',
    ],
  },
  {
    id: 'feminizm-ve-psikolojik-ozgurluk',
    title: 'Feminizm ve Psikolojik Ozgurluk',
    category: 'Psikoloji',
    author: 'Dr. Gulsum Alp',
    date: '2026-03-05',
    excerpt: 'Psikolojik ozgurluk, ozsaygi ve guvenlik hissinin feminist politika ile nasil bag kurdugunu bilimsel ve deneyimsel cercevede ele aliyoruz.',
    image: '🧠',
    readTime: '6 dk',
    relatedAction: 'Destek gruplari, bireysel iyilik halini kolektif guvenlik ve dayanisma ile birlikte dusunmeli.',
    body: [
      'Psikolojik ozgurluk, sadece bireyin ic dunyasina dair bir konu degil; toplumsal baskilarin, cinsiyet rollerinin ve surekli tetikte olma halinin ruh halimize etkisini de kapsiyor. Bircok kadin icin rahatlama, ancak guvenli bir topluluk icinde mumkun hale geliyor.',
      'Feminizm burada terapotik bir dil sunuyor: Sucluluk duygusunu bireysel bir yetersizlik olarak degil, yapisal yuklerin sonucu olarak okumayi kolaylastiriyor. Bu bakis, kisinin kendine yonelen sertligini azaltirken dayanisma arayisini da guclendiriyor.',
      'Ruh sagligi alaninda feminist yaklasim, yalnizca bireysel iyilesmeye degil, zarar veren duzenekleri degistirmeye de odaklanir. Kampuslerdeki destek hatlari, bu nedenle bir sosyal hizmet basligi oldugu kadar politik bir hak talebidir.',
    ],
  },
  {
    id: 'medyada-kadin-imaji-otekilestirme',
    title: 'Medyada Kadin Imaji: Otekilestirme',
    category: 'Cadi Medya Kolektifi',
    author: 'Imam Cicek',
    date: '2026-03-01',
    excerpt: 'Haber dili, baslik secimi ve gorsel tercihleri uzerinden medyada kadinlarin nasil otekilestirildigini inceliyoruz.',
    image: '📺',
    readTime: '5 dk',
    relatedAction: 'Editoryal kilavuzlar, magdurlastirici ve cinsiyetci dil kullanimina karsi net ilkeler icermeli.',
    body: [
      'Medya, toplumsal cinsiyet rejimini yeniden ureten en guclu alanlardan biri. Bir haberde failin degil magdurun hayatinin merkezde tutulmasi, olaylarin nasil algilandigini dogrudan etkiliyor.',
      'Basliklarda kadinlari pasif, istisnai ya da tartismali bir nesne gibi kuran dil, kamuoyunun siddet ve esitlik meselelerini kavrayis bicimini daraltiyor. Bu nedenle feminist medya elestirisi, sadece temsil sayisina degil temsil bicimine de odaklaniyor.',
      'Cadi Medya Kolektifi perspektifiyle bakildiginda cozum, yalnizca elestiri degil alternatif uretimdir: fail odakli haber dili, baglam veren grafikler ve dayanisma odakli anlatilar bu uretimin temel taslari olabilir.',
    ],
  },
];

const articleIdAliases = new Map([
  ['1', 'ev-ici-siddet-yasalar-yeterli-mi'],
  ['2', 'kampuste-kadin-olmak-roportaj-serisi'],
  ['3', 'gorunmeyen-emek-temizlik-iscileri'],
  ['4', 'bir-sarki-bin-yil-kadin-muzisyenler'],
  ['5', 'feminizm-ve-psikolojik-ozgurluk'],
  ['6', 'medyada-kadin-imaji-otekilestirme'],
]);

export function getArticleById(id: string) {
  const resolvedId = articleIdAliases.get(id) || id;
  return articles.find((article) => article.id === resolvedId);
}
