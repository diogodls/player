import styles from './TeamActions.module.scss';
import {useContext, useMemo} from "react";
import type {Action} from "../../../pages/Analysis";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type {ActionTagged} from "../../../pages/Analysis";
import { uid } from 'uid';
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";
import type {ActionGroup} from "../../elements/ActionsList/ActionsList.tsx";
import type {Session} from "../../../pages/Sessions";
import {ToastContext} from "../../../contexts/ToastContext/ToastContext.tsx";

type TeamActions = {
  actions: Action[];
  session: Session;
}

type TeamActionSubcategory = {
  title: string;
  actionKeys: string[];
};

type TeamActionCategory = {
  title: string;
  categoryMatcher: (category: string) => boolean;
  subcategories: TeamActionSubcategory[];
};

type TeamActionCategoryGroup = {
  title: string;
  groups: ActionGroup[];
};

const teamActionCategories: TeamActionCategory[] = [
  {
    title: "Ações ofensivas",
    categoryMatcher: (category) => category.toLowerCase().includes("ofensiv"),
    subcategories: [
      {
        title: "Bola Parada",
        actionKeys: ["BPBE", "BPME", "BPSE", "GBP"],
      },
      {
        title: "Organização Ofensiva",
        actionKeys: ["GAP", "PPAP"],
      },
      {
        title: "Transição Ofensiva",
        actionKeys: ["GT", "GSP", "PPT", "PPSP"],
      },
      {
        title: "Goleiro Linha",
        actionKeys: ["GGL", "PPGL"],
      },
    ],
  },
  {
    title: "Ações defensivas",
    categoryMatcher: (category) => category.toLowerCase().includes("defensiv"),
    subcategories: [
      {
        title: "Organização Defensiva",
        actionKeys: ["MBRP", "MBGT", "PRP", "PRGT"],
      },
      {
        title: "Transição Defensiva",
        actionKeys: ["VRP", "VGT", "TRP", "TGT"],
      },
    ],
  },
];

function groupTeamActions(actions: Action[]): TeamActionCategoryGroup[] {
  const actionsByKey = new Map(actions.map((action) => [action.key, action]));
  const groupedActionKeys = new Set<string>();

  const categoryGroups = teamActionCategories.map((category) => {
    const groups = category.subcategories
      .map((subcategory) => {
        const groupedActions = subcategory.actionKeys
          .map((key) => actionsByKey.get(key))
          .filter((action): action is Action => Boolean(action));

        groupedActions.forEach((action) => groupedActionKeys.add(action.key));

        return {
          title: subcategory.title,
          actions: groupedActions,
        };
      })
      .filter((group) => group.actions.length > 0);

    const uncategorizedActions = actions.filter((action) =>
      category.categoryMatcher(action.category) && !groupedActionKeys.has(action.key)
    );

    if (uncategorizedActions.length > 0) {
      uncategorizedActions.forEach((action) => groupedActionKeys.add(action.key));

      groups.push({
        title: "Outras ações",
        actions: uncategorizedActions,
      });
    }

    return {
      title: category.title,
      groups,
    };
  });

  const remainingActions = actions.filter((action) => !groupedActionKeys.has(action.key));

  remainingActions.forEach((action) => {
    const existingCategoryGroup = categoryGroups.find((group) => group.title === action.category);

    if (existingCategoryGroup) {
      existingCategoryGroup.groups[0].actions.push(action);
    } else {
      categoryGroups.push({
        title: action.category,
        groups: [
          {
            title: action.category,
            actions: [action],
          },
        ],
      });
    }
  });

  return categoryGroups.filter((category) => category.groups.length > 0);
}

const TeamActions = ({actions, session}: TeamActions) => {
  const {setTeamActions, currentVideoTime, videoRef} = useContext(ActionsContext);
  const {error} = useContext(ToastContext);

  const handleActionClick = (action: Action) => {
    if (!videoRef.current) {
      error("O vídeo precisa estar definido");
      return;
    }

    const actionTagged = {
      id: uid(),
      sessionId: session.id,
      goodAction: action.goodAction,
      title: action.label,
      key: action.key,
      category: action.category,
      time: currentVideoTime,
      type: 'team'
    } as ActionTagged;

    setTeamActions((actions) => [...actions, actionTagged]);
  }

  const groupedActions = useMemo(() => groupTeamActions(actions), [actions]);

  return (
    <div className={`${styles.teamActions} ${styles.actionsListPadding}`}>
      {groupedActions.map((category) => (
        <section className={styles.categorySection} key={category.title}>
          <span className={styles.categoryTitle}>{category.title}</span>
          <ActionsList
            actions={actions}
            groups={category.groups}
            handleActionClick={handleActionClick}
            className={styles.subcategoryList}
            sticky={false}
          />
        </section>
      ))}
    </div>
  );
};

export default TeamActions;
