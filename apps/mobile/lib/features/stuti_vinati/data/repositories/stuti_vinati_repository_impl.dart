import '../../domain/entities/stuti_vinati_entity.dart';
import '../../domain/repositories/stuti_vinati_repository.dart';
import '../datasources/stuti_vinati_remote_datasource.dart';
import '../models/stuti_vinati_dto.dart';

class StutiVinatiRepositoryImpl implements StutiVinatiRepository {
  final StutiVinatiRemoteDataSource _remoteDataSource;

  StutiVinatiRepositoryImpl(this._remoteDataSource);

  static const List<StutiVinati> _defaultStutis = [
    StutiVinati(
      id: 'stuti-morning',
      title: 'प्रातःकालीन स्तुति पाठ',
      subtitle: 'सुबह की प्रार्थना – नई ऊर्जा के साथ',
      artist: 'महर्षि मेँही परमहंस जी महाराज',
      duration: '08:45',
      type: 'morning',
      bannerImage: 'https://picsum.photos/seed/morning/600/400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      textContent: '''मंगल मूरति सतगुरु मिलवैं ।
सकल सुमंगल देइ दिलावैं ॥
जो सुख चाहे जीव जगत का ।
सो सुख सतगुरु चरनन पावै ॥

सतगुरु पद पंकज अनुरागा ।
परम पुन्य कोउ बड़भागी पावा ॥
ज्ञान ध्यान जग मग तम नासा ।
भा भासइ परमातम प्रकाशा ॥

जय जय जय सतगुरु सुखदाता ।
ज्ञान रूप अनुपम जग त्राता ॥
चरण कमल रज सिर धर धारूँ ।
बार बार वंदना पुकारूँ ॥

दीन दयाल कृपा करी कीजै ।
अचल भक्ति मोहि अपनी दीजै ॥
सतगुरु सरन गहे जो प्राणी ।
तारे ताहि परम पद ज्ञानी ॥''',
    ),
    StutiVinati(
      id: 'stuti-evening',
      title: 'संध्याकालीन आरती पाठ',
      subtitle: 'शाम की प्रार्थना – आंतरिक शांति के साथ',
      artist: 'महर्षि मेँही परमहंस जी महाराज',
      duration: '10:15',
      type: 'evening',
      bannerImage: 'https://picsum.photos/seed/evening/600/400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      textContent: '''आरती तन मंदिर में कीजै ।
दृष्टि युगल कर सनमुख लीजै ॥
चमके बिंदु सूक्ष्म अति उज्ज्वल ।
ब्रह्म ज्योति अनुपम जगमगावै ॥

सुनि अनहद धुनि गगन गंभीरा ।
प्रकटै आपुहि आपु कबीरा ॥
अमृत रस झरइ झरझर धारा ।
पीवै संत सुजान अधारा ॥

आरती कीजै सतगुरु की सेवा ।
पावै निज पद परमानंदा ॥
सब दुख कटे विमल सुख पावै ।
हरि पद सहज ध्यान ठहरावै ॥''',
    ),
    StutiVinati(
      id: 'stuti-binti',
      title: 'गुरु बिनती - हे प्रभु आनंद दाता',
      subtitle: 'सतगुरु चरण शरण बिनती',
      artist: 'संत तुलसी साहब',
      duration: '06:30',
      type: 'binti',
      bannerImage: 'https://picsum.photos/seed/binti/600/400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      textContent: '''हे प्रभु आनंद दाता ज्ञान हमको दीजिये ।
शीघ्र सारे दुर्गुणों को दूर हमसे कीजिये ॥

लीजिये हमको शरण में, हम सदाचारी बनें ।
ब्रह्मचारी, धर्मरक्षक, वीर व्रतधारी बनें ॥

हे दयालु सतगुरुदेव! दीन बंधु प्रार्थना ।
मन वचन अरु कर्म से तव भक्ति की हो कामना ॥''',
    ),
    StutiVinati(
      id: 'stuti-padya',
      title: 'पद्य पाठ - संतवाणी एवं दोहे',
      subtitle: 'पावन वाणी एवं पद्य पाठ संग्रह',
      artist: 'संत कबीरदास जी',
      duration: '07:20',
      type: 'padya',
      bannerImage: 'https://picsum.photos/seed/padya/600/400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      textContent: '''गुरु गोविन्द दोऊ खड़े, काके लागू पाँय ।
बलिहारी गुरु आपने, जिन गोविंद दियो बताय ॥

जाका गुरु भी अंधला, चेला खरा निरंध ।
अंधे अंधा ठेलिया, दोनों कूप पड़ंत ॥

साधु भूखा भाव का, धन का भूखा नाहिं ।
धन का भूखा जो फिरै, सो तो साधु नाहिं ॥

सतगुरु सम कोई हितू नहीं, शोधौ सब संसार ।
अल्प जीव ते क्या करै, जब विधि न होय सहाय ॥''',
    ),
  ];

  @override
  Future<List<StutiVinati>> getAll() async {
    try {
      final items = await _remoteDataSource.getAll();
      if (items.isEmpty) {
        return _defaultStutis;
      }
      return items;
    } catch (_) {
      return _defaultStutis;
    }
  }

  @override
  Stream<List<StutiVinati>> watchAll() {
    return _remoteDataSource.watchAll();
  }

  @override
  Future<StutiVinati?> getById(String id) async {
    try {
      final item = await _remoteDataSource.getById(id);
      if (item != null) return item;
    } catch (_) {}
    return _defaultStutis.firstWhere(
      (s) => s.id == id,
      orElse: () => _defaultStutis.first,
    );
  }

  @override
  Future<void> add(StutiVinati item) async {
    final dto = StutiVinatiDto(
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      artist: item.artist,
      duration: item.duration,
      bannerImage: item.bannerImage,
      textContent: item.textContent,
      audioUrl: item.audioUrl,
      type: item.type,
      isFavorite: item.isFavorite,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(StutiVinati item) async {
    final dto = StutiVinatiDto(
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      artist: item.artist,
      duration: item.duration,
      bannerImage: item.bannerImage,
      textContent: item.textContent,
      audioUrl: item.audioUrl,
      type: item.type,
      isFavorite: item.isFavorite,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
