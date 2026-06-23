"use client";

import { useCallback, useState } from "react";
import { Sampler } from "./Sampler";
import { DitherWaves } from "./DitherWaves";

export function SamplerStage() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const onAnalyserReady = useCallback((a: AnalyserNode | null) => {
    setAnalyser(a);
  }, []);

  return (
    <>
      <DitherWaves analyser={analyser} />
      <Sampler onAnalyserReady={onAnalyserReady} />
    </>
  );
}
