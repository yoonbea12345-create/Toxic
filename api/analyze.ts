import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { myData, targetData, relationType, sajuResult } = req.body;

  if (!myData || !sajuResult) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hasTarget = targetData && targetData.birthdate;
  const accuracyLevel = sajuResult.accuracyLevel || 'year';

  const systemPrompt = `당신은 사주명리학 전문가입니다. TOXIC 서비스의 핵심 철학인 "왜 안맞는지"를 사주로 설명합니다.
- 기존 궁합 서비스처럼 "잘 맞는 사람"을 찾아주는 게 아니라, 갈등과 충돌의 구조적 이유를 설명합니다.
- 날카롭고 직접적으로, 공감 가는 언어로 작성합니다.
- 위로나 희망적인 말은 최소화하고 갈등의 본질을 파고듭니다.
- 한국어로 작성합니다.`;

  let userPrompt: string;

  if (hasTarget) {
    userPrompt = `다음 두 사람의 사주 분석 결과를 바탕으로 갈등 해석 텍스트를 작성해주세요.

[나]
- 이름: ${myData.name || '나'}
- 생년월일: ${myData.birthdate}
- 성별: ${myData.gender}
- 년주: ${sajuResult.myYear.stem}${sajuResult.myYear.branch} (${sajuResult.myYear.ohaeng})
- 월주: ${sajuResult.myMonth ? sajuResult.myMonth.stem + sajuResult.myMonth.branch : '미입력'}
- 일주: ${sajuResult.myDay ? sajuResult.myDay.stem + sajuResult.myDay.branch : '미입력'}
- 시주: ${sajuResult.myHour ? sajuResult.myHour.stem + sajuResult.myHour.branch : '미입력'}

[상대]
- 이름: ${targetData.name || '상대'}
- 생년월일: ${targetData.birthdate}
- 성별: ${targetData.gender || '미입력'}
- 년주: ${sajuResult.targetYear.stem}${sajuResult.targetYear.branch} (${sajuResult.targetYear.ohaeng})
- 월주: ${sajuResult.targetMonth ? sajuResult.targetMonth.stem + sajuResult.targetMonth.branch : '미입력'}
- 일주: ${sajuResult.targetDay ? sajuResult.targetDay.stem + sajuResult.targetDay.branch : '미입력'}

[관계 유형] ${relationType}
[분석 정확도] ${accuracyLevel}
[충돌 지수] ${sajuResult.toxicScore}점

[충·형·해·파·합 관계]
- 충(沖): ${sajuResult.conflicts.chung.map((c: { name: string }) => c.name).join(', ') || '없음'}
- 형(刑): ${sajuResult.conflicts.hyung.map((h: { name: string }) => h.name).join(', ') || '없음'}
- 해(害): ${sajuResult.conflicts.hae.map((h: { name: string }) => h.name).join(', ') || '없음'}
- 파(破): ${sajuResult.conflicts.pa.map((p: { name: string }) => p.name).join(', ') || '없음'}
- 합(合): ${sajuResult.conflicts.hap.map((h: { name: string }) => h.name).join(', ') || '없음'}
- 오행 극: ${sajuResult.conflicts.geuk.direction || '없음'}

다음 형식으로 JSON을 반환해주세요:
{
  "mainAnalysis": "핵심 갈등 원인 (2-3문장, 강렬하고 직접적으로)",
  "chungAnalysis": "충 관계 해석 (충 있으면 상세히, 없으면 null)",
  "hyungAnalysis": "형 관계 해석 (형 있으면 상세히, 없으면 null)",
  "haeAnalysis": "해 관계 해석 (해 있으면 상세히, 없으면 null)",
  "geukAnalysis": "오행 극 해석 (극 있으면 상세히, 없으면 null)",
  "relationshipDynamic": "${relationType} 관계에서 구체적으로 어떤 상황에서 충돌이 생기는지 (2-3문장)",
  "escapeAdvice": "이 관계를 어떻게 대처할지 현실적인 조언 (희망적이지 않게, 1-2문장)",
  "toxicSummary": "한 줄 핵심 요약 (SNS 공유용, 20자 이내)"
}`;
  } else {
    userPrompt = `다음 사주를 가진 사람이 어떤 유형과 충돌하는지 "내 위험 유형 역산" 분석을 해주세요.

[나]
- 이름: ${myData.name || '나'}
- 생년월일: ${myData.birthdate}
- 성별: ${myData.gender}
- 년주: ${sajuResult.myYear.stem}${sajuResult.myYear.branch} (${sajuResult.myYear.ohaeng})
- 월주: ${sajuResult.myMonth ? sajuResult.myMonth.stem + sajuResult.myMonth.branch : '미입력'}
- 일주: ${sajuResult.myDay ? sajuResult.myDay.stem + sajuResult.myDay.branch : '미입력'}
- 시주: ${sajuResult.myHour ? sajuResult.myHour.stem + sajuResult.myHour.branch : '미입력'}

[나의 충 구조]
- 충 유발 지지: ${sajuResult.myDangerBranches?.join(', ') || '계산 중'}
- 극 유발 오행: ${sajuResult.myDangerOhaeng?.join(', ') || '계산 중'}

다음 형식으로 JSON을 반환해주세요:
{
  "myCharacter": "나의 사주 기질 설명 (2문장, 강점과 약점 포함)",
  "dangerTypes": [
    {
      "type": "충돌 유형 이름 (예: 인신충 유발형)",
      "description": "이 유형과 왜 충돌하는지 (2문장)",
      "realExample": "실생활에서 어떤 상황에서 충돌하는지"
    }
  ],
  "warningPattern": "내가 반복하는 갈등 패턴 (2문장)",
  "toxicSummary": "나의 독성 요약 한 줄 (SNS 공유용, 20자 이내)"
}`;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
