import config from "config";
import path from "path";
import fs from "fs";
import IProfile from "@type-definitions/IProfile";

export function getProfile(): IProfile {
  const inputDirectoryPath = config.get("inputDataDirectoryPath") as string;
  const profileJsonFilePath = path.join(inputDirectoryPath, "profile.json");

  const profile = JSON.parse(
    fs.readFileSync(profileJsonFilePath, { encoding: "utf-8", flag: "r" })
  ) as IProfile;

  return profile;
}
