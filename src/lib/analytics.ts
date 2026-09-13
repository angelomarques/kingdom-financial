import { PostHog } from "posthog-node";

type CaptureProps = Record<string, string | number | boolean | null>;

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) {
    return client;
  }

  const key = process.env.POSTHOG_KEY?.trim();
  if (!key) {
    client = null;
    return client;
  }

  client = new PostHog(key, {
    host: process.env.POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export function capture(event: string, properties: CaptureProps = {}): void {
  const posthog = getClient();
  if (!posthog) {
    return;
  }

  posthog.capture({
    distinctId: "angelo",
    event,
    properties,
  });
}

export function analyticsMode(): "posthog" | "disabled" {
  return getClient() ? "posthog" : "disabled";
}
