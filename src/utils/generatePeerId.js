function generatePeerId() {
  const part = () => Math.floor(100 + Math.random() * 900); 
  return `${part()}-${part()}-${part()}`;
}

module.exports = { generatePeerId };