module.exports = {
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Resolve os imports absolutos do código (baseUrl: "./" no tsconfig, ex.: 'src/app/...').
  modulePaths: ["<rootDir>"],
};

