import { Account, Client, Models } from "appwrite";
import { Storage } from "appwrite";
import { stringify } from "querystring";

export function getAppwriteClient(): Client {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

  const client = new Client().setEndpoint(endpoint).setProject(project);
  return client;
}
export function getPictureUrl(id: string) {
  const client = getAppwriteClient();
  const storage = new Storage(client);
  return storage.getFileDownload("listings", id);
}

export function getCompletionPictureUrl(id: string) {
  const client = getAppwriteClient();
  const storage = new Storage(client);
  return storage.getFileDownload("completion", id);
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  const account = new Account(getAppwriteClient());

  try {
    const u = await account.get();
    return u;
  } catch (e) {
    return null;
  }
}

//may be it is not good...
export async function getDBId(dbName: string): Promise<string> {
  const map = new Map<string, string>();
  map.set("database", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!);
  map.set("team", process.env.NEXT_PUBLIC_TEAM_COLLECTION_ID!);
  map.set("user", process.env.NEXT_PUBLIC_USER_COLLECTION_ID!);
  map.set("device", process.env.NEXT_PUBLIC_DEVICE_COLLECTION_ID!);
  map.set("container", process.env.NEXT_PUBLIC_CONTAINER_COLLECTION_ID!);

  return map.get(dbName)!;
}
