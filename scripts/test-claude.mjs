import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const res = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 256,
  messages: [{
    role: 'user',
    content: '사주 분석 테스트입니다. "연결 성공"이라고만 답해주세요.'
  }]
});

console.log('✅ Claude API 연결 성공');
console.log('응답:', res.content[0].text);
