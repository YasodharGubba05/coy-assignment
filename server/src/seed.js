// Seed data. `likedMe` is SERVER-ONLY: it must never be serialised to a client.
// It is what makes demo matches possible, and leaking it would break Coy's core promise.

export const CURRENT_USER_ID = 'me';

const raw = [
  ['Aanya', 21, 'Delhi', 'Reads too many paperbacks, cooks badly, laughs loudly.', ['Books', 'Cooking', 'Indie music'], true],
  ['Rohan', 23, 'IIT Bombay', 'Aspiring founder. Will beat you at chess.', ['Chess', 'Startups', 'Running'], false],
  ['Meera', 22, 'Bengaluru', 'Weekend trekker. Filter-coffee loyalist.', ['Trekking', 'Coffee', 'Photography'], true],
  ['Kabir', 24, 'Mumbai', 'Stand-up open mics and bad puns.', ['Comedy', 'Movies', 'Football'], false],
  ['Ishita', 20, 'St. Stephens, Delhi', 'Debate society. Thinks she is always right (she is).', ['Debate', 'Poetry', 'Travel'], true],
  ['Arjun', 25, 'Hyderabad', 'Software dev by day, guitarist by night.', ['Guitar', 'Coding', 'Biryani'], false],
  ['Tara', 22, 'Pune', 'Dog person. Will show you 400 photos of my dog.', ['Dogs', 'Baking', 'Yoga'], false],
  ['Vihaan', 23, 'BITS Pilani', 'Gamer, gym rat, secret romantic.', ['Gaming', 'Gym', 'Anime'], true],
  ['Sana', 21, 'Mumbai', 'Fashion design student. Thrift shop queen.', ['Fashion', 'Thrifting', 'Sketching'], false],
  ['Dev', 26, 'Gurugram', 'Product manager. Plans trips, forgets to take them.', ['Travel', 'Podcasts', 'Cricket'], false],
  ['Nisha', 22, 'Chennai', 'Bharatanatyam dancer and part-time foodie.', ['Dance', 'Food', 'Films'], true],
  ['Aditya', 24, 'Delhi University', 'History nerd. Ask me about the Mughals.', ['History', 'Quizzing', 'Chai'], false],
  ['Riya', 20, 'Jaipur', 'Painter. My apartment is 70% plants.', ['Painting', 'Plants', 'Brunch'], false],
  ['Karan', 25, 'Chandigarh', 'Marathon runner, terrible at slow Sundays.', ['Running', 'Cycling', 'Smoothies'], true],
  ['Pooja', 23, 'Kolkata', 'Photographer chasing golden hour.', ['Photography', 'Street food', 'Rain'], false],
  ['Siddharth', 22, 'IIM Ahmedabad', 'Finance by trade, DJ by passion.', ['DJing', 'Markets', 'Tennis'], false],
  ['Anika', 21, 'Goa', 'Surfer, sunset collector, sea-salt hair.', ['Surfing', 'Beaches', 'Reggae'], true],
  ['Yash', 24, 'Lucknow', 'Poet. Yes, I will read you one.', ['Poetry', 'Ghazals', 'Kebabs'], false],
  ['Kavya', 23, 'Bengaluru', 'ML engineer who paints miniatures on weekends.', ['AI', 'Painting', 'Board games'], false],
  ['Ayaan', 22, 'Symbiosis, Pune', 'Football captain, group-project hero.', ['Football', 'Fitness', 'Hip hop'], false],
  ['Diya', 21, 'Mumbai', 'Theatre kid. Always rehearsing something.', ['Theatre', 'Singing', 'Coffee'], true],
  ['Neil', 25, 'Delhi', 'Barista, amateur astronomer.', ['Astronomy', 'Coffee', 'Sci-fi'], false],
  ['Zoya', 20, 'Hyderabad', 'Nail art, K-dramas, and a very long playlist.', ['K-dramas', 'Nail art', 'Pop'], false],
  ['Manav', 23, 'NIT Trichy', 'Robotics club. Fixes things, breaks hearts (kidding).', ['Robotics', 'Cricket', 'Biking'], false],
  ['Simran', 22, 'Amritsar', 'Parathas are my love language.', ['Cooking', 'Punjabi music', 'Travel'], false],
  ['Rahul', 26, 'Bengaluru', 'Startup ops. Pickleball evangelist.', ['Pickleball', 'Startups', 'Craft beer'], false],
  ['Ananya', 21, 'Ashoka University', 'Philosophy major. Overthinks playlists.', ['Philosophy', 'Music', 'Writing'], false],
  ['Veer', 24, 'Pune', 'Rock climber. Afraid of nothing except small talk.', ['Climbing', 'Camping', 'Podcasts'], false],
  ['Myra', 22, 'Delhi', 'Law student, closet baker.', ['Baking', 'Law', 'Thrillers'], false],
  ['Ishaan', 23, 'Mumbai', 'Filmmaker with a very expensive camera.', ['Filmmaking', 'Cinema', 'Cycling'], false],
  ['Tanvi', 22, 'Ahmedabad', 'Garba champion three years running.', ['Dance', 'Garba', 'Street food'], false],
  ['Aarav', 24, 'Kochi', 'Sailor, storyteller, tea snob.', ['Sailing', 'Tea', 'Storytelling'], false],
];

export const profiles = raw.map(([name, age, place, bio, interests, likedMe], i) => ({
  id: `p${i + 1}`,
  name,
  age,
  place,
  bio,
  interests,
  photo: `https://picsum.photos/seed/coy-${name.toLowerCase()}-${i + 1}/600/800`,
  likedMe,
}));

/** Public (client-safe) shape of a profile. Explicit allow-list so nothing leaks by accident. */
export function toPublic(p) {
  const { id, name, age, place, bio, interests, photo } = p;
  return { id, name, age, place, bio, interests, photo };
}
