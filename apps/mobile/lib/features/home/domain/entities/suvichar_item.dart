class SuvicharItem {
  final String id;
  final String title;
  final String quote;
  final String author;
  final String theme;
  final String date;
  final String imageUrl;
  final String? audioUrl;
  final bool isSpecialPoster;

  const SuvicharItem({
    required this.id,
    this.title = 'आज का सुविचार',
    required this.quote,
    required this.author,
    required this.theme,
    required this.date,
    required this.imageUrl,
    this.audioUrl,
    this.isSpecialPoster = false,
  });
}

const List<SuvicharItem> defaultSuvichars = [
  SuvicharItem(
    id: 'suvichar-1',
    title: '15 अगस्त स्वतंत्रता दिवस - विशेष अमृत संदेश',
    quote:
        'सत्संग से ही जीवन का उद्धार है। सत्संग सुनें, जीवन संवारें। सेवा ही साधना है, मानवता ही हमारा धर्म है।',
    author: 'पूज्य गुरुदेव (महर्षि मेँहीं आश्रम)',
    theme: 'सत्संग महिमा एवं राष्ट्र चेतना',
    date: '15 अगस्त (आज का विचार)',
    imageUrl:
        'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=900&auto=format&fit=crop&q=80',
    isSpecialPoster: true,
  ),
  SuvicharItem(
    id: 'suvichar-2',
    quote:
        'सत्संग सुनने से मन शुद्ध होता है और जीवन में शांति का प्रकाश फैलता है।',
    author: 'संत कबीर',
    theme: 'शांति और प्रकाश',
    date: 'दैनिक सुविचार',
    imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  ),
  SuvicharItem(
    id: 'suvichar-3',
    quote:
        'नाम सिमरन बिनु जीवना, जैसे पंछी बिनु पंख। प्रभु शरण में लीन हो, बजे अनाहद शंख॥',
    author: 'संत दादू दयाल',
    theme: 'नाम स्मरण',
    date: 'दैनिक सुविचार',
    imageUrl:
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
  ),
  SuvicharItem(
    id: 'suvichar-4',
    quote:
        'गुरु बिन ज्ञान न उपजै, गुरु बिन मिलै न मोष। गुरु बिन लखै न सत्य को, गुरु बिन मिटै न दोष॥',
    author: 'संत तुलसीदास',
    theme: 'गुरु भक्ति',
    date: 'दैनिक सुविचार',
    imageUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  ),
];
