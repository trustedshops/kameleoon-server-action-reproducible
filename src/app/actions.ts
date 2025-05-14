"use server";

import { KameleoonClient } from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { KameleoonRequester } from "@kameleoon/nodejs-requester";
import { KameleoonVisitorCodeManager } from "@kameleoon/nextjs-visitor-code-manager";
import { cookies } from "next/headers";

type KameleoonFeatureFlags = "engineering-testing" | "kameleoon-test";

const env = {
  NEXT_PUBLIC_KAMELEOON_SITE_CODE: "xccc0st6d7",
  KAMELEOON_CLIENT_ID: "client-id",
  KAMELEOON_CLIENT_SECRET: "client-secret",
  NODE_ENV: "development",
};

/**
 * Initialize and get Kameleoon client instance
 */
async function getKameleoonClient(): Promise<KameleoonClient> {
  const client: KameleoonClient = new KameleoonClient({
    siteCode: env.NEXT_PUBLIC_KAMELEOON_SITE_CODE,
    credentials: {
      clientId: env.KAMELEOON_CLIENT_ID,
      clientSecret: env.KAMELEOON_CLIENT_SECRET,
    },
    externals: {
      visitorCodeManager: new KameleoonVisitorCodeManager(),
      eventSource: new KameleoonEventSource(),
      requester: new KameleoonRequester(),
    },
    configuration: {
      environment: env.NODE_ENV,
    },
  });
  await client.initialize();
  return client;
}

/**
 * Get the current variant for a specific feature flag
 * @param featureFlag - The feature flag key to check
 * @returns The variant key if available, or null if not available
 */
export async function getVariantAction(featureFlag: KameleoonFeatureFlags) {
  try {
    const kameleoonClient = await getKameleoonClient();
    const cookie = await cookies();

    const visitorCodeId = kameleoonClient.getVisitorCode({
      cookies: () => cookie,
    });

    const featureFlagVariation = await kameleoonClient.getVariation({
      visitorCode: visitorCodeId,
      featureKey: featureFlag,
    });

    if (featureFlagVariation) {
      console.log(featureFlagVariation);
      return featureFlagVariation;
    }

    return null;
  } catch (error) {
    console.error(
      `Error getting variant for feature flag ${featureFlag}:`,
      error
    );
    return null;
  }
}
