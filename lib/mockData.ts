export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
};

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Captain Redbeard',
    age: 34,
    bio: 'Sailing the Gothenburg harbour since 1987. Looking for someone to share the sunset from the Älvsborg bridge. I know every fish in the sea — and I cook them too.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=CaptainRedbeard&size=400&backgroundColor=b6e3f4'],
  },
  {
    id: '2',
    name: 'Trollhilda',
    age: 29,
    bio: 'I live near Slottsskogen and enjoy long walks at night. Interested in geology, collecting shiny things, and Swedish fika. Trolls have feelings too.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=Trollhilda&size=400&backgroundColor=c0aede'],
  },
  {
    id: '3',
    name: 'Pirate Pete',
    age: 31,
    bio: 'Former sea captain, current barista at a café in Haga. Looking for treasure and good conversation. My parrot is very well-behaved (most of the time).',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=PiratePete&size=400&backgroundColor=ffd5dc'],
  },
  {
    id: '4',
    name: 'Forest Troll Björn',
    age: 38,
    bio: 'I am big, I am strong, and I make excellent cloudberry jam. Lives in Gothenburg West. Looking for someone patient and adventurous.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=ForestTrollBjorn&size=400&backgroundColor=d1f4d1'],
  },
  {
    id: '5',
    name: 'Anne Bonny II',
    age: 26,
    bio: 'Fierce, independent, and obsessed with Gothenburg street food. I can navigate by the stars and parallel park a boat. Swipe right if you can keep up.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=AnneBonny&size=400&backgroundColor=ffdfbf'],
  },
  {
    id: '6',
    name: 'Grumpy Trollsson',
    age: 44,
    bio: 'Not actually grumpy — just misunderstood. Engineer by day, troll-bridge guardian by night. Big heart, big appetite. Home-cooked meals on Sundays.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=GrumpyTrollsson&size=400&backgroundColor=b6e3f4'],
  },
  {
    id: '7',
    name: 'Silver Hook Magnus',
    age: 37,
    bio: 'I lost my hand in a Göteborg pub quiz arm-wrestle. Now I work in finance. Looking for someone who laughs at my terrible pirate jokes.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=SilverHookMagnus&size=400&backgroundColor=ffd5dc'],
  },
  {
    id: '8',
    name: 'Mossy Bergit',
    age: 33,
    bio: 'Nature lover, troll enthusiast, amateur knitter of very large sweaters. You will find me at Botaniska on weekends. Bark is worse than my bite.',
    images: ['https://api.dicebear.com/9.x/adventurer/png?seed=MossyBergit&size=400&backgroundColor=c0aede'],
  },
];
