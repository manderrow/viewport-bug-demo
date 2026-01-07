import { faHardDrive } from "@fortawesome/free-regular-svg-icons";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Fa } from "solid-fa";
import {
  type Accessor,
  For,
  type InitializedResource,
  type JSX,
  Match,
  Show,
  Switch,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSelector,
  createSignal,
  untrack,
  useContext,
} from "solid-js";

import { type ModPackage } from "../types";
import { createMultiselectableList, humanizeFileSize, numberFormatter } from "../utils";

import styles from "./ModList.module.css";
import { t } from "../i18n/i18n";
import Checkbox from "../components/global/Checkbox";

enum ModSortColumn {
  Relevance = "relevance",
  Downloads = "downloads",
  Name = "name",
  Owner = "owner",
  Size = "size",
}

interface SortOption<C> {
  column: C;
  descending: boolean;
}

// Dummy types for isolation
export type ModId = { owner: string; name: string };

type PageFetcher = (page: number) => Promise<readonly ModPackage[]>;
type ModFetcherResult = {
  count: number;
  mods: PageFetcher;
  get: (id: ModId) => Promise<ModPackage | undefined> | ModPackage | undefined;
};
export type Fetcher = (
  game: string,
  query: string,
  sort: readonly SortOption<ModSortColumn>[]
) => Promise<ModFetcherResult>;

export const ModInstallContext = createContext<{
  profileId: Accessor<string>;
  installed: InitializedResource<readonly ModPackage[]>;
  refetchInstalled: () => Promise<void>;
}>();

function modIdEquals(a: ModId | ModPackage, b: ModId): boolean {
  const aId = "version" in a ? { owner: a.owner, name: a.name } : a;
  return aId.owner === b.owner && aId.name === b.name;
}

// Dummy progress type
type Progress = { percent: number };
const initProgress = (): Progress => ({ percent: 0 });

export default function ModListIsolate(props: {
  game: string;
  mods: Fetcher;
  refresh: () => Promise<void> | void;
  isLoading: boolean;
  progress: Progress;
  trailingControls?: JSX.Element;
  multiselect: boolean;
}) {
  const [focusedModId, setFocusedModId] = createSignal<ModId>();

  const [query, setQuery] = createSignal("");

  const [sort] = createSignal<readonly SortOption<ModSortColumn>[]>([
    { column: ModSortColumn.Relevance, descending: true },
    { column: ModSortColumn.Downloads, descending: true },
    { column: ModSortColumn.Name, descending: false },
    { column: ModSortColumn.Owner, descending: false },
    { column: ModSortColumn.Size, descending: true },
  ]);

  const [queriedMods] = createResource(
    () => {
      try {
        props.mods;
      } catch {}
      return [props.game, query(), sort()] as [string, string, readonly SortOption<ModSortColumn>[]];
    },
    ([game, query, sort]) => untrack(() => props.mods)(game, query, sort),
    { initialValue: { mods: async (_: number) => [], count: 0, get: (_: ModId) => undefined } }
  );

  const installContext = useContext(ModInstallContext)!;

  const { onCtrlClickItem, onShiftClickItem, isPivot, selected } = createMultiselectableList<ModPackage, ModId, string>(
    () => installContext.installed.latest,
    (mod) => ({ owner: mod.owner, name: mod.name } as ModId),
    (mod) => mod.version.version_number,
    () => undefined
  );

  const isSelectedMod = createSelector<Map<ModId, string>, ModId>(selected, (id, selected) => selected.has(id));

  return (
    <div class={styles.modListAndView}>
      <div class={styles.modListContainer}>
        {/* Search stubbed out for isolation - not needed for CSS debugging */}
        <div style={{ padding: "1rem" }}>
          <input
            type="text"
            placeholder="Search for mods (disabled in isolated mode)"
            value={query()}
            on:input={(e) => setQuery(e.target.value)}
            disabled
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div class={styles.discoveredLine}>
          <Switch>
            <Match when={props.isLoading || queriedMods.loading}>
              <span>{t("modlist.fetching_msg")}</span>
            </Match>
            <Match when={queriedMods.error}>{(err) => <p>{err()}</p>}</Match>
            <Match when={queriedMods.latest}>
              <span>{t("modlist.discovered_msg", { count: numberFormatter.format(queriedMods()!.count) })}</span>

              <button class={styles.refreshButton} on:click={props.refresh}>
                <Fa icon={faRefresh} />
              </button>
            </Match>
          </Switch>

          <Show when={props.trailingControls}>
            <div class={styles.trailingControls}>{props.trailingControls}</div>
          </Show>
        </div>

        <Show when={queriedMods.error === undefined && queriedMods()} keyed>
          {(mods) => (
            <ModListMods
              mods={mods.mods}
              focusedMod={[focusedModId, setFocusedModId]}
              isSelected={isSelectedMod}
              select={onCtrlClickItem}
              shiftClick={onShiftClickItem}
              isPivot={isPivot}
              forceSelectorVisibility={selected().size !== 0}
            />
          )}
        </Show>
      </div>

      <div class={styles.modViewContainer}>
        <div class={styles.modView}>
          <div class={styles.nothingMsg}>
            <h2>{t("modlist.modview.no_mod_selected_title")}</h2>
            <p>{t("modlist.modview.no_mod_selected_subtitle")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstalledModListIsolate(props: { game: string }) {
  const context = useContext(ModInstallContext)!;

  const [progress] = createSignal<Progress>(initProgress());

  const getFetcher: () => Fetcher = () => {
    const data = context.installed.latest;

    return async (_game, _query, _sort) => {
      // TODO: implement filter and sort

      return {
        count: data.length,
        mods: async (page) => (page === 0 ? data : []),
        get: (id) => data.find((mod) => modIdEquals(mod, id)),
      };
    };
  };

  return (
    <Show
      when={context.installed.latest.length !== 0}
      fallback={
        <div class={styles.noModsMessage}>
          <h2>{t("modlist.installed.no_mods_title")}</h2>
          <p>{t("modlist.installed.no_mods_msg")}</p>

          <div class={styles.noModsMessage__btns}>
            <button data-btn="primary">{t("modlist.installed.browse_btn")}</button>
          </div>
        </div>
      }
    >
      <ModListIsolate
        game={props.game}
        isLoading={false}
        progress={progress()}
        refresh={context.refetchInstalled}
        mods={getFetcher()}
        multiselect={true}
      />
    </Show>
  );
}

type SelectableModListProps = {
  /// Whether the mod is selected in the ModList (for bulk actions)
  isSelected: (mod: ModId) => boolean;
  select: (item: ModPackage, index: number) => void;
  shiftClick: (item: ModPackage, index: number) => void;
  isPivot: (mod: ModPackage | undefined) => boolean;
  forceSelectorVisibility: boolean;
};

// Simplified ModListMods component without infinite scrolling
function ModListMods(
  props: {
    mods: PageFetcher;
    focusedMod: [Accessor<ModId | undefined>, (id: ModId | undefined) => void];
  } & Partial<SelectableModListProps>
) {
  const [allMods, setAllMods] = createSignal<ModPackage[]>([]);

  createEffect(async () => {
    // Load all mods from first page (since we're only showing installed mods, there should be just one page)
    const mods = await props.mods(0);
    setAllMods(mods as ModPackage[]);
  });

  const isFocusedMod = createSelector<ModId | undefined, ModId>(
    props.focusedMod[0],
    (a, b) => b !== undefined && modIdEquals(a, b)
  );

  return (
    <div class={styles.modList}>
      <For each={allMods()}>
        {(mod, index) => (
          <ModListItem
            mod={mod}
            isSelected={() => props.isSelected!({ owner: mod.owner, name: mod.name })}
            isFocused={isFocusedMod}
            setFocused={() => props.focusedMod[1]({ owner: mod.owner, name: mod.name })}
            select={() => props.select!(mod, index())}
            shiftClick={() => props.shiftClick!(mod, index())}
            isPivot={props.isPivot!(mod)}
            forceSelectorVisibility={props.forceSelectorVisibility || false}
          />
        )}
      </For>
    </div>
  );
}

function getIconUrl(qualifiedModName: string) {
  return `https://gcdn.thunderstore.io/live/repository/icons/${qualifiedModName}.png`;
}
function getQualifiedModName(owner: string, name: string, version: string) {
  return `${owner}-${name}-${version}`;
}

function ModListItem(
  props: {
    mod: ModPackage;
    /// Whether the mod is focused in the ModView
    isFocused: (mod: ModId) => boolean;
    setFocused: (mod: ModId | undefined) => void;
    forceSelectorVisibility: boolean;
    select?: () => void;
    shiftClick?: () => void;
    isSelected?: () => boolean;
    isPivot?: boolean;
    // setModSelectorTutorialState: (hovered: boolean) => void,
  } & (Omit<Partial<SelectableModListProps>, "select" | "shiftClick" | "isPivot"> | {})
) {
  const displayVersion = createMemo(() => {
    return props.mod.version;
  });

  return (
    <li
      classList={{
        [styles.mod]: true,
      }}
    >
      <div
        onClick={(e) => {
          if (e.shiftKey && "shiftClick" in props) {
            props.shiftClick!();
          } else {
            props.select!();
          }
        }}
        onKeyDown={(key) => {
          if (key.key === "Enter") props.select!();
        }}
        class={styles.mod__btn}
        role="button"
        tabIndex={0}
      >
        <Show when={props.isSelected !== undefined}>
          <div class={styles.mod__selector} data-always-show={props.forceSelectorVisibility ? "" : undefined}>
            <Checkbox
              checked={props.isSelected!({ owner: props.mod.owner, name: props.mod.name })}
              onChange={() => props.select!()}
              labelClass={styles.mod__selectorClickRegion}
              iconContainerClass={styles.mod__selectorIndicator}
            />
          </div>
        </Show>
        <div class={styles.mod__btnContent}>
          <img
            class={styles.modIcon}
            width={64}
            alt="mod icon"
            src={getIconUrl(getQualifiedModName(props.mod.owner, props.mod.name, displayVersion().version_number))}
          />
          <div class={styles.mod__content}>
            <div class={styles.left}>
              <p class={styles.info}>
                <span class={styles.name}>{props.mod.name}</span>
                <span class={styles.separator} aria-hidden>
                  &bull;
                </span>
                <span class={styles.medHierarchy}>{props.mod.owner}</span>
                <Show when={"version" in props.mod}>
                  <span class={styles.separator} aria-hidden>
                    &bull;
                  </span>
                  <span class={styles.version}>{(props.mod as ModPackage).version.version_number}</span>
                </Show>
              </p>
              <p class={styles.info}>
                <Switch>
                  <Match when={"version" in props.mod}>
                    <span class={styles.lowHierarchy}>
                      <Fa icon={faHardDrive} /> {humanizeFileSize((props.mod as ModPackage).version.file_size)}
                    </span>
                  </Match>
                </Switch>
              </p>
              <p class={styles.description}>{displayVersion().description}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
