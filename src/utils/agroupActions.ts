import type {Action} from "../pages/Analysis";

export function agroupActions(actions: Action[]) {
  return actions.reduce((acc, action) => {
    const formattedAction = {
      label: action.label,
      key: action.key,
      goodAction: action.goodAction,
    };

    if (!acc[action.category]) {
      acc[action.category] = [formattedAction];
    } else {
      acc[action.category] = [...acc[action.category], formattedAction];
    }
    return acc;
  }, {} as Record<string, { label: string, key: string, goodAction: boolean }[]>)
}