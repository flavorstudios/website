const createMockCss = (family) => `
@font-face {
  font-family: '${family}';
  src: local('${family}');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
`;

module.exports = {
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap": createMockCss("Inter"),
  "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap": createMockCss("Lora"),
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap": createMockCss("JetBrains Mono"),
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap": createMockCss("Poppins"),
};