const adjectives = [
  "Curious", "Silent", "Brave", "Clever", "Witty", "Happy", "Chill",
  "Quiet", "Fast", "Funky", "Smart", "Wild", "Cool", "Bold", "Sneaky"
];

const animals = [
  "Tiger", "Panda", "Fox", "Otter", "Bear", "Wolf", "Koala", "Lynx",
  "Eagle", "Shark", "Frog", "Whale", "Hawk", "Penguin", "Rabbit"
];

export const generateAnonymousUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100); // optional: adds 0-99
  return `${adjective}${animal}${number}`;
};
