import { base44 } from "@/api/base44Client";

// Auto-transcription runs one call at a time so a long list of recordings
// doesn't fire dozens of parallel transcription jobs.
let chain = Promise.resolve();

export function enqueueTranscribe(recordId) {
  const run = chain.then(() => base44.functions.invoke("transcribeRecording", { recordId }));
  chain = run.catch(() => {});
  return run;
}

export function enqueueSummarize(recordId) {
  const run = chain.then(() => base44.functions.invoke("summarizeCall", { recordId }));
  chain = run.catch(() => {});
  return run;
}