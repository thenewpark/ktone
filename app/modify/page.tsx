"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ModifyPage() {
  const [inputText, setInputText] = useState("");
  const [formalValue, setFormalValue] = useState<number[]>([3]);
  const [taskOrientedValue, setTaskOrientedValue] = useState<number[]>([3]);
  const [suggestionResult, setSuggestionResult] = useState<string | null>(null);

  const handleSuggestModification = async () => {
    if (inputText.trim() === "") {
      setSuggestionResult("수정할 텍스트를 입력해주세요.");
      return;
    }
    setSuggestionResult("수정 중입니다...");

    const res = await fetch("/api/modify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: inputText,
        style: taskOrientedValue[0], // 1~5
        formality: formalValue[0], // 1~5
      }),
    });
    const data = await res.json();

    setSuggestionResult(data.result);
  };

  const sliderLabelsFormal = ["1 매우 격식", "2 격식", "3 중립", "4 비격식", "5 매우 비격식"];
  const sliderLabelsTask = ["1 극히 과업지향적", "2 과업지향적", "3 균형", "사회정서적", "5 극히 사회정서적"];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-semibold mb-4">톤 수정 제안</h1>
          <Textarea
            placeholder="수정할 한국어 텍스트를 입력해 주세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={15}
            className="text-base"
          />
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>톤 설정</CardTitle>
              <CardDescription>원하는 톤을 슬라이더로 조절하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label htmlFor="formal-slider" className="text-sm">
                    격식도
                  </Label>
                  <span className="text-sm font-medium text-primary">{sliderLabelsFormal[formalValue[0] - 1]}</span>
                </div>
                <Slider
                  id="formal-slider"
                  min={1}
                  max={5}
                  step={1}
                  value={formalValue}
                  onValueChange={setFormalValue}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-4">
                  <span>격식</span>
                  <span>비격식</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label htmlFor="task-slider" className="text-sm">
                    스타일
                  </Label>
                  <span className="text-sm font-medium text-primary">{sliderLabelsTask[taskOrientedValue[0] - 1]}</span>
                </div>
                <Slider
                  id="task-slider"
                  min={1}
                  max={5}
                  step={1}
                  value={taskOrientedValue}
                  onValueChange={setTaskOrientedValue}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-4">
                  <span>과업지향적</span>
                  <span>사회정서적</span>
                </div>
              </div>
              <Button onClick={handleSuggestModification} className="w-full">
                톤 수정 제안 받기
              </Button>
            </CardContent>
          </Card>

          {suggestionResult && (
            <Card>
              <CardHeader>
                <CardTitle>수정 제안 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestionResult}</p>
              </CardContent>
            </Card>
          )}
          {!suggestionResult && (
            <Card>
              <CardHeader>
                <CardTitle>수정 제안 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  대상 텍스트를 좌측에 입력하고 톤을 설정한 뒤 수정 제안을 받아보세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
