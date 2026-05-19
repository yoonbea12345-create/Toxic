import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D0005"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Border -->
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="#FF2D55" stroke-width="1" stroke-opacity="0.3"/>

  <!-- Red accent line top -->
  <rect x="0" y="0" width="1200" height="3" fill="#FF2D55"/>

  <!-- TOXIC wordmark -->
  <text x="80" y="200" font-family="Georgia, serif" font-size="100" font-weight="bold" fill="white" letter-spacing="12">TOXIC</text>

  <!-- Dash separator -->
  <rect x="80" y="230" width="60" height="2" fill="#FF2D55"/>

  <!-- Tagline -->
  <text x="80" y="295" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="32" fill="#888888">왜 안맞는지, 사주가 이미 알고 있었습니다</text>

  <!-- Score example -->
  <circle cx="1040" cy="260" r="120" fill="none" stroke="#1a1a1a" stroke-width="12"/>
  <circle cx="1040" cy="260" r="120" fill="none" stroke="#FF2D55" stroke-width="12"
    stroke-dasharray="564 754" stroke-linecap="round"
    transform="rotate(-90 1040 260)"/>
  <text x="1040" y="250" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="white" text-anchor="middle">87</text>
  <text x="1040" y="290" font-family="Georgia, serif" font-size="20" fill="#555555" text-anchor="middle">독성지수</text>

  <!-- Tags -->
  <rect x="80" y="340" width="180" height="40" fill="none" stroke="#FF2D55" stroke-width="1" stroke-opacity="0.4" rx="2"/>
  <text x="170" y="367" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="18" fill="#FF2D55" text-anchor="middle">충(沖) 구조</text>

  <rect x="276" y="340" width="180" height="40" fill="none" stroke="#BF5AF2" stroke-width="1" stroke-opacity="0.4" rx="2"/>
  <text x="366" y="367" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="18" fill="#BF5AF2" text-anchor="middle">형(刑) 충돌</text>

  <rect x="472" y="340" width="180" height="40" fill="none" stroke="#FF9800" stroke-width="1" stroke-opacity="0.4" rx="2"/>
  <text x="562" y="367" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="18" fill="#FF9800" text-anchor="middle">오행 극(剋)</text>

  <!-- Bottom CTA -->
  <text x="80" y="530" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="24" fill="#444444">toxic.kr</text>

  <!-- Bottom tag -->
  <text x="80" y="580" font-family="Apple SD Gothic Neo, Noto Sans KR, sans-serif" font-size="20" fill="#333333">연인 · 친구 · 직장 · 가족 — 모든 갈등 관계 사주 분석</text>
</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
});
const png = resvg.render();
const buffer = png.asPng();
writeFileSync('public/og.png', buffer);
console.log('✓ public/og.png 생성 완료 (1200×630)');
