"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyze = () => {
    // Placeholder for actual analysis logic
    if (inputText.trim() === "") {
      setAnalysisResult("분석할 텍스트를 입력해주세요.");
      return;
    }
    const placeholderResult = `입력된 텍스트: "${inputText}"\n\n분석 결과는 다음과 같습니다.\n격식 점수: 2 (비격식)\n친근한 헤요체(예: 있잖아요, 거죠, 거예요, 하죠 등)와 구어적 표현이 일관되게 사용되어 공식적이거나 격식을 차린 표현은 거의 없음.\n스타일 점수: 2 (과업지향적)\n감정 표현보다는 설명과 정보 전달에 집중되어 있으며, 직접적이고 구어적인 설명 방식이 주를 이룸.\n\n즉, 전체적으로 친근하고 비격식적인 헤요체, 구어적 표현이 많이 사용된 과업지향적 텍스트로 진단되었습니다.`;
    setAnalysisResult(placeholderResult);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-semibold mb-4">톤 진단하기</h1>
          <Textarea
            placeholder="분석할 한국어 텍스트를 입력해 주세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={15}
            className="text-base"
          />
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>톤 진단</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAnalyze} className="w-full">
                톤 진단하기
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>톤 진단 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult}</p>
              </CardContent>
            </Card>
          )}

          {!analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>톤 진단 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  대상 텍스트를 좌측에 입력하고 톤 진단 결과를 받아보세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
