export type CloudBasePrompt = Partial<{
  paidPlan: boolean;
  automaticRenewal: boolean;
  credentialPrompt: boolean;
  broaderPermission: boolean;
}>;

export function evaluateCloudBaseGate(prompt: CloudBasePrompt): { allowed: boolean; reasons: string[] } {
  const reasons = [
    prompt.paidPlan ? "paid-plan" : undefined,
    prompt.automaticRenewal ? "automatic-renewal" : undefined,
    prompt.credentialPrompt ? "credential-prompt" : undefined,
    prompt.broaderPermission ? "broader-permission" : undefined,
  ].filter((reason): reason is string => Boolean(reason));
  return { allowed: reasons.length === 0, reasons };
}
