export interface ProvinceInfo {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'growing' | 'open';
  note: string;
  contact: string;
}

const active = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakir', 'Eskisehir', 'Gaziantep', 'Istanbul', 'Izmir', 'Mersin'];
const growing = ['Aydin', 'Balikesir', 'Canakkale', 'Denizli', 'Edirne', 'Hatay', 'Kayseri', 'Kocaeli', 'Mugla', 'Samsun', 'Tekirdag'];

const provinceNames = [
  ['Adana', 'Akdeniz'],
  ['Adiyaman', 'Guneydogu Anadolu'],
  ['Afyonkarahisar', 'Ege'],
  ['Agri', 'Dogu Anadolu'],
  ['Aksaray', 'Ic Anadolu'],
  ['Amasya', 'Karadeniz'],
  ['Ankara', 'Ic Anadolu'],
  ['Antalya', 'Akdeniz'],
  ['Ardahan', 'Dogu Anadolu'],
  ['Artvin', 'Karadeniz'],
  ['Aydin', 'Ege'],
  ['Balikesir', 'Marmara'],
  ['Bartin', 'Karadeniz'],
  ['Batman', 'Guneydogu Anadolu'],
  ['Bayburt', 'Karadeniz'],
  ['Bilecik', 'Marmara'],
  ['Bingol', 'Dogu Anadolu'],
  ['Bitlis', 'Dogu Anadolu'],
  ['Bolu', 'Karadeniz'],
  ['Burdur', 'Akdeniz'],
  ['Bursa', 'Marmara'],
  ['Canakkale', 'Marmara'],
  ['Cankiri', 'Ic Anadolu'],
  ['Corum', 'Karadeniz'],
  ['Denizli', 'Ege'],
  ['Diyarbakir', 'Guneydogu Anadolu'],
  ['Duzce', 'Karadeniz'],
  ['Edirne', 'Marmara'],
  ['Elazig', 'Dogu Anadolu'],
  ['Erzincan', 'Dogu Anadolu'],
  ['Erzurum', 'Dogu Anadolu'],
  ['Eskisehir', 'Ic Anadolu'],
  ['Gaziantep', 'Guneydogu Anadolu'],
  ['Giresun', 'Karadeniz'],
  ['Gumushane', 'Karadeniz'],
  ['Hakkari', 'Dogu Anadolu'],
  ['Hatay', 'Akdeniz'],
  ['Igdir', 'Dogu Anadolu'],
  ['Isparta', 'Akdeniz'],
  ['Istanbul', 'Marmara'],
  ['Izmir', 'Ege'],
  ['Kahramanmaras', 'Akdeniz'],
  ['Karabuk', 'Karadeniz'],
  ['Karaman', 'Ic Anadolu'],
  ['Kars', 'Dogu Anadolu'],
  ['Kastamonu', 'Karadeniz'],
  ['Kayseri', 'Ic Anadolu'],
  ['Kirikkale', 'Ic Anadolu'],
  ['Kirklareli', 'Marmara'],
  ['Kirsehir', 'Ic Anadolu'],
  ['Kilis', 'Guneydogu Anadolu'],
  ['Kocaeli', 'Marmara'],
  ['Konya', 'Ic Anadolu'],
  ['Kutahya', 'Ege'],
  ['Malatya', 'Dogu Anadolu'],
  ['Manisa', 'Ege'],
  ['Mardin', 'Guneydogu Anadolu'],
  ['Mersin', 'Akdeniz'],
  ['Mugla', 'Ege'],
  ['Mus', 'Dogu Anadolu'],
  ['Nevsehir', 'Ic Anadolu'],
  ['Nigde', 'Ic Anadolu'],
  ['Ordu', 'Karadeniz'],
  ['Osmaniye', 'Akdeniz'],
  ['Rize', 'Karadeniz'],
  ['Sakarya', 'Marmara'],
  ['Samsun', 'Karadeniz'],
  ['Sanliurfa', 'Guneydogu Anadolu'],
  ['Siirt', 'Guneydogu Anadolu'],
  ['Sinop', 'Karadeniz'],
  ['Sirnak', 'Guneydogu Anadolu'],
  ['Sivas', 'Ic Anadolu'],
  ['Tekirdag', 'Marmara'],
  ['Tokat', 'Karadeniz'],
  ['Trabzon', 'Karadeniz'],
  ['Tunceli', 'Dogu Anadolu'],
  ['Usak', 'Ege'],
  ['Van', 'Dogu Anadolu'],
  ['Yalova', 'Marmara'],
  ['Yozgat', 'Ic Anadolu'],
  ['Zonguldak', 'Karadeniz'],
] as const;

export const provinces: ProvinceInfo[] = provinceNames.map(([name, region]) => {
  const status = active.includes(name) ? 'active' : growing.includes(name) ? 'growing' : 'open';

  return {
    id: name.toLowerCase(),
    name,
    region,
    status,
    note:
      status === 'active'
        ? 'Bu ilde duzenli bulusmalar ve yerel koordinasyon var.'
        : status === 'growing'
          ? 'Bu ilde basvuru havuzu olusuyor ve yeni ekip kuruluyor.'
          : 'Bu ilde yeni koordinasyon baslatmak icin ilk basvurular bekleniyor.',
    contact:
      status === 'active'
        ? 'Yerel ekip ile eslesme'
        : status === 'growing'
          ? 'Kurucu gonullu basvurusu'
          : 'Ilk temas formu',
  };
});
