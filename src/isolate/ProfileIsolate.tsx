import { createMemo, createSignal } from "solid-js";

import { InstalledModListIsolate, ModInstallContext } from "./ModListIsolate";

import styles from "./Profile.module.css";
import { type ModPackage } from "../types";

// Dummy mod data for testing
const DUMMY_INSTALLED_MODS: ModPackage[] = [
  {
    name: "BepInExPack",
    owner: "BepInEx",
    date_created: "2021-01-15T10:00:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Modding", "Libraries"],
    version: {
      description:
        "BepInEx pack for Thunderstore. Preconfigured and includes Unity 5.x, Unity 2017.x, Unity 2018.x and Unity 2019.x.",
      version_number: "5.4.2100",
      dependencies: [],
      downloads: 1500000,
      date_created: "2023-01-15T10:00:00Z",
      website_url: "https://github.com/BepInEx/BepInEx",
      is_active: true,
      file_size: 8388608, // 8MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "HookGenPatcher",
    owner: "RiskofThunder",
    date_created: "2021-03-20T14:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "Generates MMHOOK files for easy hooking",
      version_number: "1.2.3",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 850000,
      date_created: "2023-05-12T14:30:00Z",
      website_url: "https://github.com/RiskofThunder/HookGenPatcher",
      is_active: true,
      file_size: 2097152, // 2MB
    },
  },
  {
    name: "R2API",
    owner: "RiskofThunder",
    date_created: "2021-02-10T09:15:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries"],
    version: {
      description: "A modding API for Risk of Rain 2",
      version_number: "5.0.11",
      dependencies: ["BepInEx-BepInExPack-5.4.2100", "RiskofThunder-HookGenPatcher-1.2.3"],
      downloads: 1200000,
      date_created: "2023-11-01T09:15:00Z",
      is_active: true,
      file_size: 5242880, // 5MB
    },
  },
  {
    name: "ProperSave",
    owner: "KingEnderBrine",
    date_created: "2021-04-05T16:45:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Misc"],
    version: {
      description: "Save and load your run progress. This is super useful for long runs!",
      version_number: "3.0.1",
      dependencies: ["BepInEx-BepInExPack-5.4.2100", "RiskofThunder-R2API-5.0.11"],
      downloads: 500000,
      date_created: "2023-09-18T16:45:00Z",
      website_url: "https://github.com/KingEnderBrine/RoR2-ProperSave",
      is_active: true,
      file_size: 1048576, // 1MB
    },
  },
  {
    name: "ShareSuite",
    owner: "FunkFrog_and_Sipondo",
    date_created: "2021-01-25T11:20:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Multiplayer Compatibility"],
    version: {
      description: "An extensive item and money sharing mod for multiplayer",
      version_number: "2.9.4",
      dependencies: ["BepInEx-BepInExPack-5.4.2100", "RiskofThunder-R2API-5.0.11"],
      downloads: 750000,
      date_created: "2023-07-22T11:20:00Z",
      website_url: "https://github.com/FunkFrog/RoR2SharedItems",
      is_active: true,
      file_size: 3145728, // 3MB
    },
  },
  {
    name: "BiggerBazaar",
    owner: "MagnusMagnuson",
    date_created: "2022-06-12T13:00:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Items", "Misc"],
    version: {
      description: "Adds more items to the Bazaar Between Time shop",
      version_number: "1.3.0",
      dependencies: ["BepInEx-BepInExPack-5.4.2100", "RiskofThunder-R2API-5.0.11"],
      downloads: 125000,
      date_created: "2023-08-05T13:00:00Z",
      is_active: true,
      file_size: 524288, // 512KB
    },
  },
  {
    name: "DropInMultiplayer",
    owner: "Morris1927",
    date_created: "2021-05-30T18:30:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Multiplayer Compatibility"],
    version: {
      description: "Allows players to join in the middle of a run",
      version_number: "1.0.5",
      dependencies: ["BepInEx-BepInExPack-5.4.2100"],
      downloads: 620000,
      date_created: "2023-04-14T18:30:00Z",
      website_url: "https://github.com/Morris1927/DropInMultiplayer",
      is_active: true,
      file_size: 262144, // 256KB
    },
  },
  {
    name: "RiskOfOptions",
    owner: "Rune580",
    date_created: "2021-08-17T10:45:00Z",
    is_deprecated: false,
    has_nsfw_content: false,
    categories: ["Libraries", "Misc"],
    version: {
      description: "In-game mod config menu",
      version_number: "2.8.2",
      dependencies: ["BepInEx-BepInExPack-5.4.2100", "RiskofThunder-R2API-5.0.11"],
      downloads: 980000,
      date_created: "2023-10-03T10:45:00Z",
      website_url: "https://github.com/Rune580/RiskOfOptions",
      is_active: true,
      file_size: 1572864, // 1.5MB
    },
  },
];

const DUMMY_GAME_ID = "risk-of-rain-2";

export default function ProfileIsolate() {
  const [installedMods] = createSignal(DUMMY_INSTALLED_MODS);
  const profileId = () => "dummy-profile-id";

  const refetchInstalled = async () => {
    console.log("Refetch installed mods (no-op in isolated mode)");
  };

  const installed = createMemo(() => installedMods());

  return (
    <main class={styles.main}>
      <div class={styles.content}>
        <ModInstallContext.Provider
          value={{
            profileId,
            installed: {
              latest: installed(),
              loading: false,
              error: undefined,
              state: "ready",
            } as any,
            refetchInstalled,
          }}
        >
          <InstalledModListIsolate game={DUMMY_GAME_ID} />
        </ModInstallContext.Provider>
      </div>
    </main>
  );
}
